import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";
import { VerificationToken } from "@/models/verificationToken";
import { connectMongoDB } from "@/lib/db/mongodb";
import handleAPIError from "@/helpers/error";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    await connectMongoDB();

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
      email: email.ToLowerCase(),
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
    const { message, status, code } = handleAPIError(error);
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    );
  }
}
