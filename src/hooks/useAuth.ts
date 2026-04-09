import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { initUserCategories } from '../lib/userSetup';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await initUserCategories(result.user.uid);
      return result.user;
    } catch (err: any) {
      const errorMessage = err.message || 'Error signing up';
      setError(errorMessage);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      let errorMessage = 'Terjadi kesalahan saat masuk';
      
      // Check error code for user-friendly messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah, silakan coba lagi';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Akun ini telah dinonaktifkan';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah. Periksa koneksi Anda';
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      const errorMessage = err.message || 'Error signing out';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
