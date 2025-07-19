"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EmailVerificationToast() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const resendVerification = async () => {
    if (isResending) return;

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("📩 ส่งอีเมลยืนยันใหม่แล้ว!", {
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.error(data.message || "ไม่สามารถส่งอีเมลได้", {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (err: any) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    // รีเซ็ต toast เมื่อมีการเปลี่ยนเส้นทาง
    setHasShownToast(false);
  }, [pathname]);

  useEffect(() => {
    // ไม่แสดง toast ถ้า:
    // - กำลังโหลดข้อมูล session
    // - ผู้ใช้ยังไม่ได้ล็อกอิน
    // - อยู่ในหน้า auth หรือหน้าแรก
    // - แสดง toast ไปแล้ว
    if (status === "loading" || status === "unauthenticated") return;
    if (pathname.startsWith("/auth") || pathname === "/") return;
    if (hasShownToast) return;

    // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วแต่ยังไม่ยืนยันอีเมล
    if (
      status === "authenticated" &&
      session?.user &&
      (session.user.verifiedEmail === false ||
        session.user.verifiedEmail === null)
    ) {
      toast(
        <div className="flex items-start space-x-3 p-2">
          <div className="flex-shrink-0 text-2xl">⚠️</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 mb-1">
              กรุณายืนยันอีเมลของคุณ
            </div>
            <div className="text-xs text-gray-600 mb-3">
              เพื่อปลดล็อกฟีเจอร์ทั้งหมดและเพิ่มความปลอดภัยให้บัญชี
            </div>
            <button
              onClick={resendVerification}
              disabled={isResending}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isResending
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              }`}
            >
              {isResending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังส่ง...
                </>
              ) : (
                <>📩 ส่งอีเมลยืนยันใหม่</>
              )}
            </button>
          </div>
        </div>,
        {
          duration: 0, // ไม่หายไปเอง
          position: "top-center",
          style: {
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "0",
          },
        }
      );

      setHasShownToast(true);
    }
  }, [session, status, pathname, hasShownToast, isResending]);

  return null;
}
