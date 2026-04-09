import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import type { Transaction } from '../types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubSnap: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null; }
      if (!user) { setTransactions([]); setLoading(false); return; }

      setLoading(true);
      const q = query(
        collection(db, 'users', user.uid, 'transactions'),
        where('isDeleted', '==', false),
        orderBy('date', 'desc')
      );

      unsubSnap = onSnapshot(q, (snap) => {
        setTransactions(snap.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            date: data.date?.toDate() ?? new Date(data.date),
            createdAt: data.createdAt?.toDate() ?? new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate() ?? new Date(data.updatedAt),
          } as Transaction;
        }));
        setLoading(false);
      }, (err) => { setError(err.message); setLoading(false); });
    });

    return () => { unsubAuth(); if (unsubSnap) unsubSnap(); };
  }, []);

  const txCollection = () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Tidak terautentikasi');
    return collection(db, 'users', user.uid, 'transactions');
  };

  const txDoc = (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Tidak terautentikasi');
    return doc(db, 'users', user.uid, 'transactions', id);
  };

  const addTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
  ) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setError(null);
      // Parse date string as local date (avoid UTC midnight shift)
      const [y, m, d] = (transactionData.date as unknown as string).toString().split('T')[0].split('-').map(Number);
      const now = new Date();
      const combinedDateTime = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const docRef = await addDoc(txCollection(), {
        ...transactionData,
        userId: user.uid,
        date: Timestamp.fromDate(combinedDateTime),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      });
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setError(null);
      const updateData: any = { ...updates, updatedAt: Timestamp.now() };
      if (updates.date) {
        const dateStr = (updates.date as unknown as string).toString().split('T')[0];
        const [y, m, d] = dateStr.split('-').map(Number);
        const now = new Date();
        updateData.date = Timestamp.fromDate(new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()));
      }
      await updateDoc(txDoc(id), updateData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError(null);
      await updateDoc(txDoc(id), { isDeleted: true, updatedAt: Timestamp.now() });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // kept for backward compat (no-op, listener handles refresh)
  const fetchTransactions = async () => {};

  return { transactions, loading, error, fetchTransactions, addTransaction, updateTransaction, deleteTransaction };
};
