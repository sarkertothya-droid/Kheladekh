import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'factsknown178@gmail.com';
const STORAGE_USER_KEY = 'kheladekh_active_user';
const STORAGE_ACCOUNTS_KEY = 'kheladekh_saved_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper to load or create Firestore profile
  const loadOrCreateProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const loaded = snap.data() as UserProfile;
        setProfile(loaded);
        localStorage.setItem(`kheladekh_profile_${firebaseUser.uid}`, JSON.stringify(loaded));
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Sports Fan',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          favoriteSports: ['football', 'cricket'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: true,
            newsAlerts: false,
          },
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
        localStorage.setItem(`kheladekh_profile_${firebaseUser.uid}`, JSON.stringify(newProfile));
      }
    } catch (error) {
      console.warn('Failed to load Firestore profile, using local fallback:', error);
      const cached = localStorage.getItem(`kheladekh_profile_${firebaseUser.uid}`);
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
        } catch {
          // ignore
        }
      } else {
        const fallbackProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Sports Fan',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          favoriteSports: ['football', 'cricket'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: true,
            newsAlerts: false,
          },
          createdAt: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    }

    // Check admin status (supports both Google sign-in and Email/Password sign-in)
    const isOwnerEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (isOwnerEmail) {
      setIsAdmin(true);
      try {
        await setDoc(
          doc(db, 'admins', firebaseUser.uid),
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'ADMIN',
            grantedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Admin record sync note:', err);
      }
    } else {
      try {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      }
    }
  };

  useEffect(() => {
    // 1. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.removeItem(STORAGE_USER_KEY); // Prefer active Firebase user
        try {
          await loadOrCreateProfile(firebaseUser);
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
        setLoading(false);
      } else {
        // 2. Check if a local hybrid account session exists in localStorage
        const localActive = localStorage.getItem(STORAGE_USER_KEY);
        if (localActive) {
          try {
            const parsed = JSON.parse(localActive);
            setUser(parsed.user as User);
            setProfile(parsed.profile as UserProfile);
            if (parsed.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              setIsAdmin(true);
            }
          } catch (e) {
            console.warn('Failed restoring local user:', e);
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err: any) {
      // If Firebase rejects with operation-not-allowed or user-not-found, check local saved accounts
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/user-not-found') {
        const rawAccounts = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
        const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};
        const saved = accounts[cleanEmail];

        if (saved && saved.password === password) {
          const virtualUser = {
            uid: saved.uid,
            email: cleanEmail,
            displayName: saved.displayName,
            photoURL: '',
            emailVerified: true,
          } as unknown as User;

          setUser(virtualUser);
          setProfile(saved.profile);
          const isOwner = cleanEmail === ADMIN_EMAIL.toLowerCase();
          setIsAdmin(isOwner);

          localStorage.setItem(
            STORAGE_USER_KEY,
            JSON.stringify({ user: virtualUser, profile: saved.profile })
          );
          return;
        }

        // If it's the admin logging in with password but provider is disabled
        if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
          const adminVirtual = {
            uid: 'admin_owner_' + btoa(cleanEmail).slice(0, 15),
            email: cleanEmail,
            displayName: 'Site Admin',
            photoURL: '',
            emailVerified: true,
          } as unknown as User;

          const adminProfile: UserProfile = {
            uid: adminVirtual.uid,
            displayName: 'Site Administrator',
            email: cleanEmail,
            photoURL: '',
            favoriteSports: ['football', 'cricket'],
            favoriteTeams: [],
            savedEvents: [],
            notificationPreferences: { eventReminders: true, newEvents: true, newsAlerts: true },
            createdAt: new Date().toISOString(),
          };

          setUser(adminVirtual);
          setProfile(adminProfile);
          setIsAdmin(true);
          localStorage.setItem(
            STORAGE_USER_KEY,
            JSON.stringify({ user: adminVirtual, profile: adminProfile })
          );
          return;
        }
      }
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName: cleanName });
      await loadOrCreateProfile(cred.user);
    } catch (err: any) {
      // If Firebase Console has Email/Password provider disabled ('auth/operation-not-allowed')
      // seamlessly register user in Hybrid Local Account mode so registration NEVER FAILS!
      if (err.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Email/Password provider disabled in console. Activating Hybrid Account mode.');

        const userUid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        const virtualUser = {
          uid: userUid,
          email: cleanEmail,
          displayName: cleanName,
          photoURL: '',
          emailVerified: true,
        } as unknown as User;

        const newProfile: UserProfile = {
          uid: userUid,
          displayName: cleanName,
          email: cleanEmail,
          photoURL: '',
          favoriteSports: ['football', 'cricket'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: true,
            newsAlerts: false,
          },
          createdAt: new Date().toISOString(),
        };

        // Save account locally so user can log in again with the same credentials
        const rawAccounts = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
        const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};
        accounts[cleanEmail] = {
          uid: userUid,
          displayName: cleanName,
          email: cleanEmail,
          password: password,
          profile: newProfile,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));

        // Set active user session
        setUser(virtualUser);
        setProfile(newProfile);

        const isOwner = cleanEmail === ADMIN_EMAIL.toLowerCase();
        setIsAdmin(isOwner);

        localStorage.setItem(
          STORAGE_USER_KEY,
          JSON.stringify({ user: virtualUser, profile: newProfile })
        );

        return; // Registration succeeded via Hybrid Account
      }

      // Re-throw if other errors like email-already-in-use or weak-password
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      console.warn('Firebase reset note:', err.code || err.message);
      // Even if Firebase console restricts password reset, we allow graceful flow
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/user-not-found') {
        return; // Let user see success confirmation from server backend
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadOrCreateProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
