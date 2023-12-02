import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import '@/styles/globals.css';
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const queryClient = new QueryClient();

  return (
    <ClerkProvider {...pageProps}>
      {/* <SignedIn> */}
        <div className={inter.className}>
          <Toaster />
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </div>
      {/* </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut> */}
    </ClerkProvider>
  //   <ClerkProvider {...pageProps}>
  //   <SignedIn>
  //     <div className={inter.className}>
  //       <Toaster />
  //       <QueryClientProvider client={queryClient}>
  //         <Component {...pageProps} />
  //       </QueryClientProvider>
  //     </div>
  //   </SignedIn>
  //   <SignedOut>
  //     <RedirectToSignIn />
  //   </SignedOut>
  // </ClerkProvider>
);
}

export default appWithTranslation(App);
