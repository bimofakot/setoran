# Setoranku — Aplikasi Keuangan Pribadi

**Baca dalam:** [English](README.md) | [Bahasa Indonesia](README.id.md)

> 🌐 **Live:** [setoran.massbim.my.id](https://setoran.massbim.my.id)

Aplikasi web keuangan pribadi premium untuk mencatat pemasukan dan pengeluaran harian. Dibangun dengan React 19, TypeScript, Tailwind CSS v4, dan Firebase — bisa diinstal sebagai PWA native di Android.

---

## ✨ Fitur Utama

### 🎨 UI/UX Premium
- **Tiga tema** — Gelap, Terang (Pale Lavender Clay), dan Sistem — tersimpan antar sesi
- **Navigasi Sidebar** (desktop) + **bottom tab bar** (mobile) — terasa seperti aplikasi native
- **6 avatar geometris kustom** — personalisasi profil dengan avatar SVG buatan tangan
- **Animasi halus** — fade-up, shimmer skeleton, pulse-glow, dan micro-interaction di seluruh halaman
- **Zero pure white** — mode terang menggunakan palet Pale Lavender Clay yang elegan dan premium

### 💾 Data & Keamanan
- **Isolasi per-user** — semua data tersimpan di `users/{userId}/...`, terisolasi antar akun
- **Soft-delete** — transaksi yang dihapus ditandai `isDeleted: true`, tidak pernah dihapus permanen
- **Firebase Auth** — login dengan email atau username; registrasi memerlukan username alfanumerik unik
- **Kategori kustom** — CRUD kategori per-user, di-seed dengan default cerdas saat pertama daftar

#### Mengapa Kategori Disimpan Per-Dokumen?

Setiap kategori disimpan sebagai dokumen terpisah di Firestore, bukan sebagai array dalam satu dokumen:

- **Skalabilitas** — User bisa menambah kategori kustom tanpa mengubah struktur data
- **Integritas Data** — Penghapusan satu kategori tidak mempengaruhi kategori lain
- **Recovery** — Transaksi menyimpan **nama kategori sebagai string**, bukan referensi ID, sehingga histori tetap aman

### 📱 Progressive Web App (PWA)
- **Bisa diinstal di Android** — prompt "Tambahkan ke Layar Utama" via browser
- **Offline-ready** — Workbox service worker meng-cache aset penting
- **Mode standalone** — berjalan tanpa chrome browser, terasa native

### 🧾 Input Transaksi Cerdas
- **Format Rupiah real-time** — `100000` → `100.000` saat diketik
- **Emoji kategori** — 🍜 Makanan, 💼 Gaji, 🚗 Transport, dan lainnya
- **Kategori kustom** — memilih "Lainnya" memunculkan input teks bebas
- **Aksi mobile-first** — Edit/Hapus selalu terlihat di perangkat sentuh

### 📊 Dashboard & Analitik
- **Kartu ringkasan** — Pemasukan, Pengeluaran, Saldo dengan progress bar dan efek glow
- **Quick stats** — Rata-rata per transaksi, transaksi terbesar, rasio hemat
- **Tab Analisis** — Grafik tren garis, pie chart kategori, perbandingan bulanan (pure SVG, tanpa library)
- **Smart Period Navigator** — navigasi Harian/Mingguan/Bulanan/Tahunan dengan tombol prev/next, tersedia di Dashboard **dan** halaman Analisis
- **Filter Custom** — pilih rentang tanggal bebas langsung dari halaman Analisis

### 📈 Smart Comparison
- **Perbandingan dinamis** mengikuti periode aktif:
  - Harian → bandingkan dengan kemarin
  - Mingguan → bandingkan dengan minggu lalu
  - Bulanan → bandingkan dengan bulan lalu
  - Custom → perbandingan dinonaktifkan
- **Tampilkan Semua** — ringkasan harian + mingguan + bulanan dalam satu tampilan

### ⚡ Real-time Sync
- **onSnapshot listener** — setiap perubahan transaksi atau kategori langsung terefleksi tanpa refresh
- **Sinkronisasi antar tab** — buka di dua tab, perubahan di satu tab langsung muncul di tab lain
- **Cleanup otomatis** — listener dibersihkan saat logout atau komponen unmount

### 📄 Laporan PDF & Excel Profesional
- **Sinkron tema** — warna header PDF mengikuti tema aktif (violet gelap atau violet terang)
- **Penomoran dua-pass** — "Halaman X dari Y" di setiap halaman
- **Area tanda tangan** — kota, tanggal, nama pemilik di halaman terakhir
- **Disclaimer formal** — footer auto word-wrap di setiap halaman
- **Export Excel** — data transaksi lengkap dengan sheet ringkasan

### 💬 Dukungan Multi-Saluran
- **Hubungi Kami** — pilih WhatsApp atau Email langsung dari sidebar
- **Pesan otomatis** — nama, sumber, dan template kendala sudah terisi otomatis
- **Menu Bantuan** — panduan onboarding 5 langkah di sidebar untuk user baru

### 🔐 Keamanan Akun
- **Ganti Password** — form reauthentication + update password di halaman Profil
- **Hapus kategori bebas** — semua kategori bisa dihapus; jika koleksi kosong, seed berjalan otomatis sebagai pengaman
- **Konfirmasi hapus** — alert sebelum menghapus kategori

### 📐 Responsif di Semua Ukuran Layar
- **Breakpoint adaptif** — `sm` (≥640px), `md` (≥768px), `lg` (≥1024px)
- **Filter pills scrollable** — scroll horizontal tanpa teks terpotong di layar sempit
- **Grid dinamis** — stat cards, quick stats, dan analitik menyesuaikan kolom otomatis
- **Padding dinamis** — konten utama menyesuaikan ukuran layar secara otomatis

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Backend | Firebase Auth + Firestore |
| Build | Vite 7 |
| PWA | vite-plugin-pwa (Workbox) |
| PDF | jsPDF + jspdf-autotable |
| Excel | XLSX |

---

## 🚀 Instalasi

### 1. Clone & Install

```bash
git clone https://github.com/bimofakot/setoran.git
cd setoran
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` diperlukan karena vite-plugin-pwa belum secara resmi mendukung Vite 7.

### 2. Konfigurasi Firebase

Salin `.env.example` ke `.env.local` lalu isi dengan konfigurasi Firebase project kamu:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Jalankan

```bash
npm run dev
```

---

## 🔐 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true; // untuk lookup username saat login/register
      allow write: if request.auth.uid == userId;
      match /transactions/{id} {
        allow read, write: if request.auth.uid == userId;
      }
      match /categories/{id} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🏗️ Struktur Project

```
src/
├── components/
│   ├── Analytics.tsx         # Grafik SVG (tren, pie, perbandingan)
│   ├── DateRangeFilter.tsx   # (digantikan PeriodNavigator)
│   ├── ExportShare.tsx       # Export PDF/Excel & share WA/salin
│   ├── PeriodNavigator.tsx   # Navigasi periode dengan prev/next + Custom
│   ├── Summary.tsx           # Kartu ringkasan keuangan + quick stats
│   ├── TransactionForm.tsx   # Form input dengan masking Rupiah
│   ├── TransactionList.tsx   # Daftar transaksi dikelompokkan per hari
│   └── ui.tsx                # Button, Input, Select, Dialog, Badge
├── hooks/
│   ├── useAuth.ts            # Auth state + seed kategori
│   ├── useCategories.ts      # CRUD kategori dari Firestore (onSnapshot)
│   ├── useProfile.ts         # Baca/tulis profil dengan avatarId
│   └── useTransactions.ts    # CRUD transaksi (soft-delete, onSnapshot)
├── lib/
│   ├── avatars.ts            # 6 definisi avatar SVG
│   ├── firebase.ts           # Inisialisasi Firebase
│   ├── ThemeContext.tsx      # Provider tema Gelap/Terang/Sistem
│   └── userSetup.ts          # Seed kategori default saat pertama daftar
├── pages/
│   ├── AuthPage.tsx          # Login + Daftar dengan show/hide password
│   ├── Dashboard.tsx         # Layout utama dengan sidebar + bottom nav
│   └── ProfilePage.tsx       # Profil, avatar, kategori, dukungan
├── types/index.ts
└── utils/helpers.ts
```

---

## 🚢 Deploy ke Firebase Hosting

```bash
npm run build
firebase deploy
```

CI/CD via GitHub Actions — setiap push ke `main` otomatis build dan deploy.

---

## 📋 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build (PWA aktif di sini)
npm run lint       # Lint kode
```

---

## 📝 Lisensi

MIT — bebas digunakan untuk keperluan pribadi maupun komersial.

---

## 🧠 Catatan Engineering

### Autoseed vs Kebebasan User — Menyeimbangkan Data Awal dengan Kontrol User

**Masalah:** `initUserCategories` dipanggil setiap login via `onAuthStateChanged`. Ini akan menambahkan kembali kategori default yang sudah dihapus user, sehingga tidak bisa benar-benar dihapus.

**Solusi:** Seed hanya berjalan saat koleksi kategori **benar-benar kosong**.

```ts
export const initUserCategories = async (userId: string) => {
  const snapshot = await getDocs(categoriesRef);
  if (!snapshot.empty) return; // hanya seed saat pertama kali
  await Promise.all(DEFAULT_CATEGORIES.map(...));
};
```

**Prinsip:** Seed data adalah *bootstrap* — memberikan titik awal yang berguna untuk user baru. Setelah itu, data sepenuhnya milik user. Tidak ada kategori yang dikunci atau dipaksa kembali. Jika user menghapus semua kategori, seed berjalan lagi saat login berikutnya sebagai jaring pengaman.

### Sinkronisasi Real-time dengan onSnapshot

`useTransactions` dan `useCategories` menggunakan listener `onSnapshot` Firestore, bukan `getDocs` satu kali. Artinya:
- Setiap perubahan (tambah/edit/hapus) langsung terefleksi di semua tab yang terbuka.
- Tidak perlu memanggil `fetchTransactions()` manual setelah mutasi.
- Listener dibersihkan dengan benar saat logout dan unmount untuk mencegah memory leak.

### Smart Comparison di Analitik

Panel perbandingan kini **mengikuti periode aktif**:
- Mode Harian → bandingkan dengan kemarin
- Mode Mingguan → bandingkan dengan minggu lalu
- Mode Bulanan → bandingkan dengan bulan lalu
- Rentang Custom → perbandingan dinonaktifkan (tidak ada periode referensi)

Toggle "Tampilkan Semua" menampilkan ringkasan perbandingan harian, mingguan, dan bulanan sekaligus.
