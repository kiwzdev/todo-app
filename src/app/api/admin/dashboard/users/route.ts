import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "todos",
          localField: "_id",
          foreignField: "user",
          as: "todos",
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          username: 1,
          emailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          todosCount: { $size: "$todos" },
          completedTodos: {
            $size: {
              $filter: {
                input: "$todos",
                cond: { $eq: ["$$this.completed", true] },
              },
            },
          },
          isVerified: { $ne: ["$emailVerified", null] },
          lastActive: "$updatedAt",
          joinDate: "$createdAt",
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
    ]);

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      todosCount: user.todosCount,
      completedTodos: user.completedTodos,
      lastActive: user.lastActive.toISOString().split("T")[0],
      joinDate: user.joinDate.toISOString().split("T")[0],
    }));
    console.log("formattedUsers", formattedUsers);
    return NextResponse.json({ success: true, data: formattedUsers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
