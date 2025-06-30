"use client";

import Navbar from "@/components/Navbar";
import { DEFAULT_PROFILE } from "@/utils/constant";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { getCloudinaryUrl } from "@/helpers/getCloudinaryUrl";

const updateProfile = async (payload: {
  username: string;
  email: string;
  image: string;
}) => {
  const response = await axios.put("/api/profile", payload);
  return response.data;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // state ของ form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    image: "",
  });
  const [tempData, setTempData] = useState({
    username: "",
    email: "",
    image: "", // URL String
  });

  const isChanged =
    formData.username !== tempData.username ||
    formData.email !== tempData.email ||
    formData.image !== tempData.image;

  // ตั้งค่า formData และ tempData เมื่อ session โหลดเสร็จ
  useEffect(() => {
    if (status == "unauthenticated") router.push("/sign-in");

    setFormData({
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      image: session?.user.image ?? "",
    });
    setTempData({
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      image: session?.user.image ?? "",
    });
  }, [session, status, router]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data: {
      user: { username: string; email: string; image: string };
    }) => {
      toast.success("Profile updated!");
      console.log(data);
      setFormData(data.user);

      await update({
        user: {
          id: session?.user?.id || "",
          username: data.user.username,
          email: data.user.email,
          image: data.user.image || session?.user?.image || "",
        },
      });
    },
    onError: (error: unknown) => {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("Something went wrong.");
      }
    },
  });
  const handleChangeProfileImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.[0]) {
      const file = files[0];

      // ตรวจสอบประเภทและขนาดไฟล์
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, JPG)");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        // แสดง loading state
        toast.loading("Uploading image...", { id: "upload" });

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Upload failed");
        }

        const updatedData = { ...tempData, image: data.publicId };
        setTempData(updatedData);

        mutation.mutateAsync(updatedData);

        // toast.success("Image uploaded successfully!", { id: "upload" });
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to upload image",
          { id: "upload" }
        );
      }
    } else {
      // สำหรับ input อื่นๆ ที่ไม่ใช่ image
      setTempData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    mutation.mutateAsync({
      username: tempData.username,
      email: tempData.email,
      image: tempData.image,
    });
  };

  if (status === "loading") return <Loading />;
  if (status === "authenticated")
    return (
      <>
        <Navbar session={session} />

        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4">
          <div className="bg-green-100 dark:bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-md transition-colors duration-300">
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={
                  tempData.image
                    ? getCloudinaryUrl(tempData.image)
                    : DEFAULT_PROFILE
                }
                width={100}
                height={100}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border border-green-500 p-2"
                unoptimized
              />
              <>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChangeProfileImage}
                  className="hidden"
                  id="upload"
                />
                <label
                  htmlFor="upload"
                  className="cursor-pointer dark:bg-green-500 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:hover:bg-green-600 text-sm transition"
                >
                  Upload New Image
                </label>
              </>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block font-semibold text-black dark:text-gray-200 mb-1">
                  Username
                </label>
                <input
                  name="username"
                  value={tempData.username}
                  onChange={(e) => {
                    setTempData({ ...tempData, username: e.target.value });
                  }}
                  className={`w-full px-4 py-2 rounded shadow text-black dark:text-white bg-white dark:bg-gray-800 border dark:border-gray-700 
                  border-transparent transition-colors`}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block font-semibold text-black dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  value={tempData.email}
                  onChange={(e) => {
                    setTempData({ ...tempData, username: e.target.value });
                  }}
                  type="email"
                  className={`w-full px-4 py-2 rounded shadow text-black dark:text-white bg-white dark:bg-gray-800 border dark:border-gray-700 border-transparent transition-colors`}
                  placeholder="Enter your email"
                />
              </div>
              <Link
                href="#"
                className="text-sm text-green-600 dark:text-green-400 hover:underline mt-1 inline-block cursor-pointer transition"
                onClick={(e) => {
                  e.preventDefault();
                  // logic เปลี่ยนหน้า หรือเปิด modal เปลี่ยนรหัสผ่าน
                }}
              >
                Change password
              </Link>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!isChanged || mutation.isPending}
                className="dark:bg-green-500 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:hover:bg-green-600 transition disabled:opacity-50 "
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </>
    );
}
