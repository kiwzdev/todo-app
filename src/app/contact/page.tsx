"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";

export default function ContactPage() {
  // Authentication
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status == "unauthenticated") router.push("/sign-in");
  }, [session, status, router]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Feedback sent successfully!");
    setEmail("");
    setMessage("");
  };

  if (status === "loading") return <Loading />;
  if (status === "authenticated")
    return (
      <>
        <Navbar session={session} />
        <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 dark:text-gray-100">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-6 text-center"
          >
            Contact Us
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="shadow-md dark:shadow-gray-700">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Your Email</label>
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Your Message
                    </label>
                    <Textarea
                      required
                      placeholder="Your feedback..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="flex items-center gap-2">
                    <Send size={16} /> Send Feedback
                  </Button>
                </form>

                <div className="mt-6 border-t pt-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail size={16} /> support@example.com
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </>
    );
}
