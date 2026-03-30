# Informasi Proyek & Struktur File

## 📂 Struktur Folder Proyek

```
setoran/
├── src/
│   ├── components/           # Komponen UI reusable
│   │   ├── ui.tsx           # Base UI components (Button, Input, Dialog, etc)
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── Summary.tsx       # Summary cards & quick stats
│   │   ├── DateRangeFilter.tsx
│   │   └── ExportShare.tsx   # Export & share modal
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Firebase authentication hook
│   │   └── useTransactions.ts # Firestore CRUD operations
│   │
│   ├── lib/
│   │   └── firebase.ts      # Firebase configuration & initialization
│   │
│   ├── pages/               # Page components
│   │   ├── AuthPage.tsx     # Login & Signup pages
│   │   └── Dashboard.tsx    # Main dashboard
│   │
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   │
│   ├── utils/
│   │   └── helpers.ts       # Utility functions (format, calculation)
│   │
│   ├── App.tsx              # Main app component with routing logic
│   ├── main.tsx             # React DOM render entry point
│   └── index.css            # Global styles dengan Tailwind
│
├── public/                  # Static assets
│
├── dist/                    # Production build output (setelah npm run build)
│
├── .env.example             # Environment variables template
├── .env.local              # Local environment variables (jangan commit!)
├── .gitignore              # Git ignore rules
├── .firebaserc             # Firebase project mapping
├── firebase.json           # Firebase hosting config
├── package.json            # Dependencies & scripts
├── package-lock.json       # Dependency lock file
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
│
├── README.md               # Main documentation
├── QUICK_START.md          # Quick start guide (Bahasa Indonesia)
├── FIREBASE_DEPLOY.md      # Firebase Hosting deployment guide
└── FIRESTORE_SETUP.md      # Firestore database setup guide
```

## 📋 Daftar File Penting

### Titik Entry
- **main.tsx** - Inisialisasi aplikasi React 19
- **App.tsx** - Komponen aplikasi utama dengan logika autentikasi

### Komponen (Dapat Digunakan Kembali)
- **ui.tsx** - Perpustakaan komponen UI dasar
  - Button, Input, Select, Dialog, Textarea, Badge
- **TransactionForm.tsx** - Modal form untuk menambah/mengedit transaksi
- **TransactionList.tsx** - Tampilan daftar dengan pengelompokan berdasarkan tanggal
- **Summary.tsx** - Kartu ringkasan & statistik cepat
- **DateRangeFilter.tsx** - Tombol filter untuk periode
- **ExportShare.tsx** - Modal ekspor/bagikan modern dengan pratinjau

### Halaman/Layar
- **AuthPage.tsx** - Layar login & pendaftaran
- **Dashboard.tsx** - Dashboard utama dengan fungsionalitas lengkap

### Logika
- **useAuth.ts** - Hook autentikasi Firebase
- **useTransactions.ts** - Operasi CRUD Firestore
- **firebase.ts** - Inisialisasi SDK Firebase

### Utilitas
- **helpers.ts** - Formatter mata uang, utilitas tanggal, statistik

### Konfigurasi
- **tailwind.config.js** - Kustomisasi Tailwind CSS
- **postcss.config.js** - Plugin PostCSS
- **.env.example** - Template variabel lingkungan

## 🔑 Fitur Utama

### Autentikasi  
```typescript
// useAuth.ts menangani:
- Pendaftaran pengguna dengan email/password
- Login pengguna
- Logout pengguna
- Manajemen keadaan autentikasi
- Penanganan kesalahan
```

### Transaksi
```typescript
// useTransactions.ts menangani:
- Buat transaksi (tambah)
- Baca transaksi (ambil)
- Perbarui transaksi (edit)
- Hapus transaksi (hapus)
- Filter berdasarkan rentang tanggal
```

### Komponen UI
```typescript
// ui.tsx berisi:
- Button (varian: primary, secondary, danger, success)
- Input (dengan label, error, helpText)
- Select (dropdown)
- Dialog (modal)
- Textarea (input multi-baris)
- Badge (indikator status)
```

### Format Ekspor
```typescript
// ExportShare.tsx mendukung:
- CSV (kompatibel spreadsheet)
- JSON (pertukaran data)
- HTML (tampilan cetak browser)
- Berbagi teks (WhatsApp, Email, dll)
```

## 🎨 Sistem Desain

