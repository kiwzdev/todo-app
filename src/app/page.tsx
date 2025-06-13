"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/welcome.jpg"
        alt="Background"
        fill
        priority
        className="object-cover object-center z-0"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-transaprent bg-opacity-50 z-10" />

      {/* Centered Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome</h1>
        <p className="text-lg md:text-xl font-light mb-20">
          Discover amazing experiences with us.
        </p>
      </div>

      {/* Button at bottom */}
      <div className="absolute bottom-25 w-full flex justify-center z-20">
        <Link
          href="/todos"
          className="bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md"
        >
          Enter Website
        </Link>
      </div>
    </div>
  );
}
