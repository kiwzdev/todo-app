"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { userSchema } from "@/lib/validations/userSchema";

export default function SignUpPage() {
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status == "authenticated") router.push("/todos");
  }, [session, status, router]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Validation
      const result = userSchema.safeParse(formData);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        setFormErrors(fieldErrors);
        return;
      }

      await axios.post("/api/auth/sign-up", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success("สมัครสมาชิกสำเร็จ!");
      router.push("/sign-in");
    } catch (err) {
      // Type guard
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message || "เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์";

        if (err.response?.status === 409) {
          setError("User already exists");
          toast.error("ชื่อผู้ใช้หรืออีเมลถูกใช้แล้ว!");
        } else {
          setError(message);
          toast.error(message);
        }
      } else {
        setError("Something went wrong");
        toast.error("เกิดข้อผิดพลาดบางอย่าง");
      }
    }
  };
  if (status === "loading") return <Loading />;
  if (status === "unauthenticated")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Create an account
          </h2>

          {error && (
            <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                Username
              </label>
              <input
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {formErrors.username && (
                <p className="text-red-500 text-sm">{formErrors.username[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm">{formErrors.password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {formErrors.confirmPassword[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Sign up
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <a href="/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    );
}
