"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <div className="relative">
      {/* Logo Hanging Over Footer */}
      <div className="absolute -top-16 left-6 lg:left-12 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-2  rounded-lg"></div>
          <Image
            src="/images/logo.png"
            width={180}
            height={80}
            alt="SurgePay"
            className="h-auto w-auto relative z-10"
          />
        </motion.div>
      </div>

      <footer
        className="text-white pt-20 pb-12 lg:pt-24 lg:pb-16 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #014330 0%, #017755 100%)",
        }}
      >
        {/* Background Pattern/Overlay */}
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-6 relative z-10 pt-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-12">
            {/* Left Side - Description */}
            <div className="lg:w-1/2 mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
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

                {/* Combined Input + Button Container */}
                <div className="relative flex items-center">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm pr-36"
                  />
                  <button
                    className="absolute right-1 py-3 px-6 rounded-full font-bold transition-all duration-300 shadow-lg whitespace-nowrap hover:shadow-xl hover:scale-105"
                    style={{
                      background: "linear-gradient(to right, #009168, #A0A226)",
                      color: "#ffffff",
                    }}
                  >
                    Join the waitlist
                  </button>

                </div>

                {/* Social Media Icons */}
                <div className="flex gap-4 mt-6">
                  {/* Twitter */}
                  <motion.a
                    href="https://x.com/surgepay_io"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full text-black bg-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <Image
                      src="/images/home/x.png"
                      alt="Threads"
                      width={50}
                      height={50}
                    />
                  </motion.a>

                  {/* Instagram */}
                  <motion.a
                    href="https://www.instagram.com/surgepay_io/"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <Image
                      src="/images/home/instagram.png"
                      alt="Threads"
                      width={50}
                      height={50}
                    />
                  </motion.a>
                  {/* Threads */}

                  <motion.a
                    href="https://www.threads.net/@surgepay_io"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <Image
                      src="/images/home/thread.png"
                      alt="Threads"
                      width={50}
                      height={50}
                    />
                  </motion.a>


                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-xl"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-xl"></div>
      </footer>
    </div>
  );
};

export default Footer;
