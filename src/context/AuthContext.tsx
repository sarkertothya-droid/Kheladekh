import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  linkWithPhoneNumber,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string, mode?: 'signin' | 'link') => Promise<void>;
  confirmPhoneOtp: (otpCode: string) => Promise<void>;
  resetPhoneOtpState: () => void;
  resendEmailVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetOobCode: (oobCode: string) => Promise<string>;
  confirmNewPasswordWithCode: (oobCode: string, newPassword: string) => Promise<void>;
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

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const phoneConfirmationRef = useRef<ConfirmationResult | null>(null);

  const getActionCodeSettings = () => ({
    url: `${window.location.origin}/reset`,
    handleCodeInApp: false,
  });

  // Helper to load or create Firestore profile
  const loadOrCreateProfile = async (firebaseUser: User) => {
    const fallbackName =
      firebaseUser.displayName ||
      firebaseUser.email?.split('@')[0] ||
      firebaseUser.phoneNumber ||
      (firebaseUser.isAnonymous ? 'Guest Viewer' : 'KhelaDekH Member');

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const loaded = snap.data() as UserProfile;
        // Sync verified phone number if newly linked
        if (firebaseUser.phoneNumber && (!loaded.phoneVerified || loaded.phoneNumber !== firebaseUser.phoneNumber)) {
          const synced: UserProfile = {
            ...loaded,
            phoneNumber: firebaseUser.phoneNumber,
            phoneVerified: true,
          };
          await setDoc(userRef, synced, { merge: true });
          setProfile(synced);
          localStorage.setItem(`kheladekh_profile_${firebaseUser.uid}`, JSON.stringify(synced));
        } else {
          setProfile(loaded);
          localStorage.setItem(`kheladekh_profile_${firebaseUser.uid}`, JSON.stringify(loaded));
        }
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: fallbackName,
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          phoneVerified: Boolean(firebaseUser.phoneNumber),
          photoURL: firebaseUser.photoURL || '',
          favoriteSports: ['football', 'cricket'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: true,
            newsAlerts: false,
          },
          vpnMode: false,
          vpnRegion: 'auto',
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
          displayName: fallbackName,
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          phoneVerified: Boolean(firebaseUser.phoneNumber),
          photoURL: firebaseUser.photoURL || '',
          favoriteSports: ['football', 'cricket'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: true,
            newsAlerts: false,
          },
          vpnMode: false,
          vpnRegion: 'auto',
          createdAt: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    }

    // Check admin status
    const isOwnerEmail = Boolean(
      firebaseUser.email && firebaseUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.removeItem(STORAGE_USER_KEY);
        try {
          await loadOrCreateProfile(firebaseUser);
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
        setLoading(false);
      } else {
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
          setIsAdmin(cleanEmail === ADMIN_EMAIL.toLowerCase());
          localStorage.setItem(
            STORAGE_USER_KEY,
            JSON.stringify({ user: virtualUser, profile: saved.profile })
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
      try {
        await sendEmailVerification(cred.user, getActionCodeSettings());
      } catch {
        // fallback if continue URL not yet allowlisted
        sendEmailVerification(cred.user).catch(() => {});
      }
      await loadOrCreateProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
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
          phoneNumber: '',
          phoneVerified: false,
          photoURL: '',
          favoriteSports: ['football', 'cricket'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: true,
            newsAlerts: false,
          },
          vpnMode: false,
          vpnRegion: 'auto',
          createdAt: new Date().toISOString(),
        };

        const rawAccounts = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
        const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};
        accounts[cleanEmail] = {
          uid: userUid,
          displayName: cleanName,
          email: cleanEmail,
          password,
          profile: newProfile,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));

        setUser(virtualUser);
        setProfile(newProfile);
        setIsAdmin(cleanEmail === ADMIN_EMAIL.toLowerCase());
        localStorage.setItem(
          STORAGE_USER_KEY,
          JSON.stringify({ user: virtualUser, profile: newProfile })
        );
        return;
      }
      throw err;
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
        const guestUid = 'guest_' + Date.now().toString(36);
        const virtualUser = {
          uid: guestUid,
          email: '',
          displayName: 'Guest Viewer',
          isAnonymous: true,
        } as unknown as User;
        const guestProfile: UserProfile = {
          uid: guestUid,
          displayName: 'Guest Viewer',
          email: '',
          favoriteSports: ['cricket', 'football'],
          favoriteTeams: [],
          savedEvents: [],
          notificationPreferences: {
            eventReminders: true,
            newEvents: false,
            newsAlerts: false,
          },
          vpnMode: false,
          vpnRegion: 'auto',
          createdAt: new Date().toISOString(),
        };
        setUser(virtualUser);
        setProfile(guestProfile);
        setIsAdmin(false);
        localStorage.setItem(
          STORAGE_USER_KEY,
          JSON.stringify({ user: virtualUser, profile: guestProfile })
        );
        return;
      }
      throw err;
    }
  };

  const resetPhoneOtpState = () => {
    phoneConfirmationRef.current = null;
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaRef.current = null;
    }
  };

  const sendPhoneOtp = async (
    phoneNumber: string,
    recaptchaContainerId: string,
    mode: 'signin' | 'link' = 'signin'
  ) => {
    const normalizedPhone = phoneNumber.replace(/[\s()-]/g, '').trim();
    if (!/^\+\d{7,15}$/.test(normalizedPhone)) {
      throw new Error('সঠিক আন্তর্জাতিক ফরম্যাটে নম্বর দিন (যেমন: +8801XXXXXXXXX)');
    }

    resetPhoneOtpState();

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
    recaptchaRef.current = verifier;

    if (mode === 'link' && auth.currentUser) {
      const confirmation = await linkWithPhoneNumber(auth.currentUser, normalizedPhone, verifier);
      phoneConfirmationRef.current = confirmation;
    } else {
      const confirmation = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
      phoneConfirmationRef.current = confirmation;
    }
  };

  const confirmPhoneOtp = async (otpCode: string) => {
    if (!phoneConfirmationRef.current) {
      throw new Error('প্রথমে আপনার ফোন নম্বরে ভেরিফিকেশন কোড পাঠান।');
    }
    const cleanOtp = otpCode.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      throw new Error('৬ ডিজিটের সঠিক SMS OTP কোড দিন।');
    }
    const cred = await phoneConfirmationRef.current.confirm(cleanOtp);
    resetPhoneOtpState();
    await loadOrCreateProfile(cred.user);
  };

  const resendEmailVerification = async () => {
    if (!auth.currentUser) {
      throw new Error('দয়া করে প্রথমে সাইন ইন করুন।');
    }
    try {
      await sendEmailVerification(auth.currentUser, getActionCodeSettings());
    } catch {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, cleanEmail, getActionCodeSettings());
    } catch (err: any) {
      if (
        err?.code === 'auth/unauthorized-continue-uri' ||
        err?.code === 'auth/invalid-continue-uri'
      ) {
        try {
          await sendPasswordResetEmail(auth, cleanEmail);
          return;
        } catch (fallbackErr: any) {
          if (
            fallbackErr?.code === 'auth/operation-not-allowed' ||
            fallbackErr?.code === 'auth/user-not-found'
          ) {
            return;
          }
          throw fallbackErr;
        }
      }
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/user-not-found') {
        return;
      }
      throw err;
    }
  };

  const verifyResetOobCode = async (oobCode: string) => {
    return verifyPasswordResetCode(auth, oobCode);
  };

  const confirmNewPasswordWithCode = async (oobCode: string, newPassword: string) => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_USER_KEY);
    resetPhoneOtpState();
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
    if (auth.currentUser) {
      await loadOrCreateProfile(auth.currentUser);
    } else if (user) {
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
        signInAsGuest,
        sendPhoneOtp,
        confirmPhoneOtp,
        resetPhoneOtpState,
        resendEmailVerification,
        resetPassword,
        verifyResetOobCode,
        confirmNewPasswordWithCode,
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
