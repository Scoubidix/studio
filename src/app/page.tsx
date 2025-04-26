'use client'; // Add this directive

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics"; // Import Analytics type
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react'; // Import useState

const firebaseConfig = {
  apiKey: "AIzaSyA7Pesrain_yY_qodm727iJ1caN3VUSP78",
  authDomain: "mon-assistant-kine-e26e0.firebaseapp.com",
  projectId: "mon-assistant-kine-e26e0",
  storageBucket: "mon-assistant-kine-e26e0.firebasestorage.app",
  messagingSenderId: "673799271683",
  appId: "1:673799271683:web:476c2b8a422c8140562536",
  measurementId: "G-QYL4XG6DJB" // Optional: Only include if you use Analytics
};

let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase app:", error);
  // Handle the error appropriately, maybe show an error message to the user
  // For now, we'll proceed, but auth and other services might fail.
}

// Initialize auth immediately if app initialization succeeded
const auth = app ? getAuth(app) : null;


export default function Home() {
  // Initialize analytics state to null
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    // Initialize Analytics only on the client side
    if (app && typeof window !== 'undefined') {
        try {
            const analyticsInstance = getAnalytics(app);
            setAnalytics(analyticsInstance);
        } catch(error) {
            console.error("Error initializing Firebase Analytics:", error);
        }
    }

    if (!auth) {
        console.error("Firebase Auth not initialized. Redirecting to login.");
        redirect('/login'); // Or handle the error differently
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // TODO: Determine if user is kine or patient and redirect accordingly
        // Check custom claims or Firestore data to determine role
        console.log("User logged in, checking role...");
        // Example (replace with your actual role check logic):
        // Assume role is stored in Firestore 'users' collection doc(user.uid)
        // getDoc(doc(firestore, 'users', user.uid)).then(docSnap => {
        //   if (docSnap.exists()) {
        //     const role = docSnap.data().role;
        //     if (role === 'kine') {
               redirect('/kine/dashboard');
        //     } else if (role === 'patient') {
        //        redirect('/patient/dashboard');
        //     } else {
        //        console.error("Unknown user role:", role);
        //        redirect('/login'); // Redirect to login if role is unknown
        //     }
        //   } else {
        //      console.error("User document not found in Firestore.");
        //      redirect('/login'); // Redirect if user doc doesn't exist
        //   }
        // }).catch(error => {
        //    console.error("Error fetching user role:", error);
        //    redirect('/login');
        // });

      } else {
        redirect('/login');
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Render loading state or placeholder while checking auth
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div>
        Chargement...
      </div>
    </div>
  );
}
