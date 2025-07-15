"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function EmailVerificationToast() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const resendVerification = async () => {
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("📩 Verification email sent again!");
      } else {
        toast.error(data.message || "Failed to resend email");
      }
    } catch (err: any) {
      toast.error("Something went wrong", err.message);
    }
  };
  useEffect(() => {
    // ไม่ตรวจบนหน้า verify สำเร็จ, ล้มเหลว, หมดอายุ
    if (status === "loading" || status === "unauthenticated") return;
    if (pathname.startsWith("/auth") || pathname === "/") return;
    if (
      status === "authenticated" &&
      !session?.user?.verifiedEmail // หรือจะใช้ === null ก็ได้แล้วแต่ตอน set ใน callback
    ) {
      toast(
        <div className="text-sm">
          📩 Please verify your email to unlock full features.
          <div className="mt-2">
            <button
              onClick={resendVerification}
              className="text-blue-500 underline hover:text-blue-700"
            >
              Resend verification email
            </button>
          </div>
        </div>,
        { icon: "⚠️" }
      );
    }
  }, [session, status]);

  return null; // component นี้ไม่ต้อง render UI
}
