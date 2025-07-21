// app/api/auth/forgowt-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "@/models/user";
import PasswordResetToken from "@/models/passwordResetToken";
import { connectMongoDB } from "@/lib/db/mongodb";
import { sendPasswordResetEmail } from "@/lib/email/sendResetToken"; // You'll need to implement this
import handleAPIError from "@/helpers/error";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json(
        { message: "If the email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Create reset token record
    await PasswordResetToken.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // TODO: Implement email sending
    await sendPasswordResetEmail(user.email, resetUrl);

    // For development, log the reset URL
    console.log("Password reset URL:", resetUrl);

    return NextResponse.json(
      { message: "If the email exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}
