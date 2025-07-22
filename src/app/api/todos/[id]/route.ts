import handleAPIError from "@/helpers/error";
import { connectMongoDB } from "@/lib/db/mongodb";
import Todo from "@/models/todo";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// helper ดึง user ID จาก session
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await connectMongoDB();

  const user = await User.findOne({ email: session.user.email });
  return user?._id ?? null;
}

// PUT = แก้ไข task (รับ id จาก URL params)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = await params;

  try {
    const todo = await Todo.updateOne({ _id: id, user: userId }, body, {
      new: true,
    });

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

// DELETE = ลบ task (รับ id จาก URL params)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const deleted = await Todo.deleteOne({ _id: id, user: userId });

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
