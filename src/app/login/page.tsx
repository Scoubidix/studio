tsx
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
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin} className='flex flex-col gap-4'>
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>

        <div>
            <p>Don't have an account yet ? <Link href='/signup' className='text-blue-500'>Sign up</Link></p>
        </div>
    </div>
  );
};

export default LoginPage;