"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-300 dark:bg-green-700 text-gray-800 dark:text-gray-100 shadow-inner px-4 py-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Left Side */}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} KiwzDev. All rights reserved.
        </p>

        {/* Right Side - Links */}
        <div className="flex space-x-4">
          <Link
            href="/about"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
