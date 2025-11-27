"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFDFD] to-[#F5F7FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#334039] to-[#8BD8BD] rounded-3xl flex items-center justify-center shadow-2xl">
            <Compass className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#334039] to-[#334039] bg-clip-text text-transparent mb-4">
            404
          </h1>

          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Lost in Space?
          </h2>

          <p className="text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#334039] text-white rounded-lg font-medium hover:bg-[#D9E3DD] transition-all duration-300"
              >
                <Home className="w-4 h-4" />
                <span>Home Page</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center space-x-2 px-6 py-3 text-[#334039] border border-[#334039] rounded-lg font-medium hover:bg-[#334039] hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
