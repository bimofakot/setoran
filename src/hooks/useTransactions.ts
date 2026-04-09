import { useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Transaction } from '../types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchTransactions = async (startDate?: Date, endDate?: Date) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let q = query(
        txCollection(),
        where('isDeleted', '==', false),
        orderBy('date', 'desc')
      );

      if (startDate && endDate) {
        q = query(
          txCollection(),
          where('isDeleted', '==', false),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          ...d,
          id: doc.id,
          date: d.date?.toDate() || new Date(d.date),
          createdAt: d.createdAt?.toDate() || new Date(d.createdAt),
          updatedAt: d.updatedAt?.toDate() || new Date(d.updatedAt),
        } as Transaction;
      });

      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
  ) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const selectedDate = new Date(transactionData.date);
      const now = new Date();
      const combinedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );

      const docRef = await addDoc(txCollection(), {
        ...transactionData,
        userId: user.uid,
        date: Timestamp.fromDate(combinedDateTime),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      });

      await fetchTransactions();
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setLoading(true);
      setError(null);

      const updateData: any = { ...updates, updatedAt: Timestamp.now() };

      if (updates.date) {
        const selectedDate = new Date(updates.date);
        const now = new Date();
        updateData.date = Timestamp.fromDate(
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
          )
        );
      }

      await updateDoc(txDoc(id), updateData);
      await fetchTransactions();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Soft-delete: hanya set isDeleted = true
  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(txDoc(id), {
        isDeleted: true,
        updatedAt: Timestamp.now(),
      });

      await fetchTransactions();
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
