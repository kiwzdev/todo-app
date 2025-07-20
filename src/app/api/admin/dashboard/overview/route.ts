import Todo from "@/models/todo";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // คำนวณสถิติพื้นฐาน
    const totalUsers = await User.countDocuments();
    const totalTodos = await Todo.countDocuments();
    const completedTodos = await Todo.countDocuments({ completed: true });
    const pendingTodos = await Todo.countDocuments({ completed: false });

    // คำนวณอัตราการเติบโตของผู้ใช้ (30 วันที่ผ่านมา)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousMonthStart = new Date(thirtyDaysAgo);
    previousMonthStart.setDate(previousMonthStart.getDate() - 30);

    const newUsersPreviousMonth = await User.countDocuments({
      createdAt: {
        $gte: previousMonthStart,
        $lt: thirtyDaysAgo,
      },
    });

    const userGrowth =
      newUsersPreviousMonth > 0
        ? ((newUsersThisMonth - newUsersPreviousMonth) /
            newUsersPreviousMonth) *
          100
        : 0;

    const completionRate =
      totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    const stats = {
      totalUsers,
      totalTodos,
      completedTodos,
      pendingTodos,
      userGrowth: Number(userGrowth.toFixed(1)),
      completionRate: Number(completionRate.toFixed(1)),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
