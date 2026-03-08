"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackgroundLights } from "@/components/background-lights"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError("Invalid email or password")
      return
    }

    try {
      const response = await fetch("/api/auth/session")
      const session = await response.json()
      
      if (session?.user?.role === "TEACHER") {
        router.push("/teacher-dashboard")
      } else {
        router.push("/")
      }
    } catch {
     router.push("/");
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col">
      <BackgroundLights />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-slate-700 bg-slate-950/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 border ${
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
                    className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 border ${
                      role === "TEACHER"
                        ? "bg-blue-500/20 border-blue-400 text-blue-200"
                        : "bg-white/5 border-slate-700 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
                  />
                  <span className="text-slate-400">Remember me</span>
                </label>
                <Link href="#" className="text-blue-400 hover:text-cyan-400">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

            </form>

            {/* Sign Up Link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-400 hover:text-cyan-400 font-semibold">
                Sign up here
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
