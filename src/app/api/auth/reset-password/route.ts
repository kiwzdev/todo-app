// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import PasswordResetToken from "@/models/passwordResetToken";
import { connectMongoDB } from "@/lib/db/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find all reset tokens and check which one matches
    const resetTokens = await PasswordResetToken.find({
      used: false,
      expiresAt: { $gt: new Date() },
    }).populate("user");

    let validToken = null;
    let user = null;

    // Check each token to find the matching one
    for (const resetTokenDoc of resetTokens) {
      const isValid = await bcrypt.compare(token, resetTokenDoc.token);
      if (isValid) {
        validToken = resetTokenDoc;
        user = resetTokenDoc.user;
        break;
      }
    }

    if (!validToken || !user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Mark token as used
    await PasswordResetToken.findByIdAndUpdate(validToken._id, {
      used: true,
    });

    // Delete all reset tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
