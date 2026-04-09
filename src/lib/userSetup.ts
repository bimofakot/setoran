import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_CATEGORIES = [
  { name: 'Gaji', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Bonus', type: 'income' },
  { name: 'Investasi', type: 'income' },
  { name: 'Pinjaman', type: 'income' },
  { name: 'Lainnya (Pemasukan)', type: 'income' },
  { name: 'Makanan & Minuman', type: 'expense' },
  { name: 'Transportasi', type: 'expense' },
  { name: 'Kesehatan', type: 'expense' },
  { name: 'Pendidikan', type: 'expense' },
  { name: 'Hiburan', type: 'expense' },
  { name: 'Tagihan', type: 'expense' },
  { name: 'Belanja', type: 'expense' },
  { name: 'Asuransi', type: 'expense' },
  { name: 'Lainnya (Pengeluaran)', type: 'expense' },
] as const;

export const initUserCategories = async (userId: string) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');
  const snapshot = await getDocs(categoriesRef);

  // Only seed if no categories exist yet
  if (!snapshot.empty) return;

  await Promise.all(
    DEFAULT_CATEGORIES.map((cat) =>
      setDoc(doc(categoriesRef), { name: cat.name, type: cat.type })
    )
  );
};
