import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, googleProvider, database } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user profile from Realtime Database
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName || 'User',
              role: userData.role || 'user',
              photoURL: firebaseUser.photoURL || userData.photoURL || null,
              createdAt: userData.createdAt || new Date().toISOString()
            });
          } else {
            // Create user profile if it doesn't exist
            const role = firebaseUser.email?.includes('admin') ? 'admin' : 'user';
            const userProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: role,
              photoURL: firebaseUser.photoURL || null,
              createdAt: new Date().toISOString()
            };
            
            try {
              await set(userRef, userProfile);
              setUser(userProfile);
            } catch (error) {
              console.error('Error creating user profile:', error);
              // Set user anyway with basic info
              setUser(userProfile);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const createUserProfile = async (firebaseUser, name) => {
    const role = firebaseUser.email?.includes('admin') ? 'admin' : 'user';
    const userProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name || firebaseUser.displayName || 'User',
      role: role,
      photoURL: firebaseUser.photoURL || null,
      createdAt: new Date().toISOString()
    };

    const userRef = ref(database, `users/${firebaseUser.uid}`);
    await set(userRef, userProfile);
    return userProfile;
  };

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Create user profile in Realtime Database
      const userProfile = await createUserProfile(firebaseUser, name);
      setUser(userProfile);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user profile exists, if not create it
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        await createUserProfile(firebaseUser, firebaseUser.displayName);
      }
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

