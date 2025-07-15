"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("กำลังตรวจสอบ...");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token ไม่ถูกต้อง");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("ยืนยันอีเมลสำเร็จ!");
          // รอสักครู่ก่อน redirect
          setTimeout(() => {
            router.replace("/todos");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || "เกิดข้อผิดพลาด");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 border rounded-md shadow-md">
        {status === "loading" && <p>กำลังตรวจสอบ...</p>}
        {status === "success" && (
          <p className="text-green-600 font-semibold">
            {message} กำลังพาท่านไปยังหน้าหลัก...
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 font-semibold">{message}</p>
        )}
      </div>
    </div>
  );
}
