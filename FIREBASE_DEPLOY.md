# Deploy ke Firebase Hosting

Panduan lengkap untuk melaporkan aplikasi Keuanganku ke Firebase Hosting.

## Prasyarat

- Akun Google
- Proyek Firebase (jika belum ada, buat di https://console.firebase.google.com)
- Firebase CLI terinstall (`npm install -g firebase-tools`)
- Aplikasi sudah di-build (`npm run build`)

## Panduan Langkah demi Langkah

### 1. Install Firebase CLI

Jika belum terinstall:

```bash
npm install -g firebase-tools
```

Verifikas instalasi:
```bash
firebase --version
```

### 2. Login ke Firebase

```bash
firebase login
```

Ini akan membuka browser untuk autentikasi dengan Akun Google Anda.

### 3. Inisialisasi Proyek Firebase Secara Lokal

Di root proyek (folder setoran):

```bash
firebase init hosting
```

Jawab pertanyaan dengan:
- **What do you want to use as your public directory?** → `dist`
- **Configure as a single-page app (rewrite all urls to /index.html)?** → `Y`
- **Set up automatic builds and deploys with GitHub?** → `N` (atau `Y` jika Anda ingin integrasi GitHub)
- **File dist/index.html already exists. Overwrite?** → `N`

Ini akan membuat file:
- `firebase.json` - Konfigurasi Firebase
- `.firebaserc` - Pemetaan ID proyek

### 4. Build Aplikasi untuk Produksi

```bash
npm run build
```

Output akan masuk ke folder `dist/`

### 5. Deploy ke Firebase Hosting

```bash
firebase deploy
```

Atau untuk melaporkan layanan spesifik:
```bash
firebase deploy --only hosting
```

### Output Deployment

Setelah berhasil, Anda akan melihat:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

## Domain Kustom (Opsional)

1. Di Firebase Console → Hosting → Domain
2. Klik "Add custom domain"
3. Ikuti instruksi untuk setup domain Anda

## Deployment Otomatis dengan GitHub (Opsional)

Untuk auto-deploy ketika push ke GitHub:

1. Di Firebase Console → Hosting → Repo yang terhubung
2. Klik "Connect Repository"
3. Pilih repository GitHub Anda
4. Pilih branch untuk deployment produksi
5. Konfigurasi pengaturan build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

Sekarang setiap push ke branch tersebut akan auto-deploy!

## Troubleshooting

### Error: Could not determine executable to run

Install firebase-tools secara lokal di proyek:
```bash
npm install --save-dev firebase-tools
npx firebase deploy
```

### Error: Session token expired

Login kembali:
```bash
firebase logout
firebase login
```

### Dist folder kosong

Build proyek terlebih dahulu:
```bash
npm run build
```

### Tidak dapat menemukan proyek

Tetapkan id proyek:
```bash
firebase use --add
```

Pilih proyek Anda dari daftar.

### Masih ada masalah?

Lihat dokumentasi Firebase CLI:
```bash
firebase help
firebase deploy --help
```

## Variabel Lingkungan Produksi

Variabel lingkungan di `.env.local` hanya dapat diakses pada waktu build, jangan expose di kode client.

Untuk konfigurasi Firebase yang aman, gunakan ini di `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

Jangan khawatir tentang "exposure" API key di client - Firebase memiliki aturan keamanan yang melindungi database Anda.

## Rollback Deployment

Untuk rollback ke versi sebelumnya:

```bash
firebase hosting:channels:list
firebase hosting:clone production staging
firebase hosting:channels:delete previous-channel-id
```

Atau gunakan Firebase Console untuk rollback.

## Memantau Traffic & Performa

Di Firebase Console → Hosting:
- Lihat analitik traffic real-time
- Periksa metrik permintaan
- Pantau riwayat build
- Kelola sertifikat SSL (auto-renewed)

## Langkah Selanjutnya

1. **Setup Domain Kustom** - Gunakan domain sendiri bukan firebase.web.app
2. **Konfigurasi Aturan Keamanan** - Update aturan Firestore untuk produksi
3. **Setup Monitoring** - Gunakan Firebase Analytics
4. **Continuous Deployment** - Setup GitHub Actions untuk auto-deploy

## Sumber Daya Tambahan

- [Dokumentasi Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Dokumentasi Firebase CLI](https://firebase.google.com/docs/cli)
- [Aturan Keamanan Firebase](https://firebase.google.com/docs/database/security)
