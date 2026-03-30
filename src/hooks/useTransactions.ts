import { useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
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

  const user = auth.currentUser;

  // Fetch transactions
  const fetchTransactions = async (startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      if (startDate && endDate) {
        q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
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

  // Add transaction
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        userId: user.uid,
        date: Timestamp.fromDate(new Date(transactionData.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setLoading(true);
      setError(null);

      const transactionRef = doc(db, 'transactions', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      if (updates.date) {
        updateData.date = Timestamp.fromDate(new Date(updates.date));
      }

      await updateDoc(transactionRef, updateData);
      await fetchTransactions();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, 'transactions', id));
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
