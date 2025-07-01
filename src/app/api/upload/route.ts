// app/api/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/");
    const folder = parts[5]; // todo-app
    const fileWithExt = parts[6]; // xxxx.jpg
    const filename = fileWithExt.split(".")[0]; // xxxx
    return `${folder}/${filename}`;
  } catch (err) {
    console.error("Invalid URL", err);
    return null;
  }
}

// Upload File
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const oldPublicId = formData.get("oldPublicId") as string; // เพิ่มสำหรับลบรูปเก่า

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const uploadRes = await cloudinary.uploader.upload(dataURI, {
      folder: "todo-app",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto:good" },
        { format: "auto" },
      ],
    });

    // อัปโหลดใหม่สำเร็จ -> ค่อยลบของเก่า
    if (oldPublicId) {
      cloudinary.uploader
        .destroy(oldPublicId)
        .then(() => {
          console.log("Old image deleted:", oldPublicId);
        })
        .catch((err) => {
          console.error("Failed to delete old image:", err);
        });
    }

    return NextResponse.json({
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      width: uploadRes.width,
      height: uploadRes.height,
      format: uploadRes.format,
      bytes: uploadRes.bytes,
    });
  } catch (err) {
    console.error("Upload to Cloudinary failed", err);
    return NextResponse.json(
      {
        message: "Upload failed",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Delete File (เพิ่ม endpoint สำหรับลบไฟล์)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");
    const publicId = searchParams.get("publicId");

    let targetPublicId = publicId;

    // ถ้าไม่มี publicId ให้ดึงจาก URL
    if (!targetPublicId && imageUrl) {
      targetPublicId = extractPublicIdFromUrl(imageUrl);
    }

    if (!targetPublicId) {
      return NextResponse.json(
        { error: "No public ID or valid URL provided" },
        { status: 400 }
      );
    }

    const deleteRes = await cloudinary.uploader.destroy(targetPublicId);

    if (deleteRes.result === "ok") {
      return NextResponse.json({
        message: "Image deleted successfully",
        publicId: targetPublicId,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete image", result: deleteRes.result },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Delete from Cloudinary failed", err);
    return NextResponse.json(
      {
        message: "Delete failed",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
