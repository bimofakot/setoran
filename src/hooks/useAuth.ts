import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { initUserCategories, createUserProfile, isUsernameAvailable, getEmailByUsername } from '../lib/userSetup';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) initUserCategories(currentUser.uid);
    });
    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, fullName: string, username: string) => {
    try {
      setError(null);

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username hanya boleh huruf, angka, dan underscore');
      }

      // Check uniqueness
      const available = await isUsernameAvailable(username);
      if (!available) {
        throw new Error('Username sudah digunakan, pilih yang lain');
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Sync displayName to Firebase Auth
      await updateProfile(result.user, { displayName: fullName });

      // Save profile to Firestore
      await createUserProfile(result.user.uid, email, fullName, username);
      await initUserCategories(result.user.uid);

      return result.user;
    } catch (err: any) {
      setError(err.message || 'Error signing up');
      throw err;
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      setError(null);

      // Resolve username → email if identifier is not an email
      let email = identifier;
      if (!identifier.includes('@')) {
        const resolved = await getEmailByUsername(identifier);
        if (!resolved) throw new Error('Username tidak ditemukan');
        email = resolved;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      let errorMessage = err.message || 'Terjadi kesalahan saat masuk';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Email/username atau password salah, silakan coba lagi';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Akun ini telah dinonaktifkan';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah. Periksa koneksi Anda';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Error signing out');
      throw err;
    }
  };

  return { user, loading, error, signup, login, logout, isAuthenticated: !!user };
};
