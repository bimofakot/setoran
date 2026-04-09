import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback((uid: string) =>
    getDocs(collection(db, 'users', uid, 'categories')).then((snap) =>
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)))
    ), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) load(user.uid);
    });
    return unsubscribe;
  }, [load]);

  const getByType = (type: 'income' | 'expense') =>
    Array.from(new Set(categories.filter((c) => c.type === type).map((c) => c.name)));

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    const uid = auth.currentUser?.uid;
    if (!uid || !name.trim()) return;
    const trimmed = name.trim();
    if (categories.some((c) => c.name === trimmed && c.type === type)) return;
    await addDoc(collection(db, 'users', uid, 'categories'), { name: trimmed, type });
    await load(uid);
  };

  const removeCategory = async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'categories', id));
    await load(uid);
  };

  return { categories, getByType, addCategory, removeCategory };
};
