"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const moneyIcons = [
    "/images/money-icons/dollar.png",
    "/images/money-icons/euro.png",
    "/images/money-icons/naira.png",
    "/images/money-icons/ksh.png",
    "/images/money-icons/pound.png",
    "/images/money-icons/tsh.png",
    "/images/money-icons/cedis.png",

  ];

  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => (prevIndex + 1) % moneyIcons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [moneyIcons.length]);

  const renderAnimatedMoneyText = () => {
    return (
      <span className="inline-flex items-center">
        <span className="text-[#047151]">M</span>
        <motion.div
          key={currentIconIndex}
          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="inline-block mx-1 relative"
          style={{ width: "1.2em", height: "1.2em" }}
        >
          <Image
            src={moneyIcons[currentIconIndex]}
            alt="Money Icon"
            width={60}
            height={60}
            className="w-full h-full object-contain"
            priority
          />
        </motion.div>
        <span className="text-[#047151]">NEY</span>
      </span>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/home/heroimage.jpg')",
        }}
      ></div>

      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-8xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            The World Is Moving <span className="text-[#C28503]">Fast.</span>
            <br />
            Your {renderAnimatedMoneyText()} Should Too
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Experience fast, low-fee global payments and virtual cards powered
            by the blockchain. SurgePay connects you to a new financial reality
            that moves as freely as you do.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-row gap-4 justify-center items-center"
          >
            <a
              href="https://apps.apple.com/us/app/surgepay/id6748153951"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-[#0F9354] text-white px-6 py-3 rounded-3xl font-medium hover:bg-[#0C6B3E] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 min-w-[180px]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-bold">App Store</div>
                </div>
              </button>
            </a>


            <a
              href="https://play.google.com/store/apps/details?id=com.surgepay.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-white text-gray-900 px-6 py-3 rounded-3xl font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 min-w-[180px]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626-2.302-2.302 2.303-2.302zM5.864 2.658l10.937 6.333-2.302 2.302-8.635-8.635z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Available On</div>
                  <div className="text-lg font-bold">Google Play</div>
                </div>
              </button>
            </a>

          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </section>
  );
};

export default HeroSection;