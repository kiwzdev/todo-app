"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, Twitter, Github } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";

export default function AboutPage() {
  // Authentication
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status == "unauthenticated") router.push("/sign-in");
  }, [session, status, router]);

  if (status === "loading") return <Loading />;
  if (status === "authenticated")
    return (
      <>
        <Navbar session={session} />
        <div className="px-6 py-10 max-w-4xl mx-auto text-gray-800 dark:text-gray-100">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-6 text-center"
          >
            About Us
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="mb-6 shadow-md dark:shadow-gray-700">
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed">
                  This app is a modern, full-featured productivity tool designed
                  to help you stay organized and focused. Built with Next.js,
                  Tailwind CSS, and other modern technologies, it supports dark
                  mode, responsive design, and smooth user experience.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md dark:shadow-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <a
                    href="mailto:example@email.com"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Mail size={16} /> example@email.com
                  </a>
                  <a
                    href="https://twitter.com/example"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Twitter size={16} /> @example
                  </a>
                  <a
                    href="https://github.com/example"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Github size={16} /> github.com/example
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </>
    );
}
