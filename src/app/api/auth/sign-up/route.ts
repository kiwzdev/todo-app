import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/db/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connectMongoDB();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      // Email already exists
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      // Username already exists
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (err) {
    console.error("Error in register route:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
