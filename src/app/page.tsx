"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const images = [
  "/images/welcome.jpg",
  "/images/slide2.jpg",
  "/images/slide3.jpg",
];
const texts = ["Welcome", "Let's Begin", "Enjoy the Journey"];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // สไลด์ภาพทุก 5 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter animation
  useEffect(() => {
    const currentSentence = texts[textIndex];
    if (charIndex < currentSentence.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentSentence.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // พักก่อนจะเปลี่ยนข้อความใหม่
      const timeout = setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % texts.length);
        setCharIndex(0);
        setTypedText("");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, textIndex]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        key={images[currentImage]} // ให้ Next.js เปลี่ยนภาพ
        src={images[currentImage]}
        alt="Background"
        fill
        priority
        className="object-cover object-center z-0 transition-opacity duration-1000"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />

      {/* Centered Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 font-mono">
          {typedText}
          <span className="animate-pulse">|</span>
        </h1>
        <p className="text-lg md:text-xl font-light mb-20">
          Discover amazing experiences with us.
        </p>
      </div>

      {/* Button at bottom */}
      <div className="absolute bottom-20 w-full flex justify-center z-20">
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
