import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCeQBUhCxEpg1BL7FyQF1kU5grj_olTwqs",
  authDomain: "aethercare-9f49b.firebaseapp.com",
  projectId: "aethercare-9f49b",
  storageBucket: "aethercare-9f49b.firebasestorage.app",
  messagingSenderId: "894962942895",
  appId: "1:894962942895:web:bd0e88e938822c7049255a",
  measurementId: "G-9VD2KGYPD2",
};

// Firebase configuration is now hardcoded for reliability
console.log('Firebase initialized successfully');

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = (async () => (await isSupported()) ? getAnalytics(app) : null)();

export { app, auth, db, storage, analytics };
