'use client'; // Keep this directive

import { onAuthStateChanged } from 'firebase/auth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { auth, firestore } from '@/lib/firebase'; // Import auth and firestore
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User logged in, checking role...');

        // Ensure firestore is initialized before using it
        if (!firestore || Object.keys(firestore).length === 0) {
            console.error("Firestore not initialized. Redirecting to login.");
            redirect('/login');
            return;
        }

        getDoc(doc(firestore, 'users', user.uid))
          .then((docSnap) => {
            if (docSnap.exists()) {
              const role = docSnap.data().role;
              if (role === 'kine') {
                redirect('/kine/dashboard');
              } else if (role === 'patient') {
                redirect('/patient/dashboard');
              } else {
                console.error('Unknown user role:', role);
                // Decide where to redirect unknown roles, maybe login?
                redirect('/login');
              }
            } else {
              console.error('User document not found in Firestore for UID:', user.uid);
              // If user is authenticated but no role document, redirect to login or a profile setup page
              redirect('/login');
            }
          }).catch(error => {
            console.error('Error fetching user role:', error);
            redirect('/login');
          });

      } else {
        console.log('No user logged in, redirecting to login.');
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
