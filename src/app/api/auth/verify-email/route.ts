import { NextResponse } from "next/server";
import { VerificationToken } from "@/models/verificationToken";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    await connectMongoDB();

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const tokenDoc = await VerificationToken.findOne({ token });

    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: "Token ไม่ถูกต้องหรือไม่มีอยู่" },
        { status: 400 }
      );
    }

    if (tokenDoc.expires < new Date()) {
      // ลบ token ที่หมดอายุ
      await VerificationToken.deleteOne({ token });
      return NextResponse.json(
        { success: false, message: "Token หมดอายุแล้ว กรุณาขอ token ใหม่" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await User.findOne({ email: tokenDoc.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเคยยืนยันแล้วหรือไม่
    if (user.emailVerified) {
      await VerificationToken.deleteOne({ token });
      return NextResponse.json(
        { success: false, message: "อีเมลนี้ได้รับการยืนยันแล้ว" },
        { status: 400 }
      );
    }

    // อัปเดตสถานะการยืนยัน
    await User.findOneAndUpdate(
      { email: tokenDoc.email },
      { $set: { emailVerified: new Date() } }
    );

    // ลบ token ที่ใช้แล้ว
    await VerificationToken.deleteOne({ token });

    return NextResponse.json({
      success: true,
      message: "ยืนยันอีเมลสำเร็จ!"
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}