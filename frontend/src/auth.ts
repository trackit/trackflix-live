
import NextAuth from 'next-auth';
import type { Provider } from "next-auth/providers"
import Cognito from "@auth/core/providers/cognito";
import { NextResponse } from 'next/server';
import config from '@/utils/config';

const providers: Provider[] = [
  Cognito({
    clientId: config.Providers.Cognito.UserPool.AppClient.Id,
    clientSecret: config.Providers.Cognito.UserPool.AppClient.Secret,
    issuer: config.Providers.Cognito.Issuer,
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
