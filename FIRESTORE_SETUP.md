# Setup Firestore & Aturan Keamanan

## Membuat Firestore Database

### Langkah 1: Buat Database di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih proyek Anda
3. Di sidebar kiri, klik "Firestore Database"
4. Klik "Create database"
5. Pilih lokasi (Asia Tenggara direkomendasikan untuk Indonesia)
6. Pilih "Start in test mode" (untuk development)
7. Klik "Create"

### Langkah 2: Setup Struktur Koleksi

Koleksi akan dibuat secara otomatis ketika Anda input data pertama kali, tetapi Anda bisa buat secara manual:

```
Koleksi: transactions
├── Dokumen: (auto-generated)
│   ├── userId: "user-id"
│   ├── type: "income" atau "expense"
│   ├── category: "Gaji"
│   ├── amount: 1000000
│   ├── description: "Gaji bulan ini"
│   ├── date: Timestamp
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
```

## Aturan Keamanan

### Aturan Development (Mode Test)

Untuk testing di development, gunakan:

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

⚠️ **PERINGATAN**: Mode test memungkinkan siapa pun yang autentikasi untuk read/write. Jangan gunakan di produksi!

### Aturan Produksi (Direkomendasikan)

Untuk produksi, gunakan aturan yang lebih ketat:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Hanya pengguna sendiri yang bisa read/write transaksi mereka
    match /transactions/{transaction} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Aturan Lanjutan dengan Validasi

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fungsi helper untuk memvalidasi data transaksi
    function isValidTransaction() {
      return request.resource.data.keys().hasAll(['userId', 'type', 'category', 'amount', 'date']) &&
             request.resource.data.type in ['income', 'expense'] &&
             request.resource.data.amount > 0;
    }

    match /transactions/{transaction} {
      // Hanya pengguna bisa membaca transaksi mereka
      allow read: if request.auth.uid == resource.data.userId;
      
      // Buat dengan validasi
      allow create: if request.auth != null && 
                       isValidTransaction() &&
                       request.resource.data.userId == request.auth.uid;
      
      // Update dengan validasi
      allow update: if request.auth.uid == resource.data.userId &&
                       (request.resource.data.userId == resource.data.userId) &&
                       isValidTransaction();
      
      // Hapus
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Cara Set Aturan di Firebase Console

1. Buka Firebase Console → Firestore Database
2. Klik tab "Rules"
3. Ganti template dengan aturan yang Anda inginkan
4. Klik "Publish"

## Indexes (Composite Indexes)

Untuk query yang kompleks, Anda mungkin perlu membuat composite index:

```javascript
// Jika Anda query dengan kondisi multiple:
// .where('userId', '==', user.uid)
// .where('type', '==', 'income')
// .orderBy('date', 'desc')

// Firestore akan auto-suggest pembuatan index saat Anda menjalankan query
```

## Testing Aturan

Di Firebase Console Firestore Rules tab, ada "Rules playground":

1. Klik tab "Rules playground"
2. Set user UID dan custom claims
3. Test operasi read/write

## Masalah Umum & Solusi

### Error: Missing or insufficient permissions

**Penyebab**: Aturan Firestore tidak mengizinkan operasi

**Solusi**: 
- Periksa Anda sudah autentikasi (login)
- Verifikasi aturan mengizinkan operasi Anda
- Periksa `userId` di dokumen cocok dengan pengguna autentikasi

### Error: Could not get unknown field

**Penyebab**: Query field yang tidak ada

**Solusi**:
- Verifikasi spelling nama field
- Firestore case-sensitive
- Pastikan data ada di dokumen

### Slow Queries

**Penyebab**: Firestore membutuhkan composite index

**Solusi**:
- Firebase akan auto-suggest index dalam pesan error
- Klik link untuk membuat index
- Pembuatan index biasanya memakan beberapa menit

## Best Practices

1. **User Isolation** - Selalu periksa `userId` cocok pengguna autentikasi
2. **Validation** - Validasi format data di aturan
3. **Limit Read/Write** - Gunakan `.limit()` di query untuk mengurangi biaya
4. **Batch Operations** - Kelompokkan multiple writes untuk efisiensi
5. **Backup** - Export data secara teratur untuk backup

## Pricing Firestore

- **Free tier**: 50.000 reads/hari, unlimited writes/deletes
- **Pay-as-you-go**: Setelah free quota

Kurangi biaya dengan:
- Query efisien dengan proper indexes
- Batasi data per request
- Gunakan `orderBy` dengan proper index
- Hindari operator `!=` (memerlukan full collection scan)

## Data Backup

### Auto Backup dengan Firebase

Firebase secara otomatis backup data, tetapi untuk keamanan ekstra:

```bash
# Export data secara lokal
firebase firestore:export backup-data.backup

# Restore data
firebase firestore:import backup-data.backup
```

Memerlukan Firebase CLI dengan plugin `firestore`.

## Monitoring & Analytics

Di Firebase Console:
- Statistik **Database**
- Monitoring **Real-time**
- Metrik **Usage**
- Log audit **Security**

## Langkah Selanjutnya

1. Atur aturan keamanan yang sesuai untuk environment (dev/prod)
2. Test aturan dengan Rules playground
3. Pantau penggunaan dan optimalkan queries
4. Setup strategi backup
5. Konfigurasi indexes sesuai kebutuhan
