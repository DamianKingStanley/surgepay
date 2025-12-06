/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";

const FeaturesSection: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      id: 1,
      title: "Multi-Currency Wallets",
      description:
        "Deep integration with the Stellar blockchain; fast, reliable, and transparent.",
      image: "/images/home/wallets.png",
    },
    {
      id: 2,
      title: "Instant P2P Transfers",
      description:
        "Backed by Stablecoins, giving you the stability of fiat with the efficiency of crypto and send instantly across Africa with zero fees between SurgePay users.",
      image: "/images/home/p2p.png",
    },
    {
      id: 3,
      title: "Virtual Borderless Cards",
      description:
        "Spend online and offline worldwide with low forex fees, funded by local currency or digital dollars.",
      image: "/images/home/greencard.png",
    },
  ];

  const rewards = [
    { text: "Multi-currency wallet with higher limits", checked: true },
    { text: "Reduced forex fees on international payments", checked: true },
    { text: "Early access to xNGN stablecoin", checked: true },
    { text: "Stellar blockchain integration benefits", checked: true },
    { text: "Priority access to business solutions", checked: true },
    { text: "Free P2P stablecoin transfers for 6 months", checked: true },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Makes SurgePay Different?
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlike traditional wallets or payment apps, SurgePay isn&apos;t just
            built on top of a blockchain — it&apos;s built into it. That&apos;s
            what makes it faster, more secure, and far cheaper to use.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-[#014330] to-[#017755] mx-auto mb-12 lg:mb-16 rounded-full"></div>

        {/* Desktop Grid (hidden on mobile) */}
        <div className="hidden lg:grid grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 "
            >
              {/* Small Icon Image */}
              <div className="flex justify-start mb-6">
                <div className="relative">
                  <div className="absolute -inset-3  rounded-full blur-lg opacity-20"></div>
                  <Image
                    src={feature.image}
                    width={80}
                    height={80}
                    alt={feature.title}
                    className="relative z-10 w-20 h-20 object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel (hidden on desktop) */}
        <div className="lg:hidden relative max-w-4xl mx-auto mb-16">
          <div ref={carouselRef} className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={feature.id} className="w-full flex-shrink-0 px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 shadow-lg"
                  >
                    {/* Small Icon Image */}
                    <div className="flex justify-start mb-6">
                      <div className="relative">
                        <div className="absolute -inset-3 bg-gradient-to-r from-[#014330] to-[#017755] rounded-full blur-lg opacity-20"></div>
                        <Image
                          src={feature.image}
                          width={70}
                          height={70}
                          alt={feature.title}
                          className="relative z-10 w-16 h-16 object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? "bg-[#017755] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Early Access Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-black rounded-2xl p-4 md:p-8 lg:p-12"
        >
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-center">
              Early Access Rewards
            </h3>
            <p className="text-lg  mb-8 leading-relaxed  mx-auto lg:mx-0 text-center">
              Be among the first to shape the future of borderless payments.
            </p>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 space-y-6 gap-4 max-w-4xl mx-auto">
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${reward.checked
                      ? "bg-green-900 border-white text-white rounded-full"
                      : "bg-transparent border-white/50"
                      }`}
                  >
                    {reward.checked && (
                      <svg
                        className="w-4 h-4 text-[#fff] rounded-full"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${reward.checked}`}>
                    {reward.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
