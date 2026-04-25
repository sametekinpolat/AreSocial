import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [], // Configured in auth.ts due to Prisma adapter constraints
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
      const isOnboardingRoute = nextUrl.pathname.startsWith('/onboarding') || nextUrl.pathname.startsWith('/verify');

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // If logged in but no username (meaning they haven't finished onboarding)
      // Force them to onboarding.
      if (isLoggedIn && !auth.user.username && !isOnboardingRoute) {
         return Response.redirect(new URL('/onboarding', nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      
      // Update token on runtime modifications (if we call update() on session)
      if (trigger === "update" && session?.username) {
        token.username = session.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
      }
      return session;
    }
  },
} satisfies NextAuthConfig;
