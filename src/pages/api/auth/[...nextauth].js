import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({account, profile}) {
      if (account.provider === 'google') {
        return profile.email_verified && profile.email.endsWith("@alan-cruz.com")
      }

      return false;
    }
  }
}
export default NextAuth(authOptions);