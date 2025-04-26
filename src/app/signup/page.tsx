'use client';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import Link from 'next/link';

// TODO: Add Firestore integration to save user role (kine/patient)

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Add confirm password state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // State for success message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);

      // --- TODO: Add logic to determine user role and save to Firestore ---
      // Example: Add a radio button or select dropdown for role
      // const role = selectedRole; // Get role from form
      // await setDoc(doc(firestore, 'users', user.uid), {
      //   email: user.email,
      //   role: role, // 'kine' or 'patient'
      //   createdAt: serverTimestamp()
      // });
      // --- End TODO ---

      setSuccess(true); // Show success message
      // Optionally redirect after a delay or clear form
      // setTimeout(() => redirect('/login'), 2000);

    } catch (error: any) {
       // Provide more user-friendly error messages
       if (error.code === 'auth/email-already-in-use') {
           setError("Cette adresse e-mail est déjà utilisée.");
       } else if (error.code === 'auth/invalid-email') {
            setError("L'adresse e-mail n'est pas valide.");
       } else if (error.code === 'auth/weak-password') {
           setError("Le mot de passe est trop faible.");
       } else {
           setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
           console.error("Signup error:", error); // Log detailed error for debugging
       }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Center content vertically */}
       <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
         <h1 className="text-2xl font-bold text-center text-foreground">Inscription</h1>
         {error && (
            <div className="p-3 text-center text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
              {error}
            </div>
         )}
         {success && (
            <div className="p-3 text-center text-sm text-green-700 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
              Inscription réussie ! Vous pouvez maintenant vous{' '}
              <Link href="/login" className="font-semibold text-green-800 dark:text-green-200 hover:underline">connecter</Link>.
            </div>
         )}
        <form onSubmit={handleSubmit} className="space-y-4">
           {/* TODO: Add field to select role (Kiné / Patient) */}
           {/* <div>
               <label className="block text-sm font-medium text-muted-foreground mb-1">Je suis un :</label>
               <select className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                   <option value="patient">Patient</option>
                   <option value="kine">Kinésithérapeute</option>
               </select>
           </div> */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votreadresse@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">Mot de passe</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 caractères"
            />
          </div>
           <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Retapez votre mot de passe"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out"
            disabled={success} // Disable button after success
          >
            S'inscrire
          </button>
        </form>
         <div className="text-center text-sm">
           <p className="text-muted-foreground">Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Connectez-vous
            </Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
