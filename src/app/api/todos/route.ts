import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // ปรับ path ตามโครงสร้างโปรเจกต์
import { connectMongoDB } from '@/lib/mongodb';
import Task from '@/models/task';
import User from '@/models/user';

// helper ดึง user ID จาก session
async function getUserId(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await connectMongoDB();

  const user = await User.findOne({ email: session.user.email });
  return user?._id ?? null;
}

// GET = ดึง task ทั้งหมดของ user
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

// POST = สร้าง task ใหม่
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, dueDate, tags, priority } = body;

  try {
    const task = await Task.create({
      user: userId,
      title,
      description,
      dueDate,
      tags,
      priority,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Error creating task' }, { status: 400 });
  }
}

// PUT = แก้ไข task (body ต้องมี id)
export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ message: 'Error updating task' }, { status: 400 });
  }
}

// DELETE = ลบ task (body ต้องมี id)
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = body;

  try {
    const deleted = await Task.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted' });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting task' }, { status: 400 });
  }
}
