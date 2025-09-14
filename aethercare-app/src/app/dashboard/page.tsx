'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { MetaMaskButton } from '@/components/MetaMaskButton';
import { ArrowRight, Edit3, Save, User, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PatientData {
  name: string;
  height: string;
  weight: string;
  bmi: number;
  age: string;
  habits: 'smoker' | 'drinker' | 'both' | 'none';
  exerciseRoutine: string;
  allergies: string;
  chronicConditions: string;
  familyConditions: string;
  otherNotes: string;
}

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    height: '',
    weight: '',
    bmi: 0,
    age: '',
    habits: 'none',
    exerciseRoutine: '',
    allergies: '',
    chronicConditions: '',
    familyConditions: '',
    otherNotes: ''
  });

  // Calculate BMI when height or weight changes
  useEffect(() => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setFormData(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
    } else {
      setFormData(prev => ({ ...prev, bmi: 0 }));
    }
  }, [formData.height, formData.weight]);

  // Load existing patient data
  useEffect(() => {
    const loadPatientData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'patients', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as PatientData;
            setFormData(data);
            setIsEditing(false); // Show summary if data exists
          } else {
            // Pre-fill name from Firebase Auth
            setFormData(prev => ({
              ...prev,
              name: user.displayName || user.email?.split('@')[0] || ''
            }));
          }
        } catch (error) {
          console.error('Error loading patient data:', error);
        }
      }
    };

    if (user && !loading) {
      loadPatientData();
    }
  }, [user, loading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveDetails = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, 'patients', user.uid);
      await setDoc(docRef, formData, { merge: true });
      
      setIsEditing(false);
      showToast('Patient details saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving patient data:', error);
      showToast('Failed to save patient details. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'Patient';
  const bmiCategory = getBMICategory(formData.bmi);

  return (
    <>
      {/* Fixed Navigation */}
      <Navigation />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[110] p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {toast.message}
        </div>
      )}
      
      {/* Dashboard Background Container */}
      <div className="min-h-screen bg-[url('/assets/dashboard.jpg')] bg-cover bg-center bg-no-repeat relative pt-16">
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Main content (above overlay) */}
        <div className="relative z-10 pt-6 pb-12 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex justify-center">
              <Card className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-5xl p-8 md:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Main Welcome Content */}
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Welcome {userName}
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage your health profile and track your wellness journey
                      </p>
                    </div>
                  </div>
                  
                  {/* Wallet Status */}
                  <div className="flex flex-col items-start lg:items-end gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Wallet className="w-4 h-4" />
                      <span>Wallet Status</span>
                    </div>
                    <MetaMaskButton variant="status" showAddress={false} className="compact" />
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Patient Details Form */}
          {isEditing ? (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-[70vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6 p-8 pb-0 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Patient Details
                  </h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-black hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-md transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Details
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-hide">
                  <form className="grid md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Basic Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Enter your age"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={formData.height}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="175"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="70"
                        />
                      </div>
                    </div>

                    {/* BMI Display */}
                    {formData.bmi > 0 && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">BMI:</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">{formData.bmi}</span>
                            <span className={`ml-2 text-sm font-medium ${bmiCategory.color}`}>
                              ({bmiCategory.text})
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Habits
                      </label>
                      <select
                        name="habits"
                        value={formData.habits}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="none">None</option>
                        <option value="smoker">Smoker</option>
                        <option value="drinker">Drinker</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exercise Routine
                      </label>
                      <input
                        type="text"
                        name="exerciseRoutine"
                        value={formData.exerciseRoutine}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="e.g., Jogging 3x/week, Gym daily"
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Medical Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies
                      </label>
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="List any known allergies"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chronic Conditions
                      </label>
                      <textarea
                        name="chronicConditions"
                        value={formData.chronicConditions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="e.g., Hypertension, Diabetes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Family Medical History
                      </label>
                      <textarea
                        name="familyConditions"
                        value={formData.familyConditions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Family history of medical conditions"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Notes
                      </label>
                      <textarea
                        name="otherNotes"
                        value={formData.otherNotes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Any additional notes or concerns"
                      />
                    </div>
                  </div>
                  </form>

                  {/* Save Button */}
                  <div className="mt-8 flex justify-center">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSaveDetails}
                      disabled={isSaving}
                      className="bg-white text-black hover:bg-gray-100 border border-gray-300 px-8 py-3 rounded-md font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Details'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            /* Profile Summary Card */
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Health Profile Summary
                  </h2>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-md transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Details
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Basic Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium text-gray-900">{formData.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium text-gray-900">{formData.height} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium text-gray-900">{formData.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BMI:</span>
                        <span className={`font-medium ${bmiCategory.color}`}>
                          {formData.bmi} ({bmiCategory.text})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Habits:</span>
                        <span className="font-medium text-gray-900">
                          {formData.habits.charAt(0).toUpperCase() + formData.habits.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Summary</h3>
                    <div className="space-y-3">
                      {formData.exerciseRoutine && (
                        <div>
                          <span className="text-gray-600 text-sm">Exercise:</span>
                          <p className="text-gray-900">{formData.exerciseRoutine}</p>
                        </div>
                      )}
                      {formData.allergies && (
                        <div>
                          <span className="text-gray-600 text-sm">Allergies:</span>
                          <p className="text-gray-900">{formData.allergies}</p>
                        </div>
                      )}
                      {formData.chronicConditions && (
                        <div>
                          <span className="text-gray-600 text-sm">Chronic Conditions:</span>
                          <p className="text-gray-900">{formData.chronicConditions}</p>
                        </div>
                      )}
                      {formData.familyConditions && (
                        <div>
                          <span className="text-gray-600 text-sm">Family History:</span>
                          <p className="text-gray-900">{formData.familyConditions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
