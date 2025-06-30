import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

async function getUserBySession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await connectMongoDB();
  return await User.findOne({ email: session.user.email });
}

export async function PUT(req: NextRequest) {
  const currentUser = await getUserBySession();
  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const newUsername = body.username?.trim();
  const newEmail = body.email?.trim();
  const newImage = body.image?.trim();

  if (!newUsername || !newEmail) {
    return NextResponse.json({ message: "Username and email are required" }, { status: 400 });
  }

  await connectMongoDB();

  // ตรวจสอบ username ซ้ำ (ยกเว้นตัวเอง)
  const existedUsername = await User.findOne({
    username: newUsername,
    _id: { $ne: currentUser._id },
  });

  if (existedUsername) {
    return NextResponse.json({ message: "Username already taken" }, { status: 409 });
  }

  // ตรวจสอบ email ซ้ำ (ยกเว้นตัวเอง)
  const existedEmail = await User.findOne({
    email: newEmail,
    _id: { $ne: currentUser._id },
  });

  if (existedEmail) {
    return NextResponse.json({ message: "Email already in use" }, { status: 409 });
  }

  try {
    currentUser.username = newUsername;
    currentUser.email = newEmail;
    currentUser.image = newImage;

    await currentUser.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        username: currentUser.username,
        email: currentUser.email,
        image: currentUser.image,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: "Failed to update profile", error: String(err) }, { status: 500 });
  }
}
