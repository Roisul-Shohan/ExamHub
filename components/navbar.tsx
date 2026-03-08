"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10 px-4 h-16">
      <div className="max-w-8xl mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="relative w-9 h-9">
            <Image src="/logo.svg" alt="ExamHub Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-bold text-green-300">ExamHub</span>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-8" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#5dfeca] flex items-center justify-center">
                  <span className="text-black font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white hidden sm:block">{user?.name}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border border-white/10 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button className="bg-[#5dfeca] text-black hover:bg-[#4de9b5]">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
