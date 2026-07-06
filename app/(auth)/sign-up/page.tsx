'use client';

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackgroundLights } from "@/components/background-lights"
import { motion, AnimatePresence } from "framer-motion"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")
  const [loading, setLoading] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setPasswordMatch(formData.password === formData.confirmPassword)
  }, [formData.password, formData.confirmPassword])

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
      setError("Password and Confirm Password do not match")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/sign-in")
        }, 2000)
      } else {
        setError(data.message)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm backdrop-blur-sm"
  const labelClass = "text-sm font-medium text-slate-300 mb-1.5 block"

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
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
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
                    <label htmlFor="name" className={labelClass}>Full Name</label>
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
                    <label htmlFor="email" className={labelClass}>Email Address</label>
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
                    <label htmlFor="password" className={labelClass}>Password</label>
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
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 ${
                        !passwordMatch && formData.confirmPassword !== "" ? "border-red-500/50" : ""
                      }`}
                    />
                    {!passwordMatch && formData.confirmPassword !== "" && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-400"
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Sign Up Button */}
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !passwordMatch}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : "Create Account"}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Account Created!</h3>
                    <p className="text-slate-400 text-sm">Redirecting you to sign in...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In Link */}
            <AnimatePresence>
              {!success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-slate-400 text-sm mt-6"
                >
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-blue-400 hover:text-cyan-400 font-semibold">
                    Sign in here
                  </Link>
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
