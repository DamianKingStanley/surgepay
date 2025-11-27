"use client";

import { motion } from "framer-motion";
// import Link from "next/link";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <footer
      className="text-white py-12 lg:py-16 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #014330 0%, #017755 100%)",
      }}
    >
      {/* Background Pattern/Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-12">
          {/* Left Side - Logo and Description */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo with Pop-out Effect */}
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="absolute -inset-2  blur-sm"></div>
                  <Image
                    src="/images/logo.png"
                    width={440}
                    height={450}
                    alt="SurgePay"
                    className="h-auto w-auto relative z-10"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl font-light">
                Cross-Border AI Financial Infrastructure for Africa&apos;s
                Mobile-First Economy.
              </p>

              {/* Copyright */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/70 text-sm">
                  © Copyright 2025 - SurgePay
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Email Subscription */}
          <div className="lg:w-1/2 w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <label
                htmlFor="email"
                className="block text-white/90 text-sm font-medium mb-3"
              >
                Your email address:
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                />
                <button
                  className="px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-lg whitespace-nowrap hover:shadow-xl hover:scale-105"
                  style={{
                    backgroundColor: "#A57000",
                    color: "#ffffff",
                  }}
                >
                  Join me website
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-xl"></div>
    </footer>
  );
};

export default Footer;
