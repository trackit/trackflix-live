import { AppProps } from "next/app";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <Component {...pageProps} signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}
