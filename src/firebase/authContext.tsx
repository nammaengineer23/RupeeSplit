import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from './config';

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
  loginAsDemoUser: (name?: string, email?: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set persistent auth state in browser local storage
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Could not set browserLocalPersistence:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveler',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          phoneNumber: firebaseUser.phoneNumber || undefined,
        };
        setUser(appUser);
      } else {
        // A cached profile or demo identity is never proof of Firebase authentication.
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const cred = await signInWithPopup(auth, provider);
      const appUser: AppUser = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Traveler',
        email: cred.user.email || '',
        photoURL: cred.user.photoURL || undefined,
        phoneNumber: cred.user.phoneNumber || undefined,
      };
      setUser(appUser);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // Give clear, friendly message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please click "Continue with Google" again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow popups and try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network connection error. Please check your internet and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kept for older UI callers, but never creates a local-only identity.
  const loginAsDemoUser = () => {
    setError('Demo sign-in is disabled. Continue with Google to authenticate securely.');
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signOutUser,
        loginAsDemoUser,
        clearError,
      }}
    >
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
