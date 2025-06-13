"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { ThemeToggle } from "@/app/theme-toggle";

type NavbarProps = {
  session: Session | null;
}
export default function Navbar({ session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Web Name */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          Welcome, {session?.user.username}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle/>
          {session && (
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              My Account
            </Link>
          )}

          {!session ? (
            <>
              <Link
                href="/sign-in"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign up
              </Link>
            </>
          ) : (
            <p
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 cursor-pointer"
              onClick={() => signOut()}
            >
              Log out
            </p>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X className="w-6 h-6 text-gray-800 dark:text-white" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-2 space-y-2">
          {session && (
            <Link
              href="/dashboard"
              className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              My Account
            </Link>
          )}
          {!session ? (
            <>
              <Link
                href="/sign-in"
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-500"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign up
              </Link>
            </>
          ) : (
            <p
              className="block text-gray-700 dark:text-gray-200 hover:text-blue-500 cursor-pointer"
              onClick={() => signOut()}
            >
              Log out
            </p>
          )}
        </div>
      )}
    </nav>
  );
}
