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
  apiKey: "AIzaSyA7Pesrain_yY_qodm727iJ1caN3VUSP78",
  authDomain: "mon-assistant-kine-e26e0.firebaseapp.com",
  projectId: "mon-assistant-kine-e26e0",
  storageBucket: "mon-assistant-kine-e26e0.appspot.com", // Corrected bucket domain
  messagingSenderId: "673799271683",
  appId: "1:673799271683:web:476c2b8a422c8140562536",
  measurementId: "G-QYL4XG6DJB"
};


let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null; // Initialize analytics as null

// Check if Firebase app is already initialized (prevents errors during hot-reloading)
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    // Initialize Analytics only in the browser
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error('Error initializing Firebase app:', error);
    // Provide fallback empty objects or handle error appropriately
    // Depending on the app's needs, you might want to redirect or show an error message
    app = {} as FirebaseApp; // Fallback empty app object
    auth = {} as Auth;
    firestore = {} as Firestore;
    storage = {} as FirebaseStorage;
    functions = {} as Functions;
  }
} else {
  // Get the default app if already initialized
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  // Initialize Analytics only in the browser
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch(e) {
      console.error("Error getting analytics instance:", e);
    }
  }
}

export { app, auth, firestore, storage, functions, analytics };
