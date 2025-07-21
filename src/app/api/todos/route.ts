import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // ปรับ path ตามโครงสร้างโปรเจกต์
import { connectMongoDB } from "@/lib/db/mongodb";
import Todo from "@/models/todo";
import User from "@/models/user";
import handleAPIError from "@/helpers/error";

// helper ดึง user ID จาก session
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await connectMongoDB();

  const user = await User.findOne({ email: session.user.email });
  return user?._id ?? null;
}

// GET = ดึง task ทั้งหมดของ user
export async function GET() {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const tasks = await Todo.find({ user: userId }).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

// POST = สร้าง task ใหม่
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, dueDate, tags, priority } = body;

  try {
    const todo = await Todo.create({
      user: userId,
      title,
      description,
      dueDate,
      tags,
      priority,
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}

// PUT = แก้ไข task (body ต้องมี id)
export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true }
    );

    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}

// DELETE = ลบ task (body ต้องมี id)
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;

  try {
    const deleted = await Todo.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo deleted" });
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}
