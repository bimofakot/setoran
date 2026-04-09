# Setoranku — Personal Finance App

**Read in:** [English](README.md) | [Bahasa Indonesia](README.id.md)

> 🌐 **Live:** [setoran.massbim.my.id](https://setoran.massbim.my.id)

A premium personal finance web app for tracking daily income and expenses. Built with React 19, TypeScript, Tailwind CSS v4, and Firebase — installable as a native-like PWA on Android.

---

## ✨ Features

### 🎨 Premium UI/UX
- **Three-theme system** — Dark, Light (Pale Lavender Clay), and System Default — persisted across sessions
- **Sidebar navigation** (desktop) + **bottom tab bar** (mobile) — native app feel
- **6 custom geometric avatars** — personalize your profile with hand-crafted SVG avatars
- **Smooth animations** — fade-up, shimmer skeleton, pulse-glow, and micro-interactions throughout
- **Zero pure white** — light mode uses a curated Pale Lavender Clay palette for an elegant, premium look

### 💾 Data & Security
- **Per-user isolation** — all data stored at `users/{userId}/...`, fully isolated between accounts
- **Soft-delete** — deleted transactions flagged `isDeleted: true`, never permanently removed
- **Firebase Auth** — login with email or username; registration enforces unique alphanumeric username
- **Custom categories** — per-user CRUD categories seeded with smart defaults on signup
- **Secret-safe** — `.env.local`, service account keys, and Firebase cache excluded from version control via comprehensive `.gitignore`

### 📱 Progressive Web App (PWA)
- **Installable on Android** — "Add to Home Screen" prompt via browser
- **Offline-ready** — Workbox service worker caches critical assets
- **Standalone mode** — runs without browser chrome, feels native

### 🧾 Smart Transaction Input
- **Real-time Rupiah formatting** — `100000` → `100.000` as you type
- **Category emoji mapping** — 🍜 Makanan, 💼 Gaji, 🚗 Transport, and more
- **Custom category** — "Lainnya" reveals free-text input
- **Mobile-first actions** — Edit/Delete always visible on touch devices (no hover dependency)

### 📊 Dashboard & Analytics
- **Summary cards** — Income, Expense, Balance with progress bars and glow effects
- **Quick stats** — Average per transaction, largest transaction, saving ratio
- **Analytics tab** — Trend line chart, category pie chart, monthly comparison bars (pure SVG, no library)
- **Smart Period Navigator** — Harian/Mingguan/Bulanan/Tahunan with prev/next navigation, available on both Dashboard **and** Analytics page
- **Custom date range** — pick any start–end date directly from the Analytics page

### 📈 Smart Comparison
- **Period-aware comparison** follows the active period:
  - Daily mode → compares with yesterday
  - Weekly mode → compares with last week
  - Monthly mode → compares with last month
  - Custom range → comparison disabled (no reference period)
- **"Tampilkan Semua"** toggle shows daily + weekly + monthly comparison summary at once

### ⚡ Real-time Sync
- **onSnapshot listeners** — every transaction or category change reflects instantly, no refresh needed
- **Cross-tab sync** — changes in one tab appear immediately in all other open tabs
- **Auto cleanup** — listeners are properly unsubscribed on logout and unmount

### 📄 Professional PDF Reports
- **Theme-synced** — PDF header and table colors match your active theme (violet dark or violet light)
- **Two-pass page numbering** — "Halaman X dari Y" on every page
- **Signature area** — city, date, owner name on last page only
- **Formal disclaimer** — auto word-wrapped footer on every page
- **Excel export** — full transaction data with summary sheet

### 💬 Multi-Channel Support
- **Hubungi Kami** — pilih WhatsApp atau Email langsung dari sidebar
- **Auto-filled message** — nama, sumber, dan template kendala sudah terisi otomatis
- **Menu Bantuan** — panduan onboarding 5 langkah di sidebar untuk user baru
- **Update Terbaru** — changelog versi (v1.x.x) di sidebar, sinkron dengan versi PWA manifest

### 🔐 Account Security
- **Ganti Password** — form reauthentication + update password di halaman Profil
- **Kategori sistem terlindungi** — "Lainnya" tidak bisa dihapus; badge "sistem" menggantikan tombol hapus
- **Reset Duplikat** — deduplicate categories button in Kelola Kategori; system categories stay safe
- **Konfirmasi hapus** — alert sebelum menghapus kategori dengan pesan peringatan jelas

### 📐 Fully Responsive
- **Adaptive breakpoints** — `sm` (≥640px), `md` (≥768px), `lg` (≥1024px)
- **Scrollable filter pills** — horizontal scroll on narrow screens, no text clipping
- **Dynamic grids** — stat cards, quick stats, and analytics auto-adjust column count
- **Dynamic padding** — main content padding scales with screen size
- **Auto-hide bottom nav** — mobile nav slides away on scroll down, reappears on scroll up
- **Sticky top nav** — header always visible while scrolling, never hidden

---

## 🛠️ Tech Stack

| Layer | Technology |
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

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/bimofakot/setoran.git
cd setoran
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because vite-plugin-pwa does not yet officially support Vite 7.

### 2. Configure Firebase

Copy `.env.example` to `.env.local` and fill in your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Run

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
      allow read: if true; // for username lookup during login/register
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

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Analytics.tsx         # SVG charts (trend, pie, bar)
│   ├── DateRangeFilter.tsx   # (replaced by PeriodNavigator)
│   ├── ExportShare.tsx       # PDF/Excel export & WA/copy share
│   ├── PeriodNavigator.tsx   # Period nav with prev/next + Custom filter
│   ├── Summary.tsx           # Financial summary + quick stats cards
│   ├── TransactionForm.tsx   # Input form with Rupiah masking
│   ├── TransactionList.tsx   # Grouped list with category emoji
│   └── ui.tsx                # Button, Input, Select, Dialog, Badge
├── hooks/
│   ├── useAuth.ts            # Auth state + category seeding
│   ├── useCategories.ts      # Category CRUD from Firestore (onSnapshot)
│   ├── useProfile.ts         # Profile read/write with avatarId
│   └── useTransactions.ts    # Transaction CRUD (soft-delete, onSnapshot)
├── lib/
│   ├── avatars.ts            # 6 SVG avatar definitions
│   ├── firebase.ts           # Firebase initialization
│   ├── ThemeContext.tsx      # Dark/Light/System theme provider
│   └── userSetup.ts          # Seed default categories on signup
├── pages/
│   ├── AuthPage.tsx          # Login + Signup with show/hide password
│   ├── Dashboard.tsx         # Main layout with sidebar + bottom nav
│   └── ProfilePage.tsx       # Profile, avatar, categories, support
├── types/index.ts
└── utils/helpers.ts
```

---

## 🚢 Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

CI/CD via GitHub Actions — every push to `main` automatically builds and deploys.

---

## 📋 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build (PWA active here)
npm run lint       # Lint code
```

---

## 📝 License

MIT — free to use for personal and commercial purposes.

---

## 🧠 Engineering Notes

### Autoseed vs User Freedom — Balancing Seed Data with User Control

**The Problem:** `initUserCategories` was called on every login via `onAuthStateChanged`. It would re-add any default categories the user had deleted, making it impossible to truly remove them.

**The Solution:** Seed only runs when the categories collection is **completely empty**.

```ts
export const initUserCategories = async (userId: string) => {
  const snapshot = await getDocs(categoriesRef);
  if (!snapshot.empty) return; // only seed on first use
  await Promise.all(DEFAULT_CATEGORIES.map(...));
};
```

**The Principle:** Seed data is a *bootstrap* — it gives new users a useful starting point. After that, the data belongs entirely to the user. No category should be locked or forced back. If the user deletes everything, the seed runs again on next login as a safety net, giving a clean slate without removing user agency.

### Real-time Sync with onSnapshot

Both `useTransactions` and `useCategories` use Firestore `onSnapshot` listeners instead of one-shot `getDocs`. This means:
- Any change (add/edit/delete) reflects instantly across all open tabs.
- No manual `fetchTransactions()` calls needed after mutations.
- Listeners are properly cleaned up on logout and unmount to prevent memory leaks.

### Smart Comparison in Analytics

The monthly comparison panel is now **period-aware**:
- Daily mode → compares with yesterday
- Weekly mode → compares with last week
- Monthly mode → compares with last month
- Custom range → comparison disabled (no reference period)

A "Tampilkan Semua" toggle shows a summary of daily, weekly, and monthly comparisons simultaneously.
