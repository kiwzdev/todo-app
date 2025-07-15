// /app/api/auth/send-verification-email/route.ts (app router)
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";
import { VerificationToken } from "@/models/verificationToken";
import { connectMongoDB } from "@/lib/db/mongodb";
import { getServerSession } from "next-auth";
import User from "@/models/user";
import { authOptions } from "../[...nextauth]/route";

async function getUserBySession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await connectMongoDB();
  return await User.findOne({ email: session.user.email });
}

export async function POST(req: Request) {
  await connectMongoDB();
  const currentUser = await getUserBySession();
  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const email = currentUser.email;

  const token = uuidv4();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

  await VerificationToken.deleteMany({ email });
  await VerificationToken.create({ email, token, expires });

  await sendVerificationEmail(email, token);

  return NextResponse.json({ message: "Verification email sent." });
}
