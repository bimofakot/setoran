# ✅ Setup Checklist - Keuanganku

Gunakan checklist ini untuk memastikan semuanya sudah setup dengan benar.

## 🔧 Pre-Setup

- [ ] Node.js 18+ terinstall
- [ ] npm terinstall
- [ ] Git terinstall (untuk version control)
- [ ] Google Account (untuk Firebase)
- [ ] Text editor/IDE (VSCode recommended)

## 📦 Project Setup

- [ ] Clone/download project
- [ ] Navigate ke folder project (`cd setoran`)
- [ ] Run `npm install` untuk install dependencies
- [ ] Verify installation success (check node_modules folder created)

## 🔥 Firebase Setup

### Firebase Console Configuration

- [ ] Buka https://console.firebase.google.com
- [ ] Login dengan Google Account
- [ ] Create new project atau pilih existing project
- [ ] Name project: "Keuanganku" (atau nama pilihan Anda)
- [ ] Create project dan tunggu completion

### Firestore Database

- [ ] Di Firebase Console, klik "Firestore Database"
- [ ] Click "Create database"
- [ ] Select location (pilih Asia Tenggara -Jakarta jika tersedia)
- [ ] Start in "test mode" untuk development
- [ ] Click "Create"
- [ ] Go to "Rules" tab
- [ ] Replace dengan test mode rules:
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
- [ ] Click "Publish"

### Authentication

- [ ] Di sidebar, click "Authentication"
- [ ] Click "Get Started"
- [ ] Click "Email/Password"
- [ ] Enable "Email/Password" toggle
- [ ] Click "Save"

### Firebase Config

- [ ] Di Firebase Console, click ⚙️ (Settings)
- [ ] Click "Project Settings"
- [ ] Scroll ke "Your apps"
- [ ] Click `</>` (web icon) jika belum ada
- [ ] Copy Firebase config yang muncul
- [ ] Save config untuk step berikutnya

## 🌍 Environment Variables

- [ ] Di project root, copy `.env.example` → `.env.local`
- [ ] Open `.env.local`
- [ ] Replace placeholder dengan Firebase config values:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] **JANGAN commit `.env.local` ke git!**
- [ ] Verify `.gitignore` include `.env.local`

## 🚀 Development Testing

- [ ] Run `npm run dev` di terminal
- [ ] Browser terbuka di http://localhost:5173
- [ ] Click "Buat Akun Baru"
- [ ] Register dengan test email/password
- [ ] Verify login successful
- [ ] Click "+ Tambah Transaksi"
- [ ] Fill form (income example):
  - [ ] Tipe: "Pemasukan"
  - [ ] Kategori: "Gaji"
  - [ ] Amount: "1000000"
  - [ ] Date: Today
  - [ ] Click "Tambah Transaksi"
- [ ] Verify transaksi muncul di list
- [ ] Try expense transaction juga
- [ ] Test filter buttons:
  - [ ] Click "Hari Ini" - musti show today transactions
  - [ ] Click "Minggu Ini" - expand ke minggu ini
  - [ ] Try custom date range
- [ ] Test export:
  - [ ] Click "📊 Bagikan"
  - [ ] Click "Salin Teks" - verify copy to clipboard
  - [ ] Click export CSV/JSON/HTML - verify download
- [ ] Test edit transaction:
  - [ ] Click edit icon di transaction
  - [ ] Modify data
  - [ ] Click "Update"
- [ ] Test delete:
  - [ ] Click delete icon
  - [ ] Confirm deletion

## 🔒 Firestore Verification

- [ ] Login ke Firebase Console
- [ ] Open Firestore Database
- [ ] Click "Collections"
- [ ] Verify "transactions" collection exists
- [ ] Click transaction document
- [ ] Verify data struktur correct:
  ```
  userId: (user id value)
  type: "income" atau "expense"
  category: (nilai kategori)
  amount: (number)
  description: (text)
  date: (timestamp)
  createdAt: (timestamp)
  updatedAt: (timestamp)
  ```

## 📱 Mobile Testing

