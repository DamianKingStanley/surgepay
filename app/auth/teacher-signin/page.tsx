/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Lock, Mail } from "lucide-react";
import Image from "next/image";

// Inner component that uses useSearchParams
function TeacherSigninContent() {
  const [formData, setFormData] = useState({
    email: "",
    schoolId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/teacher/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Use the correct provider ID and field names
      const result = await signIn("teacher-login", {
        email: formData.email,
        schoolId: formData.schoolId,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      console.log("SignIn result:", result); // Debug log

      if (result?.error) {
        // ✅ Show specific error message from server
        setError(result.error || "Invalid email or school ID");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Authentication failed");
      }
    } catch (err: any) {
      console.error("SignIn error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
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

          <h2 className="text-3xl font-light text-[#334039] mb-2">
            Teacher Sign In
          </h2>
          <p className="text-gray-600">Access your teaching dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 px-4 py-3 border bg-white text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="schoolId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              School ID *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="schoolId"
                name="schoolId"
                type="text" // ✅ Changed to text since it's not a password
                required
                value={formData.schoolId}
                onChange={(e) =>
                  setFormData({ ...formData, schoolId: e.target.value })
                }
                className="w-full pl-10 px-4 py-3 border bg-white text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300"
                placeholder="Enter your school ID"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use the school ID provided by your administrator
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#334039] text-white py-3 rounded-lg font-medium hover:bg-[#D9E3DD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Sign In as Teacher
              </>
            )}
          </button>
        </form>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-[#334039] mb-2">
            Need Help?
          </h4>
          <p className="text-xs text-gray-600">
            Contact your school administrator if you don&apos;t have your school
            ID or are experiencing issues signing in.
          </p>
        </div>

        {/* Footer Links */}
        {/* <div className="text-center space-y-2">
          <p className="text-gray-600 text-sm">
            Are you a student?{" "}
            <Link href="/auth/student/signin" className="text-[#334039] hover:text-[#8BD8BD] font-medium transition-colors">
              Student Sign In
            </Link>
          </p>
          <p className="text-gray-600 text-sm">
            School administrator?{" "}
            <Link href="/auth/signin" className="text-[#334039] hover:text-[#8BD8BD] font-medium transition-colors">
              Admin Sign In
            </Link>
          </p>
        </div> */}
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function TeacherSignin() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="inline-block mb-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#334039] to-[#334039] bg-clip-text text-transparent">
                  Classika
                </span>
              </div>
              <div className="w-16 h-16 bg-[#334039] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl text-[#334039] mb-2">Loading...</h2>
              <p className="text-gray-600">Preparing teacher sign in</p>
            </div>
          </div>
        </div>
      }
    >
      <TeacherSigninContent />
    </Suspense>
  );
}
