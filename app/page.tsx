"use client"

import Link from "next/link"
import { BackgroundLights } from "@/components/background-lights"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <BackgroundLights />

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-10">
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">ExamHub</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Your Modern Online Examination Platform
              </p>
            </div>

            {/* Description */}
            <div className="space-y-8 max-w-2xl mx-auto">
              <p className="text-gray-400 leading-relaxed">
                ExamHub is a comprehensive online examination system designed to make learning and assessment seamless. Whether you're a student looking to test your knowledge or an educator creating assessments, we've got you covered.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📚</div>
                  <h3 className="text-white font-semibold mb-2">Learn Anywhere</h3>
                  <p className="text-gray-400 text-sm">Access exams and courses from anywhere, anytime</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                  <h3 className="text-white font-semibold mb-2">Real-time Analytics</h3>
                  <p className="text-gray-400 text-sm">Track your progress with detailed metrics</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🔒</div>
                  <h3 className="text-white font-semibold mb-2">Secure & Private</h3>
                  <p className="text-gray-400 text-sm">Enterprise-grade security for your data</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-white/20 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2026 ExamHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
