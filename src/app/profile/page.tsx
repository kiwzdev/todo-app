"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useProfileForm } from "@/hooks/useProfileForm"; // Import custom hook

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ใช้ Custom Hook เพื่อจัดการ Logic ทั้งหมด
  const {
    formState,
    imageUrl,
    isChanged,
    isSubmitting,
    handleInputChange,
    handleFileChange,
    handleSaveProfile,
    updateProfileMutation,
  } = useProfileForm();

  // Redirect ถ้ายังไม่ได้ login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") return <Loading />;
  
  if (status === "authenticated")
    return (
      <>
        <Navbar session={session} />

        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-green-100 dark:bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-md transition-colors duration-300"
          >
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={imageUrl}
                width={144}
                height={144}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-2 border-green-500 p-1"
                unoptimized
              />
              <div>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="upload"
                  className={`cursor-pointer dark:bg-green-500 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:hover:bg-green-600 text-sm transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? "Uploading..." : "Upload New Image"}
                </label>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block font-semibold text-black dark:text-gray-200 mb-1" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={formState.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded shadow text-black dark:text-white bg-white dark:bg-gray-800 border dark:border-gray-700 transition-colors"
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block font-semibold text-black dark:text-gray-200 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  type="email"
                  className="w-full px-4 py-2 rounded shadow text-black dark:text-white bg-white dark:bg-gray-800 border dark:border-gray-700 transition-colors"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
              <Link
                href="/change-password" // ควรลิ้งค์ไปยังหน้าเปลี่ยนรหัสผ่านจริง
                className="text-sm text-green-600 dark:text-green-400 hover:underline mt-1 inline-block transition"
              >
                Change password
              </Link>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={!isChanged || isSubmitting}
                className="dark:bg-green-500 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>

        <Footer />
      </>
    );

  // Fallback case
  return null;
}