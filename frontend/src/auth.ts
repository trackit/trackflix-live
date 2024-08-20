
import NextAuth from 'next-auth';
import type { Provider } from "next-auth/providers"
import Cognito from "@auth/core/providers/cognito";
import { NextResponse } from 'next/server';

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
      const isOnLogin = request.nextUrl.pathname === '/login';

      if (isLoggedIn) {
        if (isOnLogin) return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
        return NextResponse.next();
      }

      return false;
    }
  },
    providers: providers
});

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider()
    return { id: providerData.id, name: providerData.name }
  } else {
    return { id: provider.id, name: provider.name }
  }
})
