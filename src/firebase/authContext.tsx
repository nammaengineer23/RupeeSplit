import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { auth, firebaseConfig } from './config';

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(firebaseUser: NonNullable<typeof auth.currentUser>): AppUser {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveler',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || undefined,
    phoneNumber: firebaseUser.phoneNumber || undefined,
  };
}

function getSignInErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/popup-closed-by-user' || code === 'USER_CANCELLED' || code === 'CANCELED') {
    return 'Sign-in was cancelled. Tap Continue with Google to try again.';
  }
  if (code === 'auth/popup-blocked') {
    return 'The browser blocked the sign-in window. Allow pop-ups for this site and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Check your internet connection and try again.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is disabled in Firebase Authentication. Enable the Google provider in the Firebase Console.';
  }
  if (/28444|developer console is not set up correctly|DEVELOPER_ERROR/i.test(message)) {
    return 'Google sign-in configuration does not match this Android build. Check the Web OAuth client ID, Android package name, and SHA-1 certificate in Google Cloud Console.';
  }
  if (/no credentials available|no credential/i.test(message)) {
    return 'No Google account credential was available. Add a Google account to this device, update Google Play services, and try again.';
  }
  if (/invalid-credential|credential.*malformed/i.test(message) || code === 'auth/invalid-credential') {
    return 'Google returned a credential Firebase could not accept. Verify that the Web OAuth client ID belongs to the same Google Cloud project as Firebase.';
  }
  return message || 'Could not sign in with Google. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Could not set browserLocalPersistence:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;
      setUser(firebaseUser ? toAppUser(firebaseUser) : null);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      if (Capacitor.isNativePlatform()) {
        const webClientId = firebaseConfig.oAuthClientId;
        if (!webClientId || !webClientId.endsWith('.apps.googleusercontent.com')) {
          throw new Error('Missing or invalid Web OAuth client ID in firebase-applet-config.json.');
        }

        // Native Android WebViews cannot reliably complete Firebase's popup flow.
        // Use Android Credential Manager to obtain a Google ID token, then exchange
        // it with Firebase Auth so Firestore continues to use a verified Firebase UID.
        await SocialLogin.initialize({
          google: {
            webClientId,
            mode: 'online',
          },
        });
        const result = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['email', 'profile'],
            filterByAuthorizedAccounts: false,
          },
        });
        const idToken =
          result?.provider === 'google' && 'idToken' in result.result
            ? result.result.idToken
            : null;
        if (!idToken) {
          throw new Error('Google sign-in completed without an ID token. Verify the Web OAuth client configuration.');
        }
        const credential = GoogleAuthProvider.credential(idToken);
        const firebaseCredential = await signInWithCredential(auth, credential);
        setUser(toAppUser(firebaseCredential.user));
      } else {
        // Keep the normal Firebase popup flow for desktop/mobile browsers.
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const credential = await signInWithPopup(auth, provider);
        setUser(toAppUser(credential.user));
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(getSignInErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await SocialLogin.logout({ provider: 'google', clearCachedUserInfo: true });
        } catch (err) {
          // Firebase sign-out must still complete if Google credential cache clearing fails.
          console.warn('Native Google sign-out cleanup failed:', err);
        }
      }
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign-out failed:', err);
      throw err;
    } finally {
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOutUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