- [ ] Get your local IP address:
  - Linux/Mac: `ifconfig | grep inet`
  - Windows: `ipconfig` → IPv4 Address
- [ ] Run dev server dengan: `npm run dev -- --host`
- [ ] Open URL dari mobile device: `http://YOUR_IP:5173`
- [ ] Test functionality di mobile (input, filter, export)
- [ ] Verify responsive design:
  - [ ] Portrait mode works
  - [ ] Landscape mode works
  - [ ] Buttons/inputs touchable
  - [ ] No overflow/horizontal scroll

## 🏗️ Production Build

- [ ] Run `npm run build` di terminal
- [ ] Verify dist/ folder created
- [ ] Check bundle size (should be reasonable)
- [ ] Verify no build errors

## 🚀 Firebase Hosting Deployment (Optional)

- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Run `firebase login` dan authenticate
- [ ] Run `firebase init hosting`:
  - [ ] Select project
  - [ ] Public directory: `dist`
  - [ ] Single-page app: `Yes`
  - [ ] Overwrite index.html: `No`
- [ ] Run `npm run build` untuk build production
- [ ] Run `firebase deploy`
- [ ] Verify deployment:
  - [ ] Check console output untuk URL
  - [ ] Visit URL di browser
  - [ ] Test satu transaksi
  - [ ] Verify data tersimpan

## 📝 GitHub Setup (Optional)

- [ ] Initialize git: `git init`
- [ ] Verify `.gitignore` has:
  - [ ] `node_modules/`
  - [ ] `dist/`
  - [ ] `.env.local`
  - [ ] `.env`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit: Keuanganku app"`
- [ ] Create GitHub repository
- [ ] Add remote: `git remote add origin <github-url>`
- [ ] Push: `git push -u origin main`
- [ ] Verify repository online

## 📚 Documentation Review

- [ ] Read README.md untuk overview
- [ ] Read QUICK_START.md untuk tips
- [ ] Read PROJECT_INFO.md untuk struktur
- [ ] Bookmark FIREBASE_DEPLOY.md jika butuh deploy lagi
- [ ] Bookmark FIRESTORE_SETUP.md untuk reference rules

## 🎨 Customization (Optional)

Jika ingin customize:

- [ ] Change app name di Dashboard.tsx
- [ ] Update kategori di TransactionForm.tsx
- [ ] Modify warna di tailwind.config.js
- [ ] Add custom logo/icon

## 📤 Final Check

- [ ] Data bisa add/edit/delete
- [ ] Export berfungsi (CSV/JSON/HTML)
- [ ] Filter bekerja dengan baik
- [ ] Mobile responsif
- [ ] Production build successful
- [ ] Firebase deployed (optional)
- [ ] GitHub repo setup (optional)
- [ ] Dokumentasi reviewed

## 🎉 Ready to Go!

Jika semua checklist selesai, aplikasi Keuanganku Anda sudah **SIAP DIGUNAKAN!**

Sekarang Anda bisa:
- Input pendapatan & pengeluaran
- Track keuangan pribadi
- Export laporan
- Share ke keluarga
- Deploy ke cloud
- Backup ke GitHub

---

## 🆘 Troubleshooting

### Aplikasi tidak load
- [ ] Check `.env.local` Firebase config correct
- [ ] Check Firestore database created
- [ ] Check Authentication enabled
- [ ] Check browser console untuk error (F12)
- [ ] Try `npm install` ulang

### Transaksi tidak terlihat
- [ ] Verify Anda logged in
- [ ] Check Firestore anti ada "transactions" collection
- [ ] Check security rules allow read
- [ ] Check network tab di DevTools

### Build error
- [ ] Try `rm -rf node_modules package-lock.json`
- [ ] Run `npm install` ulang
- [ ] Run `npm run build` again

### Deploy error
- [ ] Verify `firebase.json` exist
- [ ] Verify `npm run build` success
- [ ] Check Firebase project ID correct di `.firebaserc`
- [ ] Try `firebase logout` then `firebase login` again

---

**Butuh bantuan?** Check README.md atau lihat dokumentasi setup files! 📖

**Happy tracking dengan Keuanganku!** 💰📊
