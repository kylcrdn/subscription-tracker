# Project Folder Structure

A comprehensive guide to the Subscription Tracker project organization.

## Table of Contents
1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Folder Descriptions](#folder-descriptions)
4. [Best Practices](#best-practices)
5. [Adding New Features](#adding-new-features)

---

## Overview

The project follows a **feature-based** folder structure, organizing code by functionality rather than file type. This makes it easier to:

- Find related files quickly
- Scale the application
- Maintain code separation
- Understand project architecture
- Add new features without affecting existing code

---

## Directory Structure

```
subscription-tracker/
├── docs/                                  # 📚 Documentation
│   ├── CLOUD_FUNCTIONS_SETUP.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── NOTIFICATION_SYSTEM_GUIDE.md
│   ├── QUICK_REFERENCE.md
│   ├── SYSTEM_VERIFICATION.md
│   ├── FOLDER_STRUCTURE.md (this file)
│   └── debug-notifications.html
│
├── functions/                             # ☁️ Cloud Functions (Firebase)
│   ├── index.js                           # Email notification service
│   ├── package.json
│   └── README.md
│
├── public/                                # 🌐 Static assets
│   └── (static files served directly)
│
├── src/                                   # 💻 Source code
│   │
│   ├── components/                        # 🧩 React components
│   │   ├── features/                      # Feature-based components
│   │   │   ├── auth/                      # Authentication feature
│   │   │   │   ├── login/
│   │   │   │   │   └── LoginPage.jsx
│   │   │   │   └── register/
│   │   │   │       └── RegisterPage.jsx
│   │   │   │
│   │   │   └── subscriptions/             # Subscription management feature
│   │   │       ├── HomePage.jsx           # Main dashboard
│   │   │       ├── SubscriptionCard.jsx   # Individual subscription display
│   │   │       ├── SubscriptionModal.jsx  # Add/Edit subscription form
│   │   │       └── NotificationBell.jsx   # Notification dropdown
│   │   │
│   │   └── common/                        # Shared/reusable components
│   │       └── ConfirmDialog.jsx          # Confirmation modal
│   │
│   ├── contexts/                          # ⚛️ React Context providers
│   │   └── authContext/
│   │       └── index.jsx                  # Authentication state management
│   │
│   ├── firebase/                          # 🔥 Firebase integration
│   │   ├── Firebase.js                    # Firebase configuration
│   │   ├── auth.js                        # Authentication functions
│   │   └── firestore.js                   # Database CRUD operations
│   │
│   ├── hooks/                             # 🪝 Custom React hooks
│   │   └── (empty - ready for custom hooks)
│   │
│   ├── lib/                               # 🛠️ Utility functions & helpers
│   │   └── (empty - ready for utilities)
│   │
│   ├── constants/                         # 📋 App constants
│   │   └── (empty - ready for constants)
│   │
│   ├── services/                          # 🔌 External services
│   │   └── (empty - ready for API services)
│   │
│   ├── assets/                            # 🖼️ Images, fonts, etc.
│   │   └── (empty - ready for assets)
│   │
│   ├── App.jsx                            # Main application component
│   └── main.jsx                           # Application entry point
│
├── firebase.json                          # Firebase configuration
├── firestore.rules                        # Firestore security rules
├── firestore.indexes.json                 # Firestore composite indexes
├── package.json                           # Project dependencies
├── vite.config.js                         # Vite build configuration
├── vitest.config.js                       # Test configuration
├── eslint.config.js                       # ESLint configuration
├── index.html                             # HTML template
└── README.md                              # Project overview
```

---

## Folder Descriptions

### 📚 `/docs`
**Purpose:** All project documentation

**Contents:**
- Setup guides
- Deployment checklists
- System architecture documentation
- Feature guides
- Debug tools

**When to add here:**
- New feature documentation
- API documentation
- Troubleshooting guides
- Architecture decision records (ADRs)

---

### 💻 `/src/components`

#### `/features` - Feature-based components
**Purpose:** Components organized by application features

**Structure:**
```
features/
  ├── auth/           # Authentication-related components
  ├── subscriptions/  # Subscription management components
  └── [new-feature]/  # Add new features here
```

**Guidelines:**
- Each feature folder contains all components for that feature
- Components within a feature can import from each other
- Features should be as independent as possible
- Cross-feature communication should happen through contexts or services

**Example: Adding a new "Settings" feature**
```
features/
  └── settings/
      ├── SettingsPage.jsx
      ├── ProfileSettings.jsx
      ├── NotificationSettings.jsx
      └── BillingSettings.jsx
```

#### `/common` - Shared components
**Purpose:** Reusable UI components used across multiple features

**What goes here:**
- Generic UI components (buttons, inputs, modals)
- Layout components (headers, footers, sidebars)
- Shared business logic components

**Examples:**
- `ConfirmDialog.jsx` - Used by multiple features
- `Button.jsx` - Reusable button component
- `Modal.jsx` - Generic modal wrapper
- `LoadingSpinner.jsx` - Loading indicator

**Guidelines:**
- Should have no feature-specific logic
- Should be highly reusable
- Should accept props for customization
- Should be well-documented

---

### ⚛️ `/src/contexts`
**Purpose:** React Context providers for global state

**Current contexts:**
- `authContext` - User authentication state

**When to add:**
- Global state needed across multiple features
- User preferences/settings
- Theme management
- Language/localization

**Example structure:**
```javascript
// contexts/themeContext/index.jsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

---

### 🔥 `/src/firebase`
**Purpose:** All Firebase-related code

**Files:**
- `Firebase.js` - Firebase initialization and config
- `auth.js` - Authentication functions (login, signup, logout)
- `firestore.js` - Database operations (CRUD)

**Guidelines:**
- Keep Firebase logic separate from components
- Export functions, not implementations
- Handle errors within these modules
- Use async/await for all Firebase operations

**Example:**
```javascript
// firestore.js
export const getSubscription = async (userId, subscriptionId) => {
  try {
    const docRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};
```

---

### 🪝 `/src/hooks`
**Purpose:** Custom React hooks (currently empty, ready for use)

**What goes here:**
- Reusable stateful logic
- Common side effects
- Data fetching patterns
- Form handling logic

**Examples:**
```javascript
// hooks/useLocalStorage.js
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// hooks/useSubscriptions.js
export const useSubscriptions = (userId) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToSubscriptions(userId, (subs) => {
      setSubscriptions(subs);
      setLoading(false);
    });
  }, [userId]);

  return { subscriptions, loading };
};
```

---

### 🛠️ `/src/lib`
**Purpose:** Utility functions and helpers (currently empty, ready for use)

**What goes here:**
- Date formatting utilities
- String manipulation
- Number formatting (currency, percentages)
- Validation functions
- Common calculations

**Examples:**
```javascript
// lib/dateUtils.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getDaysUntil = (futureDate) => {
  const today = new Date();
  const future = new Date(futureDate);
  const diffTime = future - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// lib/currencyUtils.js
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};
```

---

### 📋 `/src/constants`
**Purpose:** Application constants (currently empty, ready for use)

**What goes here:**
- Billing cycles
- Categories
- API endpoints
- Configuration values

**Examples:**
```javascript
// constants/billing.js
export const BILLING_CYCLES = {
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
};

export const NOTIFICATION_DAYS = 3;

// constants/categories.js
export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Storage',
  'Development',
  'Music',
  'Other'
];

// constants/routes.js
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  SETTINGS: '/settings'
};
```

---

### 🔌 `/src/services`
**Purpose:** External API integrations (currently empty, ready for use)

**What goes here:**
- Third-party API clients
- External service integrations
- Data transformation layers

**Examples:**
```javascript
// services/emailService.js
export const sendReminderEmail = async (email, subscription) => {
  // Integration with email service
};

// services/analyticsService.js
export const trackEvent = (eventName, properties) => {
  // Analytics tracking
};
```

---

## Best Practices

### 1. Component Organization

**✅ DO:**
```
features/
  subscriptions/
    HomePage.jsx
    SubscriptionCard.jsx
    SubscriptionModal.jsx
    NotificationBell.jsx
```

**❌ DON'T:**
```
components/
  HomePage.jsx
  SubscriptionCard.jsx
  LoginPage.jsx
  RegisterPage.jsx
  (all mixed together)
```

### 2. Imports

**✅ DO:**
```javascript
// Use relative paths correctly
import ConfirmDialog from '../../common/ConfirmDialog';
import { useAuth } from '../../../contexts/authContext';
```

**❌ DON'T:**
```javascript
// Avoid absolute paths without configuration
import ConfirmDialog from 'src/components/common/ConfirmDialog';
```

### 3. File Naming

**✅ DO:**
- Use PascalCase for component files: `HomePage.jsx`
- Use camelCase for utility files: `dateUtils.js`
- Use kebab-case for CSS files: `button-styles.css`

**❌ DON'T:**
- Mix naming conventions: `home-page.jsx`, `HomePage.js`

### 4. Feature Independence

**✅ DO:**
```javascript
// Communicate between features through contexts
const { currentUser } = useAuth();

// Or through services
import { getSubscription } from '../../../firebase/firestore';
```

**❌ DON'T:**
```javascript
// Import directly from other features
import { calculateTotal } from '../subscriptions/HomePage';
```

---

## Adding New Features

### Step-by-Step Guide

#### 1. Create Feature Folder
```bash
mkdir src/components/features/[feature-name]
```

#### 2. Add Components
```bash
# Example: Adding a Settings feature
mkdir src/components/features/settings
touch src/components/features/settings/SettingsPage.jsx
touch src/components/features/settings/ProfileSettings.jsx
```

#### 3. Update Routes
```javascript
// App.jsx
import SettingsPage from './components/features/settings/SettingsPage';

