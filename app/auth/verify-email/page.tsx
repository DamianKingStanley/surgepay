"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Inner component that uses useSearchParams
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/images/navlogo.png"
              width={150}
              height={70}
              alt="logo"
              className="h-50 w-50"
            />
          </Link>

          {/* Success Icon */}
          <div className="w-16 h-16 bg-[#8BD8BD] text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-light text-[#334039] mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a verification link to:
          </p>
          <p className="text-[#334039] font-medium mb-6 break-all">
            {email || "your email address"}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h3 className="font-medium text-[#334039] mb-2">Next Steps:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your inbox for our welcome email</li>
            <li>• Click the verification link in the email</li>
            <li>• Complete your school profile setup</li>
            <li>• Start creating exams immediately</li>
          </ul>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          <p>Didn&apos;t receive the email? Check your spam folder or </p>
          <button className="text-[#334039] hover:text-[#8BD8BD] font-medium mt-1">
            click here to resend
          </button>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-block w-full bg-[#334039] text-white py-3 rounded-lg font-medium hover:bg-[#D9E3DD] transition-all duration-300 text-center"
        >
          Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center">
            <div className="text-center">
              <div className="inline-block mb-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#334039] to-[#334039] bg-clip-text text-transparent">
                  Classeek
                </span>
              </div>
              <div className="w-16 h-16 bg-[#8BD8BD] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl text-[#334039] mb-2">Loading...</h2>
              <p className="text-gray-600">Preparing verification page</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
