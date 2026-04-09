# Setoranku — Aplikasi Keuangan Pribadi

**Baca dalam:** [English](README.md) | [Bahasa Indonesia](README.id.md)

Aplikasi web modern untuk mencatat pemasukan dan pengeluaran harian. Dibangun dengan React, TypeScript, Tailwind CSS, dan Firebase — kini bisa diinstal sebagai aplikasi di Android (PWA).

---

## ✨ Fitur Utama

### 💾 Data & Keamanan
- **Penyimpanan per-user** — Data transaksi tersimpan di path `users/{userId}/transactions/`, terisolasi antar pengguna
- **Soft-Delete** — Transaksi yang dihapus tidak benar-benar hilang, hanya ditandai `isDeleted: true`
- **Autentikasi Firebase** — Login & registrasi aman dengan Firebase Auth
- **Kategori Custom** — Setiap user mendapat kategori default (Gaji, Makanan, dll) yang tersimpan di `users/{userId}/categories/` dan bisa dikembangkan

### 📱 Progressive Web App (PWA)
- **Bisa diinstal di Android** — Muncul tombol "Install App" otomatis di browser
- **Offline-ready** — Service worker via Workbox meng-cache aset penting
- **Tampil seperti native app** — Mode `standalone`, tanpa address bar

### 🧾 Input Transaksi yang Cerdas
- **Format Rupiah otomatis** — Angka diformat real-time saat diketik (contoh: `100000` → `100.000`)
- **Kategori dinamis** — Dropdown kategori otomatis berubah sesuai tab Pemasukan/Pengeluaran
- **Validasi ketat** — Input hanya menerima angka, field wajib divalidasi sebelum submit

### 📊 Dashboard & Laporan
- **Kartu ringkasan interaktif** — Pemasukan, Pengeluaran, Saldo dengan efek hover animasi
- **Filter waktu** — Hari ini, minggu ini, bulan ini, tahun ini, atau rentang custom
- **Daftar transaksi** — Dikelompokkan per hari, zebra striping untuk keterbacaan
- **Export PDF** — Laporan rapi: judul, ringkasan, tabel transaksi dengan warna header biru
- **Share WhatsApp** — Kirim ringkasan keuangan langsung ke WhatsApp dengan format pesan yang bersih

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
