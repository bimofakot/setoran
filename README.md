# Keuanganku - Personal Finance Management App

**Read this in:** [English](README.md) | [Bahasa Indonesia](README.id.md)

A modern web application for tracking daily income and expenses with beautiful and responsive design. Built using React, TypeScript, Tailwind CSS, and Firebase for secure cloud data storage.

## 🌟 Key Features

- **📱 Responsive Design**: Perfect display on desktop, tablet, and mobile devices
- **💾 Cloud Storage**: Data securely stored in Firebase Firestore
- **🔐 Authentication**: Secure login and registration with Firebase Auth
- **💰 Transaction Tracking**: Record income and expenses with comprehensive categories
- **📊 Dashboard Analytics**: View financial summaries and statistics
- **🎯 Date Filtering**: Filter by day, week, month, or year
- **📥 Data Export**: Export reports in CSV, JSON, and HTML formats
- **📤 Share Reports**: Share financial summaries with friends and family
- **🎨 Modern UI**: Beautiful interface with smooth animations
- **🌓 Responsive Theme**: Automatically adapts to device theme preferences

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 + Custom Components
- **Icons**: Lucide React
- **Backend/Database**: Firebase (Authentication + Firestore)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Firebase account (for database and hosting)

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/setoran.git
cd setoran
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### a. Create Firebase Project

1. Open [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" and follow the steps
3. Select or create a location for Firestore Database
4. Enable Authentication with Email/Password method

#### b. Get Firebase Configuration

1. In Firebase Console, select your project
2. Click ⚙️ (Settings) > Project Settings
3. Scroll down to "Your apps" section
4. Click `</>` icon for web app
5. Copy the Firebase configuration

#### c. Setup Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and enter your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Setup Firestore Database

1. In Firebase Console, open Firestore Database
2. Click "Create Database"
3. Select "Start in test mode" for development (change rules later for production)
4. Select the nearest location

#### Firestore Security Rules (for testing):

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

### 5. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 💻 Development

### Project Structure

```
src/
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Firebase configuration
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
- **Never commit `.env` files to git** - Use `.env.example` as a template
- Always use `import.meta.env.VITE_*` for client-side environment variables
- Never expose sensitive keys in code

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

## 🚀 Deploy to Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
firebase init hosting
```

Answer the prompts:
- Choose your Firebase project: (select your project)
- What do you want to use as your public directory? `dist`
- Configure as a single-page app? `Yes`
- Set up automatic builds and deploys with GitHub? `No` (optional)

### 4. Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

Your application URL will appear in the console output.

### Update Deployment

Each time you make changes:

```bash
npm run build
firebase deploy
```

## 📱 Responsive Design

The application is fully responsive and works perfectly on:
- 📱 Mobile (iOS & Android)
- 📱 Tablet
- 💻 Desktop & Laptop

Tailwind breakpoints used:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🎨 Customization

### Change Theme Colors

Edit `src/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: "#3b82f6",    // Change primary color
      secondary: "#10b981",  // Change secondary color
      danger: "#ef4444",     // Change danger color
    },
  },
}
```

### Change Transaction Categories

Edit `src/components/TransactionForm.tsx`:

```javascript
const incomeCategories = ['Gaji', 'Freelance', ...];
const expenseCategories = ['Makanan & Minuman', ...];
```

## 🐛 Troubleshooting

### Build Error
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Connection Issues
- Verify `.env.local` is correct
- Ensure Firebase project is activated
- Check that Firestore Database has been created

### CSS Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Verify Tailwind CSS is installed: `npm list tailwindcss`

## 📖 Further Documentation

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [Project Technical Details](docs/TECHNICAL_LOG.md)

## 📝 License

MIT License - Free to use for personal and commercial projects

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💬 Support

If you have any questions or need help, please create an issue on GitHub or contact us via email.

---

**Built with ❤️ for better personal finance management**

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
