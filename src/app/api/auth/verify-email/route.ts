import { NextResponse } from "next/server";
import { VerificationToken } from "@/models/verificationToken";
import User from "@/models/user"; // สมมติว่าคุณมีโมเดลนี้
import { connectMongoDB } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verify-failed`);
  }

  const tokenDoc = await VerificationToken.findOne({ token });

  if (!tokenDoc || tokenDoc.expires < new Date()) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verify-expired`);
  }

  await User.findOneAndUpdate(
    { email: tokenDoc.email },
    { $set: { emailVerified: new Date() } }
  );

  await VerificationToken.deleteOne({ token });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verify-success`);
}
