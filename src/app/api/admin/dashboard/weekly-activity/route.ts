import Todo from "@/models/todo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyData = await Todo.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: sevenDaysAgo } },
            {
              updatedAt: { $gte: sevenDaysAgo },
              completed: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$createdAt" },
            type: {
              $cond: [{ $eq: ["$completed", true] }, "completed", "created"],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // แปลงข้อมูลให้เป็นรูปแบบที่ต้องการ
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = dayNames.map((day, index) => {
      const dayData = weeklyData.filter((item) => item._id.day === index + 1);
      const completed =
        dayData.find((d) => d._id.type === "completed")?.count || 0;
      const created = dayData.find((d) => d._id.type === "created")?.count || 0;

      return {
        day,
        completed,
        created,
      };
    });

    console.log("weeklyActivity", weeklyActivity);
    return NextResponse.json({ success: true, data: weeklyActivity });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
