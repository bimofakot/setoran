import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
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

export const createUserProfile = async (
  userId: string,
  email: string,
  fullName: string,
  username: string
) => {
  await setDoc(doc(db, 'users', userId), {
    email,
    fullName,
    username: username.toLowerCase(),
    createdAt: new Date().toISOString(),
  });
};

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase())
  );
  const snap = await getDocs(q);
  return snap.empty;
};

export const getEmailByUsername = async (username: string): Promise<string | null> => {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data().email as string;
};

// Seed hanya jika koleksi benar-benar kosong — tidak mengunci atau memaksa kategori yang sudah ada.
export const initUserCategories = async (userId: string) => {
  const categoriesRef = collection(db, 'users', userId, 'categories');
  const snapshot = await getDocs(categoriesRef);
  if (!snapshot.empty) return; // sudah ada data, biarkan user mengelolanya sendiri
  await Promise.all(
    DEFAULT_CATEGORIES.map((cat) => setDoc(doc(categoriesRef), { name: cat.name, type: cat.type }))
  );
};
