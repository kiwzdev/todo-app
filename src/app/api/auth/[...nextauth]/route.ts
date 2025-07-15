import { connectMongoDB } from "@/lib/db/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import NextAuth, { User as AuthUser, Session } from "next-auth";
import { type SessionStrategy, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) throw new Error("Missing credentials");

        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Missing email or password");
        }

        await connectMongoDB();
        const user = await User.findOne({ email });

        if (!user) throw new Error("User not found");

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: AuthUser;
    }) {
      // เมื่อ user login ครั้งแรก
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.image = user.image;
      }
      // เมื่อมีการ update session
      if (trigger === "update" && session) {
        // อัพเดทข้อมูลใน token จากข้อมูลที่ส่งมาใน session
        if (session.user) {
          token.username = session.user.username ?? token.username;
          token.email = session.user.email ?? token.email;
          token.image = session.user.image ?? token.image;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id as string,
        email: token.email,
        username: token.username,
        image: token.image,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
