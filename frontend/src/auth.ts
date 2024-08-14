
import NextAuth from 'next-auth';
import type { Provider } from "next-auth/providers"
import Cognito from "@auth/core/providers/cognito";

const providers: Provider[] = [
  Cognito({
    clientId: process.env.NEXT_PUBLIC_USER_POOL_APP_ID!,
    clientSecret: process.env.NEXT_PUBLIC_COGNITO_SECRET!,
    issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_USER_POOL_ID}`,
  }),
]

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({auth, request}) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }
      return true;
    },
  },
    providers: providers
});
