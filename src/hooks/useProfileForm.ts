// hooks/useProfileForm.ts
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { getCloudinaryUrl } from "@/helpers/getCloudinaryUrl"; // สมมติว่า path ถูกต้อง
import { DEFAULT_PROFILE } from "@/utils/constant";

// --- ประเภทข้อมูล (Types) ---
interface ProfileFormState {
  username: string;
  email: string;
  image: string;
}

interface UserProfile {
  username: string;
  email: string;
  image: string;
}

// --- API Functions ---
const updateProfileAPI = async (
  payload: ProfileFormState
): Promise<{ user: UserProfile }> => {
  const { data } = await axios.put("/api/profile", payload);
  return data;
};

const uploadImageAPI = async (
  file: File,
  oldPublicId?: string
): Promise<{ publicId: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  if (oldPublicId) formData.append("oldPublicId", oldPublicId);
  const { data } = await axios.post("/api/upload", formData);
  return data;
};

// --- Custom Hook ---
export const useProfileForm = () => {
  const { data: session, update: updateSession } = useSession();
  //   const queryClient = useQueryClient(); // เพื่อ re-fetch หรือ invalidate queries ในอนาคต

  const initialData = useMemo(
    () => ({
      username: session?.user.username ?? "",
      email: session?.user.email ?? "",
      image: session?.user.image ?? "",
    }),
    [session]
  );

  const [formState, setFormState] = useState<ProfileFormState>(initialData);

  // Sync state เมื่อ session เปลี่ยน
  useEffect(() => {
    if (session) {
      setFormState(initialData);
    }
  }, [session, initialData]);

  // --- Mutations ---
  const uploadMutation = useMutation({
    mutationFn: ({ file, oldPublicId }: { file: File; oldPublicId?: string }) =>
      uploadImageAPI(file, oldPublicId),
    onSuccess: (data) => {
      setFormState((prev) => ({ ...prev, image: data.publicId }));
      toast.success("Image uploaded successfully!", { id: "upload" });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to upload image.";
      toast.error(message, { id: "upload" });
    },
    onMutate: () => {
      toast.loading("Uploading image...", { id: "upload" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileAPI,
    onSuccess: async (data) => {
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          ...data.user,
        },
      });
      toast.success("Profile updated!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Something went wrong.";
      toast.error(message);
    },
  });

  // --- Event Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    uploadMutation.mutate({ file, oldPublicId: session?.user.image });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formState);
  };

  // --- Derived State ---
  const isChanged = JSON.stringify(formState) !== JSON.stringify(initialData);
  const isSubmitting =
    updateProfileMutation.isPending || uploadMutation.isPending;
  const imageUrl =
    formState.image == "null"
      ? DEFAULT_PROFILE
      : getCloudinaryUrl(formState.image);

  return {
    formState,
    imageUrl,
    isChanged,
    isSubmitting,
    handleInputChange,
    handleFileChange,
    handleSaveProfile,
    updateProfileMutation,
  };
};
