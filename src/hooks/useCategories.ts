import { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let unsubSnap: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null; }
      if (!user) { setCategories([]); setUid(null); return; }
      setUid(user.uid);
      unsubSnap = onSnapshot(
        collection(db, 'users', user.uid, 'categories'),
        (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)))
      );
    });

    return () => { unsubAuth(); if (unsubSnap) unsubSnap(); };
  }, []);

  const getByType = useCallback(
    (type: 'income' | 'expense') =>
      Array.from(new Set(categories.filter((c) => c.type === type).map((c) => c.name))),
    [categories]
  );

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    if (!uid || !name.trim()) return;
    const trimmed = name.trim();
    if (categories.some((c) => c.name === trimmed && c.type === type)) return;
    await addDoc(collection(db, 'users', uid, 'categories'), { name: trimmed, type });
  };

  const removeCategory = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'categories', id));
  };

  return { categories, getByType, addCategory, removeCategory };
};
