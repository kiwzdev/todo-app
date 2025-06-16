"use client";

import Navbar from "@/components/Navbar";
import { DEFAULT_PROFILE } from "@/utils/constant";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

const updateProfile = async (formData: FormData) => {
  const response = await axios.put("/api/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // state ของ form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    image: null as File | null,
  });
  const [tempData, setTempData] = useState(formData);
  const [isEditing, setIsEditing] = useState(false);

  // ref เก็บ URL object เพื่อเคลียร์ memory
  const imageURLRef = useRef<string | null>(null);

  // ตั้งค่า formData และ tempData เมื่อ session โหลดเสร็จ
  useEffect(() => {
    if (status == "unauthenticated") router.push("/sign-in");

    setFormData({
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      image: null,
    });
    setTempData({
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      image: null,
    });
  }, [session, status, router]);

  // ล้าง URL Object ก่อนสร้างใหม่ทุกครั้ง
  useEffect(() => {
    if (tempData.image) {
      if (imageURLRef.current) {
        URL.revokeObjectURL(imageURLRef.current);
      }
      imageURLRef.current = URL.createObjectURL(tempData.image);
    }

    return () => {
      if (imageURLRef.current) {
        URL.revokeObjectURL(imageURLRef.current);
      }
    };
  }, [tempData.image]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data: {
      user: { username: string; email: string; image?: string };
    }) => {
      toast.success("Profile updated!");
      console.log(data);
      setFormData(tempData);
      setIsEditing(false);

      await update({
        ...session,
        user: {
          ...session?.user,
          username: data.user.username,
          email: data.user.email,
          // ถ้ามีรูปภาพใหม่ก็ใส่ตรงนี้ด้วย ****
          image: data.user.image ?? session?.user?.image,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      setTempData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setTempData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditClick = () => {
    setTempData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempData(formData);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("username", tempData.username);
    data.append("email", tempData.email);
    if (tempData.image) {
      data.append("image", tempData.image);
    }
    mutation.mutateAsync(data);
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
                    ? imageURLRef.current || DEFAULT_PROFILE
                    : DEFAULT_PROFILE
                }
                width={100}
                height={100}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border border-green-500 p-2"
                unoptimized
              />
              {isEditing && (
                <>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
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
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block font-semibold text-black dark:text-gray-200 mb-1">
                  Username
                </label>
                <input
                  name="username"
                  value={isEditing ? tempData.username : formData.username}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-2 rounded shadow text-black dark:text-white bg-white dark:bg-gray-800 border dark:border-gray-700 ${
                    isEditing ? "border-green-500" : "border-transparent"
                  } transition-colors`}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block font-semibold text-black dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  value={isEditing ? tempData.email : formData.email}
                  onChange={handleChange}
                  type="email"
                  readOnly={!isEditing}
                  className={`w-full px-4 py-2 rounded shadow text-black dark:text-white bg-white dark:bg-gray-800 border dark:border-gray-700 ${
                    isEditing ? "border-green-500" : "border-transparent"
                  } transition-colors`}
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

            <div className="mt-6 flex justify-end space-x-4">
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  disabled={mutation.isPending}
                  className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={mutation.isPending}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={mutation.isPending}
                    className="dark:bg-green-500 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </>
    );
}
