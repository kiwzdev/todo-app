import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation"; // import usePathname ด้วย
import { useEffect } from "react";

export function useAuthRedirect({
  redirectIfAuthenticatedTo = "/todos",
  redirectIfUnauthenticatedTo = "/sign-in",
} = {}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // ได้ path ปัจจุบัน

  useEffect(() => {
    if (status === "loading") return;

    if (
      status === "authenticated" &&
      (pathname === "/sign-in" || pathname === "/sign-up")
    ) {
      router.replace(redirectIfAuthenticatedTo);
    } else if (
      status === "unauthenticated" &&
      pathname !== redirectIfUnauthenticatedTo &&
      pathname !== "/sign-up" &&
      pathname !== "/sign-in"
    ) {
      router.replace(redirectIfUnauthenticatedTo);
    }
  }, [
    status,
    router,
    pathname,
    redirectIfAuthenticatedTo,
    redirectIfUnauthenticatedTo,
  ]);

  return status;
}
