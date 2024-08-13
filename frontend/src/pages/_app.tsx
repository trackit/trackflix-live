import { AppProps } from "next/app";
import Authenticator from "@/components/Authenticator";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Component {...pageProps} signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}
