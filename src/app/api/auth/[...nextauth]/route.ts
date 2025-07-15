import { connectMongoDB } from "@/lib/db/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import NextAuth, { User as AuthUser, Session } from "next-auth";
import { type SessionStrategy, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

// Extended types for our custom user properties
interface ExtendedUser extends AuthUser {
  id: string;
  email: string;
  username: string;
  image?: string;
  role: string;
  verifiedEmail: boolean;
}

interface ExtendedToken extends JWT {
  id: string;
  email: string;
  username: string;
  image?: string;
  role: string;
  verifiedEmail: boolean;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    username: string;
    image?: string;
    role: string;
    verifiedEmail: boolean;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await connectMongoDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid password");
          }

          // Check if email is verified (optional - you can disable this check if needed)
          if (!user.verifiedEmail) {
            throw new Error("Please verify your email before logging in");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            image: user.image || undefined,
            role: user.role || "user", // default role
            verifiedEmail: user.verifiedEmail || false,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: ExtendedToken;
      user?: ExtendedUser;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session;
    }): Promise<ExtendedToken> {
      // When user signs in for the first time
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.image = user.image;
        token.role = user.role;
        token.verifiedEmail = user.verifiedEmail;
      }

      // When session is updated
      if (trigger === "update" && session?.user) {
        token.username = session.user.username ?? token.username;
        token.email = session.user.email ?? token.email;
        token.image = session.user.image ?? token.image;
        token.role = session.user.role ?? token.role;
        token.verifiedEmail = session.user.verifiedEmail ?? token.verifiedEmail;
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: ExtendedToken;
    }): Promise<ExtendedSession> {
      session.user = {
        id: token.id,
        email: token.email!,
        username: token.username,
        image: token.image,
        role: token.role,
        verifiedEmail: token.verifiedEmail,
      };

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", {
        user: user.email,
        account: account?.provider,
      });
    },
    async signOut({ session, token }) {
      console.log("User signed out:", { user: token?.email });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Export types for use in other files
export type { ExtendedUser, ExtendedToken, ExtendedSession };
