"use client";

import { motion } from "framer-motion";
import Image from "next/image";
const CurrencyRate = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Top Text Content */}
      <div className="container mx-auto px-6 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Exchange currencies at real value, your money, your rate.
          </h2>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
            You get access to live market ratees, letting you swap between
            currencies instantly without unnecessary markup.
          </p>
        </motion.div>
      </div>

      {/* Full Cover Image Banner */}
      <div className="w-full p-0 md:p-5 px-0 md:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full relative"
        >
          {/* Second Image - Base Image */}
          <Image
            src="/images/home/currencyrate.jpg"
            width={1920}
            height={600}
            alt="Exchange currencies at real value, your money, your rate."
            className="w-full h-auto object-cover"
            priority
          />

          {/* First Image - Stacked on top (left side) */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8 lg:top-12 lg:left-12 w-1/3 md:w-1/4 lg:w-1/5 max-w-[200px]">
            <Image
              src="/images/home/rateimage.png"
              width={120}
              height={60}
              alt="Exchange currencies"
              className="w-full h-auto object-cover rounded-lg shadow-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#00ff88] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-[#00ff88] rounded-full opacity-10 blur-3xl"></div>
    </section>
  );
};

export default CurrencyRate;
