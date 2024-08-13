import { Authenticator as AmplifyAuthenticator, Image, useTheme, View, AuthenticatorProps } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
    },
  },
});

const components = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="Trackit logo"
          src="./trackit-logo.png"
        />
      </View>
    );
  },
};


export default function Authenticator({ children }: AuthenticatorProps) {
  return (
    <AmplifyAuthenticator components={{ Header: components.Header }} hideSignUp={true}>
      {children}
    </AmplifyAuthenticator>
  );
}