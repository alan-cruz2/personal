//@ts-nocheck
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Cruzable</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
