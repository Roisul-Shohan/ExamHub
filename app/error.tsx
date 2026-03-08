"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  // Check if it's a 401 Unauthorized error
  const isUnauthorized = error.status === 401 || 
    error.message?.includes("401") || 
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("not authenticated");

  // Parse API error message like "POST /api/courses 401"
  const apiErrorMatch = error.message?.match(/^(POST|GET|PUT|DELETE)\s+(\S+)\s+(\d+)/);
  const apiMethod = apiErrorMatch?.[1];
  const apiEndpoint = apiErrorMatch?.[2];
  const apiStatus = apiErrorMatch?.[3];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-pink-200/30 blur-[80px]" />
        <div className="absolute top-[30%] left-[30%] w-[30%] h-[30%] rounded-full bg-indigo-100/30 blur-[60px]" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-lg">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isUnauthorized ? "Access Denied" : "Oops!"}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {isUnauthorized
            ? "You are not authorized to access this resource. Please sign in first."
            : "Something went wrong"}
        </p>
        
        {/* API Error Details */}
        {apiMethod && apiEndpoint && apiStatus && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                apiStatus === '401' ? 'bg-yellow-100 text-yellow-700' :
                apiStatus === '403' ? 'bg-orange-100 text-orange-700' :
                apiStatus === '500' ? 'bg-red-100 text-red-700' :
                'bg-gray-200 text-gray-700'
              }`}>
                {apiStatus}
              </span>
              <span className="text-gray-500 text-sm font-mono">{apiMethod}</span>
              <span className="text-gray-700 text-sm font-mono">{apiEndpoint}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {!apiMethod && (
          <p className="text-gray-500 text-sm mb-6 font-mono bg-gray-100 rounded-lg p-3">
            {error.message || "An unexpected error occurred"}
          </p>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            Try Again
          </Button>
          {isUnauthorized && (
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Go Home
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
