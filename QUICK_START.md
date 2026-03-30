# 🚀 Quick Start Guide - Keuanganku

Panduan cepat untuk mulai menggunakan aplikasi Keuanganku.

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/your-username/setoran.git
cd setoran
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Firebase

#### a. Buat Firebase Project
- Buka https://console.firebase.google.com
- Klik "Create Project"
- Beri nama project (misal: "Keuanganku")
- Tunggu project selesai dibuat

#### b. Enable Firestore Database
- Di Firebase Console, klik "Firestore Database"
- Klik "Create Database"
- Pilih lokasi terdekat
- Mulai dengan test mode (untuk development)

#### c. Enable Authentication
- Di sidebar, klik "Authentication"
- Klik "Get Started"
- Pilih "Email/Password" dan enable
- Klik "Save"

#### d. Copy Firebase Config
- Di Firebase Console, klik ⚙️ (Settings)
- Scroll ke "Your apps"
- Klik web icon `</>`
- Copy config

### 4. Setup Environment Variables

Buat file `.env.local` di root project:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan buka di http://localhost:5173

## 📋 Firestore Security Rules

Untuk development, gunakan rules ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Copy ke Firebase Console → Firestore → Rules tab

## 🎯 Cara Menggunakan Aplikasi

### 1. Register Akun
- Klik button "Buat Akun Baru"
- Isi email dan password (minimal 6 karakter)
- Klik "Buat Akun"

### 2. Login
- Isi email dan password
- Klik "Masuk"

### 3. Tambah Transaksi
- Klik tombol "+ Tambah Transaksi" (atau FAB di mobile)
- Pilih tipe: Pemasukan atau Pengeluaran
- Pilih kategori
- Masukkan jumlah
- Pilih tanggal
- Opsional: Tambah deskripsi
- Klik "Tambah Transaksi"

### 4. Filter Transaksi
- Gunakan tombol filter hari/minggu/bulan/tahun/custom
- Atau filter dengan date range custom

### 5. Export/Share Laporan
- Klik tombol "📊 Bagikan"
- Salin teks untuk bagikan ke WhatsApp/Email
- Atau export ke CSV/JSON/HTML
- File akan otomatis didownload

## 📱 Akses dari Mobile

- Buka aplikasi Anda dari mobile browser
- Bookmark di home screen untuk quick access
- Atau install sebagai PWA (Add to Home Screen)

## 🚀 Deploy ke Firebase Hosting

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login
```bash
firebase login
```

### 3. Init Firebase Project
```bash
firebase init hosting
```

Jawab:
- Public directory: `dist`
- Single page app: `Y`

### 4. Build & Deploy
```bash
npm run build
firebase deploy
```

URL aplikasi Anda akan muncul di console.

## 🔧 Customize Aplikasi

### Ubah Nama Aplikasi
- Edit file `src/pages/Dashboard.tsx` line 45
- Ubah "Keuanganku" ke nama yang Anda inginkan

### Ubah Warna Tema
- Edit `src/tailwind.config.js`
- Ubah colors di theme.extend

### Ubah Kategori
- Edit `src/components/TransactionForm.tsx` line 7-18
- Tambah/hapus kategori sesuai kebutuhan

## 🐛 Troubleshooting

### App not loading
- Clear browser cache
- Check console untuk error messages (F12)
- Verify Firebase config di `.env.local`

### Can't login
- Verify email dan password correct
- Check Firebase Authentication enabled
- Pastikan user sudah registered

### Import/Export tidak berfungsi
- Check browser supports download API
- Verify permission to write files

### Data tidak tersimpan
- Check network connection
- Verify Firestore règles allow write
- Check user authenticated

## 📚 Dokumentasi Lengkap

- [README.md](./README.md) - Setup lengkap
- [FIREBASE_DEPLOY.md](./FIREBASE_DEPLOY.md) - Deploy guide
- [Firebase Documentation](https://firebase.google.com/docs)

## 💡 Tips & Tricks

1. **Backup Data**: Export regular ke CSV/JSON
2. **Share Laporan**: Gunakan fitur export untuk berbagi dengan keluarga
3. **Mobile First**: Design responsif, buka di mobile untuk UX terbaik
4. **Keyboard Shortcut**: Enter untuk submit form
5. **Undo**: Tidak ada undo, tapi bisa edit langsung dari list

## 🤝 Butuh Help?

- Baca README.md untuk detail lengkap
- Check Firebase documentation
- Create issue di GitHub jika ada bug

Happy tracking! 💰📊

---

**Keuanganku v1.0** - Build dengan React + Firebase 🔥
