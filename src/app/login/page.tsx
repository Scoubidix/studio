'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import Link from 'next/link';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      // TODO: Redirect based on user role after successful login
      // Example: redirect('/kine/dashboard') or redirect('/patient/dashboard')
    } catch (error: any) {
      // Provide more user-friendly error messages
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setErrorMessage("L'adresse e-mail ou le mot de passe est incorrect.");
      } else if (error.code === 'auth/invalid-email') {
           setErrorMessage("L'adresse e-mail n'est pas valide.");
      } else {
           setErrorMessage("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
           console.error("Login error:", error); // Log detailed error for debugging
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Center content vertically */}
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold text-center text-foreground">Connexion</h1>
        {errorMessage && (
          <div className="p-3 text-center text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="votreadresse@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Se connecter
          </button>
        </form>
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href='/signup' className='font-medium text-primary hover:underline'>
              Inscrivez-vous
            </Link>
          </p>
          {/* Add password reset link if needed */}
          {/* <p className="mt-2">
             <Link href="/password-reset" className="text-xs text-muted-foreground hover:underline">
               Mot de passe oublié ?
             </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
