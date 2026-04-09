# Setoranku — Aplikasi Keuangan Pribadi

**Baca dalam:** [English](README.md) | [Bahasa Indonesia](README.id.md)

Aplikasi web modern untuk mencatat pemasukan dan pengeluaran harian. Dibangun dengan React, TypeScript, Tailwind CSS, dan Firebase — kini bisa diinstal sebagai aplikasi di Android (PWA).

---

## ✨ Fitur Utama

### 💾 Data & Keamanan
- **Penyimpanan per-user** — Data transaksi tersimpan di `users/{userId}/transactions/`, terisolasi antar pengguna
- **Profil user** — `fullName`, `username`, `email` tersimpan di `users/{userId}` saat registrasi; `displayName` disinkronkan ke Firebase Auth
- **Soft-Delete** — Transaksi yang dihapus tidak benar-benar hilang, hanya ditandai `isDeleted: true`
- **Autentikasi Firebase** — Login dengan email atau username; registrasi memerlukan username unik (alfanumerik + underscore)
- **Kategori Custom** — Setiap user mendapat kategori default (Gaji, Makanan, dll) yang tersimpan di `users/{userId}/categories/` dan bisa dikembangkan

#### Mengapa Kategori Disimpan Per-Dokumen?

Setiap kategori disimpan sebagai dokumen terpisah di Firestore, bukan sebagai array dalam satu dokumen. Ini dipilih karena tiga alasan:

- **Skalabilitas** — User bisa menambah kategori kustom sendiri di masa depan tanpa mengubah struktur data yang sudah ada
- **Data Integrity** — Jika satu kategori terhapus, kategori lain tidak terpengaruh sama sekali
- **Recovery** — Jika user tidak sengaja menghapus kategori, admin bisa membuat ulang dokumen baru dengan ID baru tanpa merusak histori transaksi lama — karena transaksi menyimpan **nama kategori sebagai string**, bukan referensi ID dokumen

### 📱 Progressive Web App (PWA)
- **Bisa diinstal di Android** — Muncul prompt "Tambahkan ke Layar Utama" otomatis di browser
- **Offline-ready** — Service worker via Workbox meng-cache aset penting
- **Tampil seperti native app** — Mode `standalone`, tanpa address bar browser

### 🧾 Input Transaksi yang Cerdas
- **Format Rupiah otomatis** — Angka diformat real-time saat diketik (`100000` → `100.000`)
- **Kategori dinamis** — Dropdown kategori otomatis berubah sesuai tab Pemasukan / Pengeluaran
- **Kategori kustom** — Memilih "Lainnya" memunculkan input teks bebas untuk nama kategori sendiri
- **Validasi ketat** — Input hanya menerima angka; field wajib divalidasi sebelum submit

### 📊 Dashboard & Laporan
- **Kartu ringkasan interaktif** — Pemasukan, Pengeluaran, Saldo dengan efek hover animasi
- **Filter waktu** — Hari ini, minggu ini, bulan ini, tahun ini, atau rentang tanggal custom
- **Daftar transaksi** — Dikelompokkan per hari dengan timestamp (tanggal + jam) dan zebra striping
- **Export PDF** — Laporan profesional: header bermerek, meta dengan label sejajar, tabel transaksi (tertua → terbaru, sticky header per halaman), neraca saldo, area tanda tangan, disclaimer formal, dan footer branding di setiap halaman
- **Share WhatsApp** — Rincian transaksi per baris beserta total dan link aplikasi
- **Salin Teks** — Laporan plain-text dengan detail per transaksi, aman di-paste ke mana saja

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
git clone https://github.com/your-username/setoran.git
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
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🏗️ Struktur Project

```
src/
├── components/
│   ├── TransactionForm.tsx   # Form input dengan masking Rupiah
│   ├── TransactionList.tsx   # Daftar transaksi dengan zebra striping
│   ├── Summary.tsx           # Kartu ringkasan keuangan
│   ├── DateRangeFilter.tsx   # Filter periode
│   ├── ExportShare.tsx       # Export PDF & share WhatsApp
│   └── ui.tsx                # Komponen UI dasar
├── hooks/
│   ├── useTransactions.ts    # CRUD transaksi (path per-user, soft-delete)
│   ├── useAuth.ts            # Autentikasi + inisialisasi kategori
│   └── useCategories.ts      # Baca kategori dari Firestore
├── lib/
│   ├── firebase.ts           # Inisialisasi Firebase
│   └── userSetup.ts          # Seed kategori default untuk user baru
├── pages/
│   ├── Dashboard.tsx
│   └── AuthPage.tsx
├── types/index.ts
└── utils/helpers.ts
```

---

## 🚢 Deploy ke Firebase Hosting

```bash
npm run build
firebase deploy
```

CI/CD via GitHub Actions sudah dikonfigurasi — setiap push ke `main` otomatis build dan deploy.

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
