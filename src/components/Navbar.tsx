"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { ThemeToggle } from "@/app/theme-toggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-green-300 dark:bg-green-700 shadow px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Web Name */}
        <Link
          href="/todos"
          className="text-3xl md:text-2xl font-bold text-gray-800 dark:text-gray-100"
        >
          Welcome, {session?.user.username}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {session && (
            <Link
              href="/profile"
              className="text-gray-700 dark:text-gray-100 hover:text-blue-500"
            >
              My Account
            </Link>
          )}

          {!session ? (
            <>
              <Link
                href="/sign-in"
                className="text-gray-700 dark:text-gray-100 hover:text-blue-500"
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
              className="text-gray-700 dark:text-gray-100 hover:text-blue-500 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </p>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X className="w-12 h-12 text-gray-800 dark:text-white" />
          ) : (
            <Menu className="w-12 h-12 text-gray-800 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 text-center">
          {session && (
            <Link
              href="/profile"
              className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
            >
              My Account
            </Link>
          )}
          {!session ? (
            <>
              <Link
                href="/sign-in"
                className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="block bg-blue-500 text-white px-4 rounded hover:bg-blue-600 py-4 text-2xl"
              >
                Sign up
              </Link>
            </>
          ) : (
            <p
              className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 cursor-pointer py-4 text-2xl"
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
