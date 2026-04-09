# Setoranku — Personal Finance App

**Read in:** [English](README.md) | [Bahasa Indonesia](README.id.md)

A modern web app for tracking daily income and expenses. Built with React, TypeScript, Tailwind CSS, and Firebase — installable as a native-like app on Android (PWA).

---

## ✨ Features

### 💾 Data & Security
- **Per-user storage** — Transactions stored at `users/{userId}/transactions/`, fully isolated between users
- **User profile** — `fullName`, `username`, `email` stored at `users/{userId}` on registration; `displayName` synced to Firebase Auth
- **Soft-delete** — Deleted transactions are flagged `isDeleted: true`, never permanently removed
- **Firebase Auth** — Secure login with email or username; registration requires unique username (alphanumeric + underscore only)
- **Custom categories** — Each user gets seeded default categories (Salary, Food, etc.) stored at `users/{userId}/categories/` and can be extended

### 📱 Progressive Web App (PWA)
- **Installable on Android** — "Add to Home Screen" prompt appears automatically in browser
- **Offline-ready** — Workbox service worker caches critical assets
- **Standalone mode** — Runs without browser address bar, feels like a native app

### 🧾 Smart Transaction Input
- **Real-time Rupiah formatting** — Numbers formatted as you type (`100000` → `100.000`)
- **Dynamic categories** — Dropdown automatically filters by Income / Expense tab
- **Custom category** — Selecting "Lainnya" reveals a free-text input for custom category names
- **Strict validation** — Only digits accepted; required fields validated before submit

### 📊 Dashboard & Reports
- **Interactive summary cards** — Income, Expense, Balance with hover animation
- **Time filters** — Today, this week, this month, this year, or custom date range
- **Transaction list** — Grouped by day with timestamp (date + time) and zebra striping
- **PDF export** — Professional report: branded header, meta with aligned labels, transaction table (oldest → newest, sticky header per page), neraca saldo summary, signature area, formal disclaimer, and branding footer on every page
- **WhatsApp share** — Full transaction breakdown per line with totals and app link
- **Copy text** — Plain-text report with per-transaction detail, safe to paste anywhere

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
git clone https://github.com/your-username/setoran.git
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
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── TransactionForm.tsx   # Input form with Rupiah masking
│   ├── TransactionList.tsx   # Transaction list with zebra striping
│   ├── Summary.tsx           # Financial summary cards
│   ├── DateRangeFilter.tsx   # Period filter
│   ├── ExportShare.tsx       # PDF export & WhatsApp share
│   └── ui.tsx                # Base UI components
├── hooks/
│   ├── useTransactions.ts    # CRUD (per-user path, soft-delete)
│   ├── useAuth.ts            # Auth + category initialization
│   └── useCategories.ts      # Read categories from Firestore
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   └── userSetup.ts          # Seed default categories for new users
├── pages/
│   ├── Dashboard.tsx
│   └── AuthPage.tsx
├── types/index.ts
└── utils/helpers.ts
```

---

## 🚢 Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

CI/CD via GitHub Actions is configured — every push to `main` automatically builds and deploys.

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