### Warna
- **Primary**: Biru (#3b82f6) - Aksi utama
- **Secondary**: Hijau (#10b981) - Pemasukan/positif
- **Danger**: Merah (#ef4444) - Pengeluaran/negatif
- **Warning**: Amber (#f59e0b) - Peringatan

### Tipografi
- Font: System UI (Segoe UI, Roboto, dll)
- Heading: Tebal, berat 900
- Body: Reguler, berat 400
- Kode Mono: Courier New

### Jarak
- Dasar: 4px (default Tailwind)
- Padding kecil: 1rem (4x dasar)
- Padding besar: 1.5rem (6x dasar)

## 📊 Struktur Data

### Dokumen Transaksi
```typescript
interface Transaction {
  id: string;              // Auto-generated Firestore
  userId: string;          // Pengguna yang memiliki transaksi
  type: 'income' | 'expense';
  category: string;        // Misalnya, "Gaji", "Makanan"
  amount: number;          // Dalam IDR
  description: string;     // Catatan opsional
  date: Date;             // Tanggal transaksi
  createdAt: Date;        // Kapan dibuat
  updatedAt: Date;        // Waktu update terakhir
}
```

### Struktur Koleksi Firestore
```
Database Firestore (Keuanganku)
└── Koleksi: transactions
    ├── Dokumen: <auto-id>
    │   ├── userId: "abc123"
    │   ├── type: "expense"
    │   ├── category: "Makanan & Minuman"
    │   ├── amount: 50000
    │   ├── description: "Makan siang"
    │   ├── date: Timestamp(2024-01-15)
    │   ├── createdAt: Timestamp(sekarang)
    │   └── updatedAt: Timestamp(sekarang)
    │
    └── Dokumen: <id-lain>
        └── ...
```

## 🚀 Build & Deployment

### Development
```bash
npm run dev
# Menjalankan: vite
# Dibuka di: http://localhost:5173
```

### Production Build
```bash
npm run build
# Menjalankan: tsc -b && vite build
# Output: folder dist/
```

### Preview Build
```bash
npm run preview
# Menjalankan: vite preview
# Pratinjau production build secara lokal
```

### Deploy ke Firebase
```bash
npm run build
firebase deploy --only hosting
```

## 📦 Dependensi

### Core
- **react**: 19.x - Perpustakaan UI
- **react-dom**: 19.x - Rendering DOM

### Firebase
- **firebase**: 12.x - SDK Firebase

### Styling
- **tailwindcss**: 4.x - Utilitas CSS
- **@tailwindcss/postcss**: 4.x - Plugin PostCSS Tailwind

### Komponen UI
- **lucide-react**: 1.x - Perpustakaan ikon
- **@radix-ui/react-dialog**: Komponen dialog
- **@radix-ui/react-dropdown-menu**: Menu dropdown
- **@radix-ui/react-popover**: Komponen popover

### Utilitas
- **clsx**: Utilitas classname bersyarat
- **tailwind-merge**: Merge kelas Tailwind

### Dev Dependencies
- **typescript**: Pengecekan tipe
- **vite**: Alat build
- **@vitejs/plugin-react**: Dukungan React
- **eslint**: Linting kode

## 🔐 Pertimbangan Keamanan

1. **API Keys** - Kunci API Firebase di client adalah OK (Firebase memiliki aturan keamanan)
2. **Variabel Lingkungan** - Gunakan `.env.local` jangan commit ke git
3. **Aturan Firestore** - Harus mengatur aturan yang tepat untuk melindungi data
4. **CORS** - Firebase menangani CORS secara otomatis
5. **SSL/TLS** - Firebase Hosting menyediakan sertifikat SSL gratis

## 📈 Pemantauan & Logging

### Konsol Firebase
- Pantau penggunaan database real-time
- Lihat log autentikasi
- Periksa log audit keamanan
- Lacak traffic hosting & performa

### Development
- Gunakan DevTools browser (F12)
- Periksa konsol untuk kesalahan
- Tab Network untuk API calls
- Ekstensi React DevTools direkomendasikan

## 🎯 Peningkatan di Masa Depan

Fitur yang mungkin untuk versi masa depan:
- [ ] Manajemen kategori kustom
- [ ] Pemberitahuan & alert anggaran
- [ ] Grafik & analitik
- [ ] Transaksi berulang
- [ ] Dukungan multi-mata uang
- [ ] Toggle mode gelap
- [ ] Dukungan offline (PWA)
- [ ] Import dari CSV
- [ ] Backup Google Drive
- [ ] Pelacakan pendapatan tim/keluarga

## 📝 Catatan

- Proyek menggunakan React 19 (terbaru)
- TypeScript untuk keamanan tipe
- Tailwind CSS v4 dengan syntax baru
- Firebase Firestore sebagai database
- Desain sepenuhnya responsif
- Production-ready build

## 📮 Dukungan & Dokumentasi

- Dokumentasi utama: [README.md](./README.md)
- Mulai cepat: [QUICK_START.md](./QUICK_START.md)
- Deploy Firebase: [FIREBASE_DEPLOY.md](./FIREBASE_DEPLOY.md)
- Setup Firestore: [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)
