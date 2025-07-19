import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";
import { VerificationToken } from "@/models/verificationToken";
import { connectMongoDB } from "@/lib/db/mongodb";
import { getServerSession } from "next-auth";
import User from "@/models/user";
import { authOptions } from "../[...nextauth]/route";

// Rate limiting in-memory store (ในการใช้งานจริงแนะนำใช้ Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function getUserBySession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await connectMongoDB();
  return await User.findOne({ email: session.user.email });
}

function checkRateLimit(email: string): {
  allowed: boolean;
  remainingTime?: number;
} {
  const now = Date.now();
  const key = `verification_${email}`;
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    // Reset หรือสร้างใหม่ - อนุญาต 3 ครั้งใน 1 ชั่วโมง
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 ชั่วโมง
    });
    return { allowed: true };
  }

  if (limit.count >= 3) {
    return {
      allowed: false,
      remainingTime: Math.ceil((limit.resetTime - now) / 1000 / 60), // นาที
    };
  }

  limit.count++;
  rateLimitStore.set(key, limit);
  return { allowed: true };
}

export async function POST(req: Request) {
  try {
    await connectMongoDB();

    const currentUser = await getUserBySession();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบก่อน",
        },
        { status: 401 }
      );
    }

    const email = currentUser.email;

    // ตรวจสอบว่า user ยืนยันอีเมลแล้วหรือไม่
    if (currentUser.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลของคุณได้รับการยืนยันแล้ว",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบ rate limiting
    const rateLimitResult = checkRateLimit(email);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `คุณได้ขออีเมลยืนยันเกินจำนวนที่อนุญาต กรุณารอ ${rateLimitResult.remainingTime} นาที`,
        },
        { status: 429 }
      );
    }

    // ตรวจสอบว่ามี token ที่ยังใช้ได้อยู่หรือไม่
    const existingToken = await VerificationToken.findOne({
      email,
      expires: { $gt: new Date() },
    });

    if (existingToken) {
      // หากมี token ที่ยังใช้ได้ ให้ส่งอีเมลใหม่ด้วย token เดิม
      await sendVerificationEmail(email, existingToken.token);

      return NextResponse.json({
        success: true,
        message: "ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ",
        tokenExpiry: existingToken.expires,
      });
    }

    // สร้าง token ใหม่
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

    // ลบ token เก่าที่หมดอายุ
    await VerificationToken.deleteMany({
      email,
      expires: { $lt: new Date() },
    });

    // สร้าง token ใหม่
    await VerificationToken.create({
      email,
      token,
      expires,
      createdAt: new Date(),
    });

    // ส่งอีเมล
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "ส่งอีเมลยืนยันสำเร็จ กรุณาตรวจสอบกล่องจดหมายของคุณ",
      tokenExpiry: expires,
    });
  } catch (error) {
    console.error("Send verification email error:", error);

    // ตรวจสอบประเภทของ error
    if (error instanceof Error) {
      if (error.message.includes("email")) {
        return NextResponse.json(
          {
            success: false,
            message: "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองอีกครั้ง",
          },
          { status: 500 }
        );
      }

      if (error.message.includes("database")) {
        return NextResponse.json(
          {
            success: false,
            message: "เกิดข้อผิดพลาดในระบบฐานข้อมูล กรุณาลองอีกครั้ง",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในระบบ กรุณาลองอีกครั้งหรือติดต่อผู้ดูแล",
      },
      { status: 500 }
    );
  }
}