<Route path="/settings" element={
  <ProtectedRoute>
    <SettingsPage />
  </ProtectedRoute>
} />
```

#### 4. Add Firebase Functions (if needed)
```javascript
// firebase/firestore.js
export const getUserSettings = async (userId) => {
  // Implementation
};

export const updateUserSettings = async (userId, settings) => {
  // Implementation
};
```

#### 5. Create Context (if needed)
```bash
mkdir src/contexts/settingsContext
touch src/contexts/settingsContext/index.jsx
```

#### 6. Add Constants
```javascript
// constants/settings.js
export const DEFAULT_SETTINGS = {
  notifications: true,
  theme: 'dark',
  language: 'en'
};
```

#### 7. Add Utilities
```javascript
// lib/settingsUtils.js
export const validateSettings = (settings) => {
  // Validation logic
};
```

#### 8. Document
```bash
# Add feature documentation
touch docs/SETTINGS_FEATURE.md
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `HomePage.jsx` |
| Utility Functions | camelCase | `dateUtils.js` |
| Constants | UPPER_SNAKE_CASE | `BILLING_CYCLES` |
| Hooks | camelCase with 'use' prefix | `useSubscriptions.js` |
| Contexts | camelCase with 'Context' suffix | `authContext/` |
| Services | camelCase with 'Service' suffix | `emailService.js` |
| CSS/Styles | kebab-case | `button-styles.css` |

---

## Import Path Patterns

### From Feature Component to:

**Another component in same feature:**
```javascript
import SubscriptionCard from './SubscriptionCard';
```

**Common component:**
```javascript
import ConfirmDialog from '../../common/ConfirmDialog';
```

**Context:**
```javascript
import { useAuth } from '../../../contexts/authContext';
```

**Firebase:**
```javascript
import { addSubscription } from '../../../firebase/firestore';
```

**Utilities:**
```javascript
import { formatDate } from '../../../lib/dateUtils';
```

**Constants:**
```javascript
import { BILLING_CYCLES } from '../../../constants/billing';
```

---

## Migration Notes

### What Changed

**Before:**
```
src/components/
  auth/
    login/LoginPage.jsx
    register/RegisterPage.jsx
  home/
    HomePage.jsx
    SubscriptionCard.jsx
    NotificationBell.jsx
    ConfirmDialog.jsx
```

**After:**
```
src/components/
  features/
    auth/
      login/LoginPage.jsx
      register/RegisterPage.jsx
    subscriptions/
      HomePage.jsx
      SubscriptionCard.jsx
      NotificationBell.jsx
      SubscriptionModal.jsx
  common/
    ConfirmDialog.jsx
```

### Updated Import Paths

| File | Old Path | New Path |
|------|----------|----------|
| App.jsx | `./components/auth/login/LoginPage` | `./components/features/auth/login/LoginPage` |
| App.jsx | `./components/home/HomePage` | `./components/features/subscriptions/HomePage` |
| HomePage.jsx | `./ConfirmDialog` | `../../common/ConfirmDialog` |
| HomePage.jsx | `../../contexts/authContext` | `../../../contexts/authContext` |
| NotificationBell.jsx | `../../firebase/firestore` | `../../../firebase/firestore` |

---

## Quick Reference

### Common Tasks

**Add a new page:**
```bash
# 1. Create in appropriate feature folder
touch src/components/features/[feature]/NewPage.jsx

# 2. Add route in App.jsx
# 3. Update navigation if needed
```

**Add a reusable component:**
```bash
# Put in common folder
touch src/components/common/NewComponent.jsx
```

**Add a utility function:**
```bash
# Create in lib folder
touch src/lib/newUtils.js
```

**Add Firebase function:**
```javascript
// Add to src/firebase/firestore.js
export const newFunction = async () => { /* ... */ };
```

**Add a constant:**
```bash
# Create in constants folder
touch src/constants/newConstants.js
```

---

## Summary

### Key Principles

1. **Feature-based organization** - Group by functionality, not file type
2. **Clear separation** - Features, common components, utilities all have dedicated folders
3. **Scalability** - Easy to add new features without affecting existing code
4. **Maintainability** - Related files are close together
5. **Reusability** - Common components and utilities are easily accessible

### Folder Hierarchy

```
docs/          → Documentation
functions/     → Cloud Functions
src/
  components/
    features/  → Feature-specific components
    common/    → Shared components
  contexts/    → Global state
  firebase/    → Firebase integration
  hooks/       → Custom hooks
  lib/         → Utilities
  constants/   → App constants
  services/    → External services
```

---

Happy coding! 🚀
