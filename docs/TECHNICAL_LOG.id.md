# Log Teknis - Sesi Pengembangan Keuanganku

**Date:** 31 Maret 2026 
**Proyek:** Keuanganku - Aplikasi Pelacakan Keuangan Pribadi  
**Tech Stack:** React 19 | TypeScript | Tailwind CSS v4 | Firebase | Vite

**Baca dalam:** [English](TECHNICAL_LOG.md) | [Bahasa Indonesia](TECHNICAL_LOG.id.md)

---

## Daftar Isi

1. [Firebase Timestamp Type Mismatch](#firebase-timestamp-type-mismatch)
2. [TypeScript Type Error pada Filter Tanggal](#typescript-type-error-pada-filter-tanggal)
3. [Pembersihan Variabel yang Tidak Digunakan](#pembersihan-variabel-yang-tidak-digunakan)
4. [Pelajaran Utama](#pelajaran-utama)

---

## Firebase Timestamp Type Mismatch

### Masalah

Ketika membuat operasi CRUD Firestore di file `src/hooks/useTransactions.ts`, terjadi ketidakcocokan tipe data yang kritis antara object `Timestamp` milik Firebase dan object `Date` dari JavaScript asli.

**Pesan Error:**
```
Type 'Timestamp' is not assignable to type 'Date'.
  Property 'toJSON' is missing in type 'Timestamp'.
```

**Penyebab Utama:**
Firestore menyimpan tanggal sebagai object `Timestamp` (class khusus milik Firebase), tetapi TypeScript interface `Transaction` kami mendefinisikan field `date` sebagai tipe `Date`. Ketika mengambil data dari Firestore, field `date` hadir sebagai `Timestamp`, bukan `Date`, yang menyebabkan ketidakcocokan tipe di seluruh aplikasi.

```typescript
// ❌ SEBELUM - Ketidakcocokan Tipe
interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;           // Mengharapkan Date
  description: string;
}

// Di useTransactions.ts
const snapshot = await getDocs(query(
  collection(db, 'transactions'),
  where('userId', '==', userId)
));

// data.date sebenarnya adalah Timestamp, bukan Date!
const transaction = doc.data() as Transaction;
```

### Solusi

Mengimplementasikan konversi `Timestamp` ke `Date` yang eksplisit pada batas transformasi data, memastikan keamanan tipe di seluruh aplikasi.

**Implementasi:**

```typescript
// ✅ SESUDAH - Konversi Tipe yang Tepat

import { Timestamp } from 'firebase/firestore';

// Di useTransactions.ts - hook fetchTransactions
const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const snapshot = await getDocs(query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    ));

    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ubah Firestore Timestamp menjadi JavaScript Date
      // Menangani kedua object Timestamp dan Date untuk fleksibilitas
      const date = data.date instanceof Timestamp 
        ? data.date.toDate() 
        : new Date(data.date);

      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: date,                    // Sekarang benar-benar bertipe Date
        description: data.description,
      } as Transaction;
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Di useTransactions.ts - fungsi addTransaction
const addTransaction = async (
  transactionData: Omit<Transaction, 'id'>
): Promise<boolean> => {
  try {
    // Konversi balik: Date ke Timestamp ketika menyimpan
    await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      date: Timestamp.fromDate(transactionData.date),  // Ubah ke Timestamp untuk penyimpanan
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false;
  }
};

// Di useTransactions.ts - fungsi updateTransaction
const updateTransaction = async (
  id: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<boolean> => {
  try {
    const updateData: any = { ...updates };
    
    // Hanya ubah date jika terdapat di dalam updates
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    
    await updateDoc(doc(db, 'transactions', id), updateData);
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};
```

### Detail Teknis

**Mengapa Ini Penting:**

1. **Type Safety**: Dengan mengubah di batas aplikasi, seluruh aplikasi memperlakukan `date` sebagai object `Date` standar, mempertahankan keamanan tipe TypeScript.

2. **Firebase Best Practice**: Class `Timestamp` milik Firestore dirancang khusus untuk penyimpanan cloud dan menyertakan metadata tambahan. Mengubah ke `Date` untuk penggunaan lokal adalah pola yang direkomendasikan.

3. **Konversi Dua Arah**: 
   - **Membaca**: `Timestamp.toDate()` ketika mengambil dari Firestore
   - **Menulis**: `Timestamp.fromDate()` ketika menyimpan ke Firestore

4. **Null Safety**: Pengecekan `instanceof` menangani kasus tepi di mana data mungkin sudah berupa object `Date`.

**Dampak Performa:**
- Overhead konversi tipe yang dapat diabaikan
- Memungkinkan re-rendering React yang efisien dengan tipe Date yang tepat
- Menyederhanakan debugging dengan tipe Date yang konsisten di seluruh basis kode

---

## TypeScript Type Error pada Filter Tanggal

### Masalah

Pemilih rentang tanggal komponen `DateRangeFilter` memiliki definisi tipe union yang tidak lengkap yang menyebabkan kesalahan kompilasi TypeScript.

**Pesan Error:**
```
Type 'string' is not assignable to type '"today" | "week" | "month" | "year"'.
Did you mean 'custom'?
```

**Penyebab Utama:**
Fungsi `getDateRange()` di utilities `src/utils/helpers.ts` tidak memiliki case untuk tipe rentang tanggal `'custom'`, padahal tipe union `DateRange` menyertakannya. Ini menciptakan celah dalam jangkauan tipe.

```typescript
// ❌ SEBELUM - Jangkauan Tipe Tidak Lengkap
type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

function getDateRange(range: DateRange): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { start: today, end: now };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: now };
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart, end: now };
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { start: yearStart, end: now };
    // ❌ case 'custom' hilang!
  }
}
```

### Solusi

Memperluas fungsi untuk menangani case `'custom'`, memastikan jangkauan tipe lengkap dan memungkinkan pemilihan rentang tanggal khusus.

**Implementasi:**

```typescript
// ✅ SESUDAH - Jangkauan Tipe Lengkap

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateRangeValue {
  start: Date;
  end: Date;
}

function getDateRange(
  range: DateRange,
  customStart?: Date,
  customEnd?: Date
): DateRangeValue {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { start: today, end: now };

    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Minggu = 0
      return { start: weekStart, end: now };

    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart, end: now };

    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { start: yearStart, end: now };

    case 'custom':
      // Menangani rentang tanggal khusus
      // Gunakan tanggal yang disediakan atau kembalikan ke bulan saat ini
      if (customStart && customEnd) {
        return { start: customStart, end: customEnd };
      }
      // Fallback default ke bulan saat ini jika tidak ada tanggal khusus
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: defaultStart, end: now };

    default:
      // Exhaustive check - TypeScript memastikan semua case tercakup
      const _exhaustive: never = range;
      return _exhaustive;
  }
}
```

**Penggunaan di Komponen DateRangeFilter:**

```typescript
// src/components/DateRangeFilter.tsx
const [selectedRange, setSelectedRange] = useState<DateRange>('month');
const [customStart, setCustomStart] = useState<Date>(new Date());
const [customEnd, setCustomEnd] = useState<Date>(new Date());

const handleRangeChange = (range: DateRange) => {
  setSelectedRange(range);
  
  const dateRange = getDateRange(
    range,
    range === 'custom' ? customStart : undefined,
    range === 'custom' ? customEnd : undefined
  );
  
  onDateRangeChange(dateRange);
};
```

### Detail Teknis

**Mengapa Ini Penting:**

1. **Jangkauan Tipe Exhaustive**: Sistem tipe TypeScript sekarang menjamin semua nilai `DateRange` yang mungkin ditangani. Pattern `never` tipe di case default memastikan compiler menangkap case yang hilang.

2. **Discriminated Unions**: Pola memanfaatkan tipe union yang didiskriminasikan milik TypeScript, memungkinkan compiler mempersempit tipe berdasarkan parameter `range`.

3. **Fleksibilitas**: Fungsi sekarang mendukung rentang yang telah ditentukan sebelumnya dan rentang tanggal khusus yang ditentukan pengguna dengan logika fallback yang seamless.

4. **Developer Experience**: IDE sekarang dapat memberikan autocomplete lengkap dan type hints di seluruh aplikasi.

**Pengujian Edge Cases:**
```typescript
// Semua pemanggilan yang valid sekarang type-check dengan benar
getDateRange('today');                    // ✓ Transaksi hari ini
getDateRange('week');                     // ✓ Transaksi minggu ini
getDateRange('month');                    // ✓ Transaksi bulan ini
getDateRange('year');                     // ✓ Transaksi tahun ini
getDateRange('custom', startDate, endDate); // ✓ Rentang tanggal khusus
```

---

## Pembersihan Variabel yang Tidak Digunakan

### Masalah

Tiga variabel yang tidak digunakan terdeteksi selama kompilasi TypeScript, menambah kode yang tidak perlu dan menciptakan beban pemeliharaan.

**Masalah yang Ditemukan:**

1. **`updateTransaction` di Dashboard.tsx**
   - Didestruct dari hook `useTransactions()` tetapi tidak pernah digunakan di komponen
   - Menciptakan kebingungan tentang permukaan API yang tersedia

2. **State `exportFormat` di ExportShare.tsx**
   - Variabel state dideklarasikan tetapi tidak digunakan dalam logika komponen
   - Menyarankan implementasi yang tidak lengkap atau kode yang sudah ketinggalan zaman

3. **Prop `loading` di TransactionList.tsx**
   - Prop diteruskan dari parent tetapi tidak pernah digunakan di komponen
   - Menunjukkan implementasi loading state yang tidak lengkap

### Solusi

Menghapus semua variabel yang tidak digunakan dan mengoptimalkan import untuk kejelasan dan kebersihan kode.

**Implementasi:**

```typescript
// ❌ SEBELUM - updateTransaction yang tidak digunakan di Dashboard.tsx
import { useTransactions } from '../hooks/useTransactions';

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction,      // ← Tidak pernah digunakan
    deleteTransaction, 
    loading 
  } = useTransactions(userId);

  // ... kode komponen yang hanya menggunakan addTransaction dan deleteTransaction
}

// ✅ SESUDAH - Import yang cersih dengan hanya fungsi yang diperlukan
import { useTransactions } from '../hooks/useTransactions';

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction,        // Hanya apa yang kita perlukan
    loading 
  } = useTransactions(userId);

  // ... kode komponen
}
```

```typescript
// ❌ SEBELUM - State exportFormat yang tidak digunakan di ExportShare.tsx
const ExportShare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv'); // ← Tidak digunakan
  const [transactions] = rest;

  // Export ditangani langsung tanpa state format
  const handleExportCSV = () => { /* ... */ };
  const handleExportJSON = () => { /* ... */ };
}

// ✅ SESUDAH - State dihapus, export ditangani langsung
const ExportShare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Tidak ada state format yang diperlukan - setiap fungsi export menangani formatnya sendiri

  const handleExportCSV = () => { /* ... */ };
  const handleExportJSON = () => { /* ... */ };
}
```

```typescript
// ❌ SEBELUM - Prop loading yang tidak digunakan di TransactionList.tsx
interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;           // ← Dideklarasikan tetapi tidak pernah digunakan
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,                     // ← Didestruct tetapi tidak digunakan
  onEdit,
  onDelete,
}) => {
  // Tidak ada spinner loading atau conditional rendering berdasarkan prop loading
  return (
    <div className="space-y-4">
      {transactions.map(/* ... */)}
    </div>
  );
};

// ✅ SESUDAH - Prop yang tidak digunakan dihapus
interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  // Komponen yang bersih dan purpose-driven
  return (
    <div className="space-y-4">
      {transactions.map(/* ... */)}
    </div>
  );
};
```

### Detail Teknis

**Manfaat dari Pembersihan:**

1. **Kejelasan Kode**: Variabel yang tidak digunakan menciptakan ambiguitas tentang apa yang benar-benar dilakukan komponen
2. **Pemeliharaan**: Mengurangi beban kognitif untuk developer yang membaca kode
3. **Type Safety**: Pengecekan tipe TypeScript lebih efektif dengan deklarasi yang presisi
4. **Bundle Size**: Meskipun minimal, menghapus kode yang tidak digunakan menjaga bundle tetap lean
5. **Compiler Warnings**: Menghilangkan false positives dan membuat peringatan nyata lebih terlihat

**Tooling**:
Masalah ini terdeteksi dengan `npm run lint` dan opsi compiler TypeScript `noUnusedLocals`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Pelajaran Utama

### 1. Third-Party ODM Pattern di TypeScript

**Pelajaran**: Ketika mengintegrasikan library pihak ketiga (seperti Firebase) dengan sistem tipe yang kuat (seperti TypeScript), selalu implementasikan batas konversi antara tipe library dan tipe aplikasi Anda.

**Aplikasi**:
- Membuat conversion layer di `useTransactions.ts` khusus untuk penanganan Timestamp
- Memungkinkan type safety di seluruh aplikasi
- Membuat titik integrasi eksplisit dan dapat diuji

**Takeaway**: "Pikirkan sistem tipe aplikasi Anda sebagai kontrak - library pihak ketiga adalah mitra eksternal yang membutuhkan terjemahan tipe di batas."

### 2. Exhaustive Type Coverage dalam Unions

**Pelajaran**: Kemampuan TypeScript untuk menegakkan jangkauan tipe exhaustive dalam switch statements adalah alat yang powerful untuk mencegah bug.

**Aplikasi**:
- Menggunakan discriminated unions dengan `never` tipe dalam case default
- Compiler sekarang menjamin semua nilai DateRange ditangani
- Menambah rentang tanggal baru secara otomatis menciptakan error kompilasi di switch statements yang tidak tercakup

**Takeaway**: "Manfaatkan sistem tipe TypeScript untuk verifikasi compile-time - ini menangkap bug yang mungkin terlewatkan unit test."

### 3. Code Hygiene Melalui Tooling

**Pelajaran**: Mengaktifkan opsi compiler ketat dan linting menciptakan feedback loop yang mempertahankan kualitas kode selama development.

**Aplikasi**:
- `noUnusedLocals` dan `noUnusedParameters` menangkap dead code secara langsung
- Developer mendapat instant feedback di IDE sebelum push kode
- Mencegah akumulasi technical debt

**Takeaway**: "Konfigurasi toolchain Anda sejak awal dan ketat - lebih mudah mempertahankan standar tinggi selama development daripada refactor nanti."

### 4. Consideration Performa

**Pelajaran**: Konversi tipe memiliki dampak performa minimal pada engine JavaScript modern, tetapi kejelasan arsitektur memiliki dampak besar pada produktivitas developer.

**Key Insight**:
Meskipun `Timestamp.toDate()` membuat object Date baru pada setiap fetch, dampak performa dapat diabaikan (microseconds) dibandingkan dengan round-trip jaringan ke Firestore (milliseconds). Trade-off untuk type safety dan code clarity selalu worth it.

---

## Kesimpulan

Sesi development ini menyoroti pentingnya:
- Memahami titik integrasi antara library dan sistem tipe Anda
- Memanfaatkan strict mode TypeScript untuk keamanan compile-time
- Mempertahankan kode yang bersih dan purposeful melalui praktik yang konsisten

Tiga perbaikan bug ini mewakili tantangan umum dalam development TypeScript full-stack modern dan menunjukkan bagaimana typing yang tepat mencegah runtime errors dan meningkatkan maintainability.

**Dampak Performa**: Dapat diabaikan (semua perbaikan melibatkan developer ergonomics, bukan runtime optimization)  
**Type Safety**: ✅ Meningkat  
**Code Clarity**: ✅ Meningkat  
**Developer Experience**: ✅ Meningkat  

---

*Terakhir Diperbarui: 2026*
