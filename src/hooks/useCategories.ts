import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getDocs(collection(db, 'users', user.uid, 'categories')).then((snapshot) => {
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category))
      );
    });
  }, []);

  const getByType = (type: 'income' | 'expense') =>
    categories.filter((c) => c.type === type).map((c) => c.name);

  return { categories, getByType };
};
