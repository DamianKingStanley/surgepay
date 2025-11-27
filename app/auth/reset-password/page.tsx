"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Inner component that uses useSearchParams
function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!token) {
      setMessage("Invalid or missing reset token");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      if (res.ok) {
        setMessage("Password reset successfully!");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        const data = await res.json();
        setMessage(data.message || "Invalid or expired reset token");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Network error. Please try again.");
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
            New Password
          </h2>
          <p className="text-gray-600">Create your new password</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-600"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 bg-transparent text-black rounded-lg focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300"
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 bg-transparent text-black rounded-lg focus:ring-2 focus:ring-[#334039] focus:border-transparent transition-all duration-300"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-[#334039] text-white py-3 rounded-lg font-medium hover:bg-[#D9E3DD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-[#334039] hover:text-[#8BD8BD] font-medium transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPassword() {
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#334039] mx-auto mb-4"></div>
              <h2 className="text-2xl text-[#334039] mb-2">Loading...</h2>
              <p className="text-gray-600">Preparing password reset</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
