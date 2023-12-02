import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import logo from '@/public/logo.png';
import { SignOutButton, useAuth, useSignIn } from '@clerk/nextjs';

export default function SignIn() {
  const { userId, sessionId, getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter(); // Initialize the useRouter hook

  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    await signIn
      ?.create({
        identifier: email,
        password,
      })
      .then((result) => {
        if (result.status === 'complete') {
          console.log(result);
          setActive({ session: result.createdSessionId });

          console.log('LOGGED IN',sessionId);
        //   router.push('/');
        } else {
          console.log(result);
        }
      })
      .catch((err) => console.error('error', err));
  }

  return (
    <div className="flex flex-row min-h-screen min-w-screen">
      <div className="w-1/2 flex justify-center items-center bg-[#410099]/70 ">
        <Image src={logo} alt="Decorative" />
      </div>
      <div className="w-1/2 flex justify-center items-center bg-[#16171c]">
        <div className="p-8 bg-[#2C2D32]/70 rounded-md shadow-md max-w-xs mx-auto">
          {!sessionId && (
            <form onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email
                </label>
                <input
                  className="bg-gray-200 border border-gray-500 text-sm rounded-md px-3 py-2 w-9/10 mb-4"
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white"
                >
                  Password
                </label>
                <input
                  className="bg-gray-200 border border-gray-500 text-sm rounded-md px-3 py-2 w-9/10 mb-4"
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="text-white bg-[#410099] px-4 py-2 text-center border-none rounded-md w-full transition duration-200 hover:bg-blue-500">
                Sign in
              </button>
            </form>
          )}
          {sessionId && (
            <div className="text-white gap-4">
              You are already logged in. <br />
              Go to{' '}
              <a href="/" className="text-white underline">
                {' '}
                Dashboard
              </a>
              <br />
              <SignOutButton>
                <button className="text-white bg-[#410099] px-4 py-2 text-center border-none rounded-md w-full transition duration-200 hover:bg-blue-500">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
