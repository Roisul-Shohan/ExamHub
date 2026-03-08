"use client"

import React from "react"

export function BackgroundLights() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Pure black background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-900/50 via-black/50 to-black" />
      
      {/* Subtle glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
    </div>
  )
}
