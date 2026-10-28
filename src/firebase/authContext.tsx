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

const LOCAL_USER_CACHE_KEY = 'rupeesplit_persistent_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_USER_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
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
        try {
          localStorage.setItem(LOCAL_USER_CACHE_KEY, JSON.stringify(appUser));
        } catch {
          // ignore
        }
      } else {
        // If not in Firebase Auth, but user used demo login cache, preserve unless explicit sign out
        const cached = localStorage.getItem(LOCAL_USER_CACHE_KEY);
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
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
      localStorage.setItem(LOCAL_USER_CACHE_KEY, JSON.stringify(appUser));
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // Give clear, friendly message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please click "Continue with Google" again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow popups or use instant demo sign-in below.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network connection error. Please check your internet and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google. You can also sign in with instant demo profile.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = (name = 'Rahul Sharma', email = 'rahul.sharma@example.com') => {
    const appUser: AppUser = {
      uid: `user-${Date.now()}`,
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    setUser(appUser);
    try {
      localStorage.setItem(LOCAL_USER_CACHE_KEY, JSON.stringify(appUser));
    } catch {
      // ignore
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_USER_CACHE_KEY);
    } catch {
      // ignore
    }
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
