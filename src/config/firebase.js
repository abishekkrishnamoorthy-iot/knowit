// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5mM1x_jdCzoqQrUxBcKOVartj5hZu6DQ",
  authDomain: "knowit-124ab.firebaseapp.com",
  databaseURL: "https://knowit-124ab-default-rtdb.firebaseio.com",
  projectId: "knowit-124ab",
  storageBucket: "knowit-124ab.firebasestorage.app",
  messagingSenderId: "442086397313",
  appId: "1:442086397313:web:7a2055097a6aa5fce5c480",
  measurementId: "G-LPRQV0TZ3W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;

