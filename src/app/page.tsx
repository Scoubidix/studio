'use client'; // Keep this directive

import { onAuthStateChanged, User } from 'firebase/auth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { auth, firestore } from '@/lib/firebase'; // Import auth and firestore
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  useEffect(() => {
    console.log('Home page useEffect running. Setting up auth listener.');
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('onAuthStateChanged triggered. User:', user ? user.uid : 'null');

      if (user) {
        console.log('User is logged in, checking role for UID:', user.uid);

        // Ensure firestore is initialized before using it
        if (!firestore || Object.keys(firestore).length === 0) {
            console.error("Firestore not initialized. Cannot check role. Redirecting to login.");
            redirect('/login');
            return;
        }

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            console.log('Attempting to fetch user document from Firestore:', `users/${user.uid}`);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
              const userData = docSnap.data();
              const role = userData.role;
              console.log('User document found. Role:', role, 'Data:', userData);

              if (role === 'kine') {
                console.log('Redirecting kine to /kine/dashboard');
                redirect('/kine/dashboard');
              } else if (role === 'patient') {
                console.log('Redirecting patient to /patient/dashboard');
                redirect('/patient/dashboard');
              } else {
                console.error('Unknown user role:', role, '. Redirecting to login.');
                redirect('/login');
              }
            } else {
              console.error('User document not found in Firestore for UID:', user.uid, '. Redirecting to login.');
              // If user is authenticated but no role document, redirect to login or a profile setup page
              redirect('/login');
            }
        } catch (error) {
            console.error('Error fetching user role from Firestore:', error);
            console.log('Redirecting to /login due to Firestore error.');
            redirect('/login');
        }

      } else {
        console.log('No user logged in, redirecting to /login.');
        redirect('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up auth listener.');
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Render loading state or placeholder while checking auth
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div>
        Chargement de l'application... Vérification de l'authentification...
      </div>
    </div>
  );
}
