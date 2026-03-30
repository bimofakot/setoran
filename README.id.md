# Keuanganku - Aplikasi Manajemen Keuangan Pribadi

**Read this in:** [English](README.md) | [Bahasa Indonesia](README.id.md)

Aplikasi web modern untuk melacak pendapatan dan pengeluaran harian dengan tampilan yang indah dan responsif. Dibangun menggunakan React, TypeScript, Tailwind CSS, dan Firebase untuk penyimpanan data cloud.

## 🌟 Fitur Utama

- **📱 Responsive Design**: Tampilan sempurna di desktop, tablet, dan mobile
- **💾 Cloud Storage**: Data tersimpan aman di Firebase Firestore
- **🔐 Authentication**: Sistem login dan registrasi yang aman dengan Firebase Auth
- **💰 Tracking Transaksi**: Catat pemasukan dan pengeluaran dengan kategori lengkap
- **📊 Dashboard Analytics**: Melihat ringkasan dan statistik keuangan
- **🎯 Filter Tanggal**: Filter berdasarkan hari, minggu, bulan, atau tahun
- **📥 Export Data**: Export laporan ke format CSV, JSON, dan HTML
- **📤 Share Report**: Bagikan laporan ke teman atau keluarga
- **🎨 Modern UI**: Antarmuka yang cantik dengan animasi halus
- **🌓 Responsive Theme**: Otomatis menyesuaikan dengan tema device

## 🛠️ Tech Stack

- **Frontend**: React 19 dengan TypeScript
- **Styling**: Tailwind CSS v4 + Custom Components
- **Icons**: Lucide React
- **Backend/Database**: Firebase (Authentication + Firestore)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Persyaratan

- Node.js 18+
- npm atau yarn
- Account Firebase (untuk database dan hosting)

## 🚀 Instalasi & Setup

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

#### a. Buat Project di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik "Create Project" dan ikuti langkah-langkahnya
3. Pilih atau buat location untuk Firestore Database
4. Enable Authentication dengan Email/Password method

#### b. Dapatkan Firebase Config

1. Di Firebase Console, pilih project Anda
2. Klik ⚙️ (Settings) > Project Settings
3. Scroll down ke "Your apps" section
4. Klik icon `</>` untuk web app
5. Copy konfigurasi Firebase

#### c. Setup Environment Variables

1. Copy file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` dan masukkan Firebase config Anda:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Setup Firestore Database

1. Di Firebase Console, buka Firestore Database
2. Klik "Create Database"
3. Pilih "Start in test mode" untuk development (ubah rules nanti untuk production)
4. Pilih location terdekat

#### Firestore Security Rules (untuk test):

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

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan terbuka di `http://localhost:5173`

## 💻 Development

### Project Structure

```
src/
├── components/      # Komponen UI reusable
├── hooks/          # Custom React hooks
├── lib/            # Konfigurasi Firebase
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main App component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Security Best Practices

### Environment Variables
- **Jangan commit `.env` files ke git** - Gunakan `.env.example` sebagai template
- Selalu gunakan `import.meta.env.VITE_*` untuk environment variables di client
- Jangan expose kunci sensitive di kode

### Firebase Rules

**Development (Test mode):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Production (Recommended):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transaction} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🚀 Deploy ke Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login ke Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
firebase init hosting
```

Jawab pertanyaan:
- Choose your Firebase project: (pilih project Anda)
- What do you want to use as your public directory? `dist`
- Configure as single-page app? `Yes`
- Set up automatic builds and deploys with GitHub? `No` (optional)

### 4. Build & Deploy

```bash
# Build untuk production
npm run build

# Deploy ke Firebase Hosting
firebase deploy
```

URL aplikasi Anda akan muncul di console output.

### Update Deployment

Setiap kali ada perubahan:

```bash
npm run build
firebase deploy
```

## 📱 Responsif Design

Aplikasi ini sepenuhnya responsive dan bekerja sempurna di:
- 📱 Mobile (iOS & Android)
- 📱 Tablet
- 💻 Desktop & Laptop

Breakpoints Tailwind yang digunakan:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🎨 Customization

### Ubah Warna Tema

Edit `src/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: "#3b82f6",    // Ubah primary color
      secondary: "#10b981",  // Ubah secondary color
      danger: "#ef4444",     // Ubah danger color
    },
  },
}
```

### Ubah Kategori Transaksi

Edit `src/components/TransactionForm.tsx`:

```javascript
const incomeCategories = ['Gaji', 'Freelance', ...];
const expenseCategories = ['Makanan & Minuman', ...];
```

## 🐛 Troubleshooting

### Build Error
```bash
# Clear cache dan rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Connection Issues
- Cek `.env.local` apakah sudah benar
- Pastikan Firebase project sudah diaktifkan
- Cek Firestore Database sudah dibuat

### CSS Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Pastikan Tailwind CSS sudah terinstall: `npm list tailwindcss`

## 📖 Dokumentasi Lebih Lanjut

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

## 📝 License

MIT License - Bebas digunakan untuk project personal maupun komersial

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💬 Support

Jika ada pertanyaan atau butuh bantuan, silakan buat issue di GitHub atau hubungi kami melalui email.

---

**Dibuat dengan ❤️ untuk memanajemen keuangan pribadi Anda**
