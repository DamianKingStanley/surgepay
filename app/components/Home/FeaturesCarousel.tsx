/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

const FeaturesSection: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const features = [
    {
      id: 1,
      title: "Multi-Currency Wallets",
      description: "Deep integration with the Stellar blockchain; fast, reliable, and transparent.",
      image: "/images/home/wallets.png",
    },
    {
      id: 2,
      title: "Instant P2P Transfers",
      description: "Backed by Stablecoins, giving you stability of fiat with efficiency of crypto.",
      image: "/images/home/p2p.png",
    },
    {
      id: 3,
      title: "Virtual Borderless Cards",
      description: "Spend online/offline worldwide with low forex fees, funded by local currency or digital dollars.",
      image: "/images/home/greencard.png",
    },
    {
      id: 4,
      title: "AI-Powered Security.",
      description: "Advanced fraud detection and compliance with bank-level security for all transactions.",
      image: "/images/home/shields.png",
    },
    {
      id: 5,
      title: "Business Solutions",
      description: "Prepaid and business credit cards, global payroll, and invoicing tools for enterprises.",
      image: "/images/home/business.png",
    },
    {
      id: 6,
      title: "International Remittances",
      description: "Low-cost cross-border transfers with integration to 20+ Nigerian banks and mobile money.",
      image: "/images/home/Currencyexchanges.png",
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

  const nextDesktop = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 3;
      if (nextIndex >= features.length) {
        return 0;
      }
      if (features.length - nextIndex < 3 && features.length % 3 !== 0) {
        return features.length - 3;
      }
      return nextIndex;
    });
  };

  const prevDesktop = () => {
    setCurrentIndex((prev) => {
      const prevIndex = prev - 3;
      if (prevIndex < 0) {
        const lastCompleteSet = features.length - (features.length % 3 || 3);
        return Math.max(0, lastCompleteSet);
      }
      return prevIndex;
    });
  };

  const nextMobile = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, [features.length]);

  const prevMobile = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  }, [features.length]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragDistance(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = dragStartX - clientX;
    setDragDistance(distance);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const threshold = 50;

    if (dragDistance > threshold) {
      nextMobile();
    } else if (dragDistance < -threshold) {
      prevMobile();
    }

    setDragDistance(0);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextMobile();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextMobile]);

  const desktopTranslateX = -Math.min(currentIndex, features.length - 3) * (100 / 3);

  const scrollToFeature = (index: number) => {
    if (window.innerWidth >= 1024) {
      const desktopIndex = Math.floor(index / 3) * 3;
      setCurrentIndex(Math.min(desktopIndex, features.length - 3));
    } else {
      setCurrentIndex(index);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-6">
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

        <div className="w-24 h-1 bg-gradient-to-r from-[#014330] to-[#017755] mx-auto mb-12 lg:mb-16 rounded-full"></div>

        <div className="hidden lg:block mb-16">
          <div className="flex items-center justify-center relative">
            <button
              onClick={prevDesktop}
              className="absolute left-0 z-10 w-10 h-10 bg-white/90 border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 -translate-x-4"
              aria-label="Previous features"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-[calc(100%-80px)] overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(${desktopTranslateX}%)` }}
              >
                {features.map((feature, index) => (
                  <div key={feature.id} className="w-1/3 px-4 flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                    >
                      <div className="flex justify-start mb-6">
                        <div className="relative">
                          <div className="absolute -inset-3 rounded-full blur-lg opacity-20"></div>
                          <Image
                            src={feature.image}
                            width={80}
                            height={80}
                            alt={feature.title}
                            className="relative z-10 w-20 h-20 object-contain"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextDesktop}
              className="absolute right-0 z-10 w-10 h-10 bg-white/90 border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 translate-x-4"
              aria-label="Next features"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center items-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(features.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToFeature(index * 3)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index * 3 ? 'bg-[#014330] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Go to features set ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="lg:hidden relative max-w-4xl mx-auto mb-16">
          <div
            ref={carouselRef}
            className="overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% + ${dragDistance * 0.5}px))`,
                transition: isDragging ? 'none' : 'transform 300ms ease-out'
              }}
            >
              {features.map((feature, index) => (
                <div key={feature.id} className="w-full flex-shrink-0 px-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 shadow-lg h-full"
                  >
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Arrows */}
          <button
            onClick={prevMobile}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
            aria-label="Previous feature"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextMobile}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
            aria-label="Next feature"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-[#014330] w-4' : 'bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Early Access Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-black rounded-2xl p-4 md:p-8 lg:p-12"
        >
          <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-center">Early Access Rewards</h3>
          <p className="text-lg mb-8 leading-relaxed mx-auto lg:mx-0 text-center">
            Be among the first to shape the future of borderless payments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 space-y-6 gap-4 max-w-4xl mx-auto">
            {rewards.map((reward, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${reward.checked
                    ? "bg-green-900 border-white text-white"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{reward.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;