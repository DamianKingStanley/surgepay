"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Global = () => {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side - Two Stacked Images */}
          <div className="lg:w-2/3">
            <div className="relative">
              {/* Base Image - Larger */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="w-full max-w-lg"
              >
                <Image
                  src="/images/home/global.png"
                  width={400}
                  height={600}
                  alt="SurgePay app interface"
                  className="w-full h-auto object-cover rounded-2xl shadow-2xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="absolute -bottom-8 -right-8 w-full max-w-[180px] md:max-w-sm"
              >
                <Image
                  src="/images/home/balance.png"
                  width={400}
                  height={600}
                  alt="SurgePay transaction details"
                  className="w-full h-auto object-cover rounded-xl shadow-2xl border-4 border-white"
                />
              </motion.div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-lg"
            >
              {/* Heading */}
              <h2 className="text-2xl  font-bold text-gray-900 mb-6 leading-tight">
                Global Acceptance
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Send money and receive money across
                <br />
                borders within seconds.
              </p>

              <div className="flex gap-4 mb-12">
                <button className="bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[180px]">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on</div>
                    <div className="text-lg font-bold">App Store</div>
                  </div>
                </button>

                {/* Google Play Button */}
                <button className="bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[180px]">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626-2.302-2.302 2.303-2.302zM5.864 2.658l10.937 6.333-2.302 2.302-8.635-8.635z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Available on</div>
                    <div className="text-lg font-bold">Google Play</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#00ff88] rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#00ff88] rounded-full opacity-5 blur-3xl"></div>
    </section>
  );
};

export default Global;
