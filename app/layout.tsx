import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/navbar";
import SessionWrapper from "@/components/session-wrapper";
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamHub - Online Examination System",
  description: "A comprehensive online examination platform for students and teachers. Create, manage, and take exams with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <div className="absolute inset-0 z-[-1] min-h-screen">
          <LightRays
            raysOrigin="top-center"
            raysColor="#5dfeca"
            raysSpeed={0.5}
            lightSpread={0.5}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.08}
            noiseAmount={0.0}
            distortion={0.01}
          />
        </div>
        <SessionWrapper>
          <Navbar />
          <main className="pt-16">
            {children}
             <Toaster position="bottom-right" reverseOrder={false} />
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
