"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

function WelcomePage() {
  const { data: session } = useSession();
  if (!session) redirect("/sign-in");

  console.log(session);

  return (
    <div>
      <Link href="/">Home</Link>
    </div>
  );
}

export default WelcomePage;
