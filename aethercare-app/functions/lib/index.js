"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFinalReport = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("@google-cloud/storage");
const pdfParse = require('pdf-parse');
const pdf_lib_1 = require("pdf-lib");
const node_fetch_1 = __importDefault(require("node-fetch"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// Initialize Google Cloud Storage
const storage = new storage_1.Storage();
/**
 * Helper function to extract storage path from URL if needed
 */
function extractStoragePathFromUrl(urlOrPath) {
    if (urlOrPath.startsWith('gs://')) {
        // Already a storage path, just remove the gs:// prefix
        return urlOrPath.replace('gs://', '').split('/').slice(1).join('/');
    }
    else if (urlOrPath.includes('firebasestorage.googleapis.com')) {
        // It's a download URL, extract the path
        try {
            const url = new URL(urlOrPath);
            const pathMatch = url.pathname.match(/\/o\/(.+)$/);
            if (pathMatch) {
                return decodeURIComponent(pathMatch[1]);
            }
        }
        catch (error) {
            console.error('Error parsing URL:', error);
        }
    }
    // Assume it's already a storage path
    return urlOrPath;
}
/**
 * Cloud Function: generateFinalReport
 *
 * This function processes medical scans and reports:
 * 1. Authenticates the user using Firebase Auth
 * 2. Downloads image and PDF files from Firebase Storage
 * 3. Analyzes the image using Hugging Face's radiology model
 * 4. Extracts text from the PDF and summarizes it using Google Gemini
 * 5. Generates a comprehensive final report PDF
 * 6. Uploads the final report back to Firebase Storage
 * 7. Returns download URLs and metadata
 */
exports.generateFinalReport = functions.https.onRequest(async (request, response) => {
    // Set CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    try {
        // 1. AUTH VERIFICATION
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            response.status(401).json({ error: 'Missing or invalid Authorization header' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        }
        catch (error) {
            console.error('Auth verification failed:', error);
            response.status(401).json({ error: 'Invalid authentication token' });
            return;
        }
        const uid = decodedToken.uid;
        // 2. INPUT VALIDATION - Require at least one file (image or PDF)
        const { imageStoragePath, pdfStoragePath, imageUrl, pdfUrl } = request.body;
        const hasImage = imageStoragePath || imageUrl;
        const hasPdf = pdfStoragePath || pdfUrl;
        if (!hasImage && !hasPdf) {
            response.status(400).json({ error: 'At least one file (image or PDF) must be provided' });
            return;
        }
        // Normalize paths - use storage path if available, otherwise extract from URL
        const normalizedImagePath = hasImage ? (imageStoragePath || extractStoragePathFromUrl(imageUrl)) : null;
        const normalizedPdfPath = hasPdf ? (pdfStoragePath || extractStoragePathFromUrl(pdfUrl)) : null;
        console.log(`Processing request for user: ${uid}`);
        console.log(`Image path (normalized): ${normalizedImagePath}`);
        console.log(`PDF path (normalized): ${normalizedPdfPath}`);
        console.log(`Original image input: ${imageStoragePath || imageUrl}`);
        console.log(`Original PDF input: ${pdfStoragePath || pdfUrl}`);
        // 3. DOWNLOAD FILES FROM FIREBASE STORAGE
        const bucket = storage.bucket('aethercare-9f49b.appspot.com');
        // Download image file (if provided)
        let imageBuffer = null;
        if (normalizedImagePath) {
            try {
                console.log(`Attempting to download image from path: ${normalizedImagePath}`);
                // Check if file exists with retry mechanism (sometimes files need time to propagate)
                const imageFile = bucket.file(normalizedImagePath);
                let imageExists = false;
                let attempts = 0;
                const maxAttempts = 3;
                while (!imageExists && attempts < maxAttempts) {
                    attempts++;
                    console.log(`Checking file existence - attempt ${attempts}/${maxAttempts}`);
                    [imageExists] = await imageFile.exists();
                    if (!imageExists && attempts < maxAttempts) {
                        console.log(`File not found on attempt ${attempts}, waiting 2 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                if (!imageExists) {
                    console.error(`Image file not found at path: ${normalizedImagePath} after ${maxAttempts} attempts`);
                    response.status(404).json({
                        error: `Image file not found at path: ${normalizedImagePath}`,
                        details: `Please ensure the file was uploaded successfully and the path is correct. Checked ${maxAttempts} times.`
                    });
                    return;
                }
                const [imageData] = await imageFile.download();
                imageBuffer = imageData;
                console.log(`Successfully downloaded image: ${imageBuffer.length} bytes`);
            }
            catch (error) {
                console.error('Error downloading image:', error);
                response.status(500).json({
                    error: `Failed to download image from path: ${normalizedImagePath}`,
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
                return;
            }
        }
        else {
            console.log('No image file provided, skipping image download');
        }
        // Download PDF file (if provided)
        let pdfBuffer = null;
        if (normalizedPdfPath) {
            try {
                console.log(`Attempting to download PDF from path: ${normalizedPdfPath}`);
                // Check if file exists with retry mechanism (sometimes files need time to propagate)
                const pdfFile = bucket.file(normalizedPdfPath);
                let pdfExists = false;
                let attempts = 0;
                const maxAttempts = 3;
                while (!pdfExists && attempts < maxAttempts) {
                    attempts++;
                    console.log(`Checking PDF file existence - attempt ${attempts}/${maxAttempts}`);
                    [pdfExists] = await pdfFile.exists();
                    if (!pdfExists && attempts < maxAttempts) {
                        console.log(`PDF file not found on attempt ${attempts}, waiting 2 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                if (!pdfExists) {
                    console.error(`PDF file not found at path: ${normalizedPdfPath} after ${maxAttempts} attempts`);
                    response.status(404).json({
                        error: `PDF file not found at path: ${normalizedPdfPath}`,
                        details: `Please ensure the file was uploaded successfully and the path is correct. Checked ${maxAttempts} times.`
                    });
                    return;
                }
                const [pdfData] = await pdfFile.download();
                pdfBuffer = pdfData;
                console.log(`Successfully downloaded PDF: ${pdfBuffer.length} bytes`);
            }
            catch (error) {
                console.error('Error downloading PDF:', error);
                response.status(500).json({
                    error: `Failed to download PDF from path: ${normalizedPdfPath}`,
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
                return;
            }
        }
        else {
            console.log('No PDF file provided, skipping PDF download');
        }
        // 4. EXTRACT TEXT FROM PDF (if PDF provided)
        let pdfText = '';
        if (pdfBuffer) {
            try {
                const pdfData = await pdfParse(pdfBuffer);
                pdfText = pdfData.text;
                console.log(`Extracted PDF text: ${pdfText.length} characters`);
            }
            catch (error) {
                console.error('Error parsing PDF:', error);
                pdfText = 'PDF text extraction failed';
            }
        }
        else {
            console.log('No PDF provided, skipping text extraction');
        }
        // 5. ANALYZE IMAGE WITH HUGGING FACE (if image provided)
        let imageAnalysis = null;
        const huggingfaceApiKey = functions.config().huggingface.api_key;
        if (imageBuffer && huggingfaceApiKey) {
            try {
                console.log('Calling Hugging Face API...');
                const hfResponse = await (0, node_fetch_1.default)('https://api-inference.huggingface.co/models/prithivMLmods/Radiology-Infer-Mini', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${huggingfaceApiKey}`,
                    },
                    body: imageBuffer,
                });
                if (hfResponse.ok) {
                    const hfResult = await hfResponse.json();
                    // Extract analysis text from various possible response formats
                    if (Array.isArray(hfResult) && hfResult.length > 0) {
                        imageAnalysis = hfResult[0].generated_text ||
                            hfResult[0].text ||
                            hfResult[0].caption ||
                            'Medical image analysis completed';
                    }
                    else if (hfResult.generated_text) {
                        imageAnalysis = hfResult.generated_text;
                    }
                    else if (hfResult.text) {
                        imageAnalysis = hfResult.text;
                    }
                    else if (hfResult.caption) {
                        imageAnalysis = hfResult.caption;
                    }
                    else {
                        imageAnalysis = 'Medical image analysis completed using Radiology-Infer-Mini';
                    }
                    console.log('Hugging Face analysis completed');
                }
                else {
                    console.error('Hugging Face API error:', hfResponse.status, hfResponse.statusText);
                }
            }
            catch (error) {
                console.error('Error calling Hugging Face API:', error);
            }
        }
        else if (!imageBuffer) {
            console.log('No image provided, skipping image analysis');
        }
        else {
            console.warn('HUGGINGFACE_API_KEY not configured');
        }
        // 6. ANALYZE PDF WITH GEMINI (if PDF provided)
        let pdfSummary = null;
        const geminiApiKey = functions.config().gemini.api_key;
        if (geminiApiKey && pdfText.length > 0) {
            try {
                console.log('Calling Gemini API...');
                const geminiResponse = await (0, node_fetch_1.default)(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                                parts: [{
                                        text: `Please analyze this medical report and provide a comprehensive summary. Extract key findings, diagnoses, recommendations, test results, and any concerning areas. Format the response clearly and indicate this is AI analysis that should be verified by medical professionals.

Medical Report Content:
${pdfText}`
                                    }]
                            }],
                    }),
                });
                if (geminiResponse.ok) {
                    const geminiResult = await geminiResponse.json();
                    if (geminiResult.candidates &&
                        geminiResult.candidates.length > 0 &&
                        geminiResult.candidates[0].content &&
                        geminiResult.candidates[0].content.parts &&
                        geminiResult.candidates[0].content.parts.length > 0) {
                        pdfSummary = geminiResult.candidates[0].content.parts[0].text;
                    }
                    console.log('Gemini analysis completed');
                }
                else {
                    console.error('Gemini API error:', geminiResponse.status, geminiResponse.statusText);
                }
            }
            catch (error) {
                console.error('Error calling Gemini API:', error);
            }
        }
        else if (!pdfText.length) {
            console.log('No PDF text available, skipping PDF analysis');
        }
        else {
            console.warn('GEMINI_API_KEY not configured');
        }
        // 7. GET PATIENT DETAILS FROM FIRESTORE
        let patientData = {};
        try {
            const patientDoc = await admin.firestore().collection('patients').doc(uid).get();
            if (patientDoc.exists) {
                patientData = patientDoc.data();
                console.log('Retrieved patient data');
            }
        }
        catch (error) {
            console.error('Error fetching patient data:', error);
        }
        // 8. GENERATE COMBINED PDF REPORT
        console.log('Generating PDF report...');
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        let page = pdfDoc.addPage([612, 792]); // Letter size
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const { width, height } = page.getSize();
        let yPosition = height - 50;
        // Helper function to add text with word wrapping
        const addText = (text, fontSize, textFont, color = (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth = width - 100) => {
            const words = text.split(' ');
            let line = '';
            for (const word of words) {
                const testLine = line + word + ' ';
                const testWidth = textFont.widthOfTextAtSize(testLine, fontSize);
                if (testWidth > maxWidth && line !== '') {
                    page.drawText(line.trim(), {
                        x: 50,
                        y: yPosition,
                        size: fontSize,
                        font: textFont,
                        color: color,
                    });
                    yPosition -= fontSize + 5;
                    line = word + ' ';
                    // Add new page if needed
                    if (yPosition < 100) {
                        page = pdfDoc.addPage([612, 792]);
                        yPosition = height - 50;
                    }
                }
                else {
                    line = testLine;
                }
            }
            if (line.trim() !== '') {
                page.drawText(line.trim(), {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    font: textFont,
                    color: color,
                });
                yPosition -= fontSize + 5;
            }
            return yPosition;
        };
        // Header
        page.drawText('AetherCare - AI Health Analysis Report', {
            x: 50,
            y: yPosition,
            size: 20,
            font: boldFont,
            color: (0, pdf_lib_1.rgb)(0.2, 0.6, 0.8),
        });
        yPosition -= 40;
        // Patient Information Section
        yPosition = addText('PATIENT INFORMATION', 16, boldFont, (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3));
        yPosition -= 10;
        yPosition = addText(`Name: ${patientData.name || 'N/A'}`, 12, font);
        yPosition = addText(`Age: ${patientData.age || 'N/A'} years`, 12, font);
        yPosition = addText(`Height: ${patientData.height || 'N/A'} cm`, 12, font);
        yPosition = addText(`Weight: ${patientData.weight || 'N/A'} kg`, 12, font);
        yPosition = addText(`BMI: ${patientData.bmi || 'N/A'}`, 12, font);
        yPosition = addText(`Habits: ${patientData.habits || 'N/A'}`, 12, font);
        if (patientData.allergies) {
            yPosition = addText(`Allergies: ${patientData.allergies}`, 12, font);
        }
        if (patientData.chronicConditions) {
            yPosition = addText(`Chronic Conditions: ${patientData.chronicConditions}`, 12, font);
        }
        if (patientData.familyConditions) {
            yPosition = addText(`Family History: ${patientData.familyConditions}`, 12, font);
        }
        yPosition -= 20;
        // Image AI Analysis Section (if available)
        if (imageAnalysis) {
            yPosition = addText('IMAGE AI ANALYSIS (Radiology-Infer-Mini)', 16, boldFont, (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3));
            yPosition -= 10;
            yPosition = addText(imageAnalysis, 11, font);
            yPosition -= 20;
        }
        // PDF Analysis Section (if available)
        if (pdfSummary) {
            yPosition = addText('MEDICAL REPORT ANALYSIS (Gemini AI)', 16, boldFont, (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3));
            yPosition -= 10;
            yPosition = addText(pdfSummary, 11, font);
            yPosition -= 20;
        }
        // If no analysis available, add a note
        if (!imageAnalysis && !pdfSummary) {
            yPosition = addText('No AI analysis available. Please ensure files were uploaded correctly.', 11, font, (0, pdf_lib_1.rgb)(0.6, 0.6, 0.6));
            yPosition -= 20;
        }
        // Original Document Section (truncated)
        yPosition = addText('ORIGINAL REPORT CONTENT', 16, boldFont, (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3));
        yPosition -= 10;
        const truncatedText = pdfText.length > 2000
            ? pdfText.substring(0, 2000) + '\n\n... (truncated for brevity)'
            : pdfText;
        yPosition = addText(truncatedText, 10, font);
        // Disclaimer
        yPosition = addText('IMPORTANT DISCLAIMER', 14, boldFont, (0, pdf_lib_1.rgb)(0.8, 0.2, 0.2));
        yPosition -= 10;
        yPosition = addText('This analysis is generated by AI and is for informational purposes only. ' +
            'It should not be used as a substitute for professional medical advice, diagnosis, or treatment. ' +
            'Always consult with qualified healthcare professionals for medical decisions.', 10, font, (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5));
        // Footer
        page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
            x: 50,
            y: 30,
            size: 10,
            font: font,
            color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
        });
        // Append original PDF pages (if PDF was provided)
        if (pdfBuffer) {
            try {
                const originalPdf = await pdf_lib_1.PDFDocument.load(pdfBuffer);
                const originalPages = await pdfDoc.copyPages(originalPdf, originalPdf.getPageIndices());
                originalPages.forEach((originalPage) => pdfDoc.addPage(originalPage));
                console.log('Appended original PDF pages');
            }
            catch (error) {
                console.error('Error appending original PDF:', error);
            }
        }
        else {
            console.log('No original PDF to append');
        }
        // 9. GENERATE PDF BYTES
        const pdfBytes = await pdfDoc.save();
        console.log(`Generated PDF: ${pdfBytes.length} bytes`);
        // 10. UPLOAD TO FIREBASE STORAGE
        const timestamp = Date.now();
        const fileName = `final-report-${timestamp}.pdf`;
        const reportPath = `patients/${uid}/reports/${fileName}`;
        const reportFile = bucket.file(reportPath);
        await reportFile.save(pdfBytes, {
            metadata: {
                contentType: 'application/pdf',
            },
        });
        // Get download URL
        const [downloadUrl] = await reportFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Long-term access
        });
        console.log('Uploaded final report to storage');
        // 11. SAVE METADATA TO FIRESTORE
        const reportMetadata = {
            downloadUrl,
            timestamp,
            imageAnalysis,
            pdfSummary,
            originalImagePath: imageStoragePath,
            originalPdfPath: pdfStoragePath,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await admin.firestore()
            .collection('patients')
            .doc(uid)
            .collection('aiReports')
            .doc(timestamp.toString())
            .set(reportMetadata);
        console.log('Saved report metadata to Firestore');
        // 12. GENERATE BASE64 PREVIEW
        const previewBase64 = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
        // 13. RETURN SUCCESS RESPONSE
        response.status(200).json({
            success: true,
            downloadUrl,
            previewBase64,
            reportId: timestamp.toString(),
            metadata: {
                imageAnalysis: imageAnalysis ? imageAnalysis.substring(0, 200) + '...' : 'No image analysis available',
                pdfSummary: pdfSummary ? pdfSummary.substring(0, 200) + '...' : 'No PDF analysis available',
                hasImage: !!imageBuffer,
                hasPdf: !!pdfBuffer
            }
        });
    }
    catch (error) {
        console.error('Cloud Function error:', error);
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
//# sourceMappingURL=index.js.map