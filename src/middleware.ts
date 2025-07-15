import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const user = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // console.log("user ", user)

  // Get the pathname of the request
  const { pathname } = req.nextUrl;

  // Check for email verification on profile routes
  if (pathname.startsWith("/profile") && (!user || !user.verifiedEmail)) {
    // Add query parameter for toast message
    const redirectUrl = new URL("/todos", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control with toast
  if (pathname.startsWith("/admin")) {
    if (user?.role !== "admin") {
      const redirectUrl = new URL("/todos", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!user || !["user", "admin", "moderator"].includes(user.role)) {
      const redirectUrl = new URL("/auth/signin", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/moderate/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
