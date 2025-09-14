'use client';

import { useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthUser extends User {
  accountType?: 'patient' | 'doctor';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setUser({
          ...user,
          accountType: userData?.accountType || 'patient'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    accountType: 'patient' | 'doctor'
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: fullName
      });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        accountType,
        createdAt: new Date().toISOString()
      });

      return { success: true, user };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  // Google Sign In
  const signInWithGoogle = async (accountType: 'patient' | 'doctor' = 'patient') => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user data exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Save user data to Firestore for new users
        await setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName || 'User',
          email: user.email,
          accountType,
          createdAt: new Date().toISOString()
        });
      }

      return { success: true, user };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };
};
