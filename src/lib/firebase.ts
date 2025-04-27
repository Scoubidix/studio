import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration - Directly included as requested
// TODO: It's strongly recommended to use environment variables for security
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA7Pesrain_yY_qodm727iJ1caN3VUSP78", // Use env var or fallback
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mon-assistant-kine-e26e0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mon-assistant-kine-e26e0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mon-assistant-kine-e26e0.appspot.com", // Corrected bucket domain
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "673799271683",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:673799271683:web:476c2b8a422c8140562536",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-QYL4XG6DJB"
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null; // Initialize analytics as null

console.log("Firebase config used:", {
    apiKey: firebaseConfig.apiKey ? '***' : 'MISSING', // Don't log the actual key
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    // Add other config values if needed for debugging, but be careful with sensitive info
});

// Check if Firebase app is already initialized (prevents errors during hot-reloading)
if (!getApps().length) {
  console.log('Initializing new Firebase app...');
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized.');
    auth = getAuth(app);
    console.log('Firebase Auth initialized.');
    firestore = getFirestore(app);
    console.log('Firebase Firestore initialized.');
    storage = getStorage(app);
    console.log('Firebase Storage initialized.');
    functions = getFunctions(app);
    console.log('Firebase Functions initialized.');
    // Initialize Analytics only in the browser
    if (typeof window !== 'undefined') {
      console.log('Attempting to initialize Firebase Analytics...');
      try {
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized.');
      } catch (analyticsError) {
           console.error('Error initializing Firebase Analytics:', analyticsError);
      }
    } else {
        console.log('Skipping Analytics initialization (not in browser).');
    }
  } catch (error) {
    console.error('CRITICAL: Error initializing Firebase app:', error);
    // Provide fallback empty objects or handle error appropriately
    // Depending on the app's needs, you might want to redirect or show an error message
    app = {} as FirebaseApp; // Fallback empty app object
    auth = {} as Auth;
    firestore = {} as Firestore;
    storage = {} as FirebaseStorage;
    functions = {} as Functions;
  }
} else {
  console.log('Getting existing Firebase app...');
  // Get the default app if already initialized
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  // Initialize Analytics only in the browser
  if (typeof window !== 'undefined') {
     console.log('Attempting to get Analytics instance for existing app...');
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics instance obtained.');
    } catch(e) {
      console.error("Error getting analytics instance for existing app:", e);
    }
  } else {
      console.log('Skipping Analytics initialization (not in browser).');
  }
}

export { app, auth, firestore, storage, functions, analytics };
