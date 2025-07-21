import handleAPIError from "@/helpers/error";
import Todo from "@/models/todo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const priorityStats = await Todo.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityData = priorityStats.map((stat) => {
      const colors = {
        high: "#ef4444",
        medium: "#f59e0b",
        low: "#10b981",
      };

      return {
        name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        value: stat.count,
        color: colors[stat._id],
      };
    });

    console.log("Priority Data:", priorityData);
    return NextResponse.json({ success: true, data: priorityData });
  } catch (error) {
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}
