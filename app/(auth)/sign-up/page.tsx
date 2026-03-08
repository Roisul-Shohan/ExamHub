"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackgroundLights } from "@/components/background-lights"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")
  const [Loading, setLoading] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [error, setError] = useState("");
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
    setError("Password and Confirm Password do not match");
    return;
   }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        role,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Registered successfully! Please login.");
      router.push("/sign-in"); 
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

 

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col">
      <BackgroundLights />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-slate-700 bg-slate-200 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Join ExamHub and start your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 border text-sm ${
                      role === "STUDENT"
                        ? "bg-blue-500/20 border-blue-400 text-blue-200"
                        : "bg-white/5 border-slate-700 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("TEACHER")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 border text-sm ${
                      role === "TEACHER"
                        ? "bg-blue-500/20 border-blue-400 text-blue-200"
                        : "bg-white/5 border-slate-700 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-200">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 ${
                    !passwordMatch && formData.confirmPassword !== ""
                      ? "border-red-500/50"
                      : ""
                  }`}
                />
                {!passwordMatch && formData.confirmPassword !== "" && (
                  <p className="text-sm text-red-400">Passwords do not match</p>
                )}
              </div>

              

              {/* Sign Up Button */}
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full"
                disabled={Loading || !passwordMatch}
              >
                {Loading ? "Creating account..." : "Create Account"}
              </Button>

            </form>

            {/* Sign In Link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-400 hover:text-cyan-400 font-semibold">
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
