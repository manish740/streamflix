import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  fetchSignInMethodsForEmail,
  UserCredential,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { User, UserProfile } from '../types';
import { MOCK_PROFILES } from '../data/mockData';

// Firebase client config - uses env variables if provided, or default project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_STREAMFLIX_DEMO_KEY_2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'streamflix-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'streamflix-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'streamflix-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '689939590985',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:689939590985:web:streamflix2026'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (err) {
  console.warn('[StreamFlix Firebase] Initializing in fallback mode:', err);
}

export { auth };

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Helper to convert Firebase/Social user to standard StreamFlix User format
export const buildStreamFlixUser = (
  userId: string,
  email: string,
  name: string,
  photoURL?: string,
  provider: 'google' | 'facebook' | 'password' = 'password',
  existingProfiles?: UserProfile[]
): User => {
  const defaultAvatar = photoURL || (provider === 'google'
    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
    : provider === 'facebook'
    ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80'
    : MOCK_PROFILES[0].avatar);

  const mainProfileId = `p-${userId}-1`;
  const kidsProfileId = `p-${userId}-2`;

  const profiles: UserProfile[] = existingProfiles && existingProfiles.length > 0
    ? existingProfiles
    : [
        {
          id: mainProfileId,
          name: name.trim() || 'Alex',
          avatar: defaultAvatar,
          isKids: false,
          preferredLang: 'en'
        },
        {
          id: kidsProfileId,
          name: 'Kids Club',
          avatar: MOCK_PROFILES[1].avatar,
          isKids: true,
          preferredLang: 'en'
        }
      ];

  const now = new Date().toISOString();

  return {
    id: userId,
    userId: userId,
    email: email.trim(),
    name: name.trim() || 'StreamFlix Member',
    avatar: defaultAvatar,
    photoURL: photoURL || defaultAvatar,
    provider: provider,
    role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    profiles: profiles,
    activeProfileId: profiles[0]?.id || mainProfileId,
    createdAt: now,
    updatedAt: now
  };
};

// Error mapper to return clean, user-friendly messages without exposing raw errors
export const mapAuthErrorMessage = (error: any, defaultMessage: string): string => {
  if (!error) return defaultMessage;

  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return 'Google sign-in was cancelled.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Sign-in cancelled.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
  }
  if (
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials'
  ) {
    return 'Email or password is incorrect.';
  }
  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with this email using a different sign-in method. Please sign in using your existing provider.';
  }
  if (code === 'auth/weak-password') {
    return 'Password must be at least 8 characters long.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }

  return defaultMessage;
};

// Check and retrieve existing registered accounts in local storage
export const getStoredRegisteredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem('streamflix_registered_accounts');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredRegisteredUser = (user: User) => {
  try {
    const users = getStoredRegisteredUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
    if (index >= 0) {
      users[index] = {
        ...users[index],
        ...user,
        updatedAt: new Date().toISOString()
      };
    } else {
      users.push(user);
    }
    localStorage.setItem('streamflix_registered_accounts', JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user account', err);
  }
};
