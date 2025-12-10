"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const AnyTimePayment = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="container mx-auto px-6 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Pay for Anything With Zero Stress.
          </h2>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
            Whether you&apos;re paying bills, buying essentials, or checking out
            on your favorite apps, our platform ensures fast, secure, and
            stress-free payments every time.
          </p>
        </motion.div>
      </div>

      <div className="w-full p-0 md:p-5 px-0 md:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <Image
            src="/images/home/payment-banner.png"
            width={1920}
            height={600}
            alt="Stress-free payment experience"
            className="w-full h-auto object-cover"
            priority
          />
        </motion.div>
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-[#00ff88] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-[#00ff88] rounded-full opacity-10 blur-3xl"></div>
    </section>
  );
};

export default AnyTimePayment;
