"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiHome, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Number */}
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl lg:text-9xl font-bold text-white mb-4"
          >
            404
          </motion.h1>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl lg:text-3xl font-bold text-white mb-6"
          >
            Page Not Found
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed"
          >
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The
            page might have been moved, deleted, or you entered an incorrect
            URL.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/"
              className="bg-[#00ff88] text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-[#00e579] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FiHome className="w-5 h-5" />
              Back to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 text-gray-400 text-sm"
          >
            <p>
              Need help?{" "}
              <Link href="/contact" className="text-[#00ff88] hover:underline">
                Contact support
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#00ff88] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#00ff88] rounded-full opacity-10 blur-3xl"></div>
      </div>
    </div>
  );
}
