"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const WhyChooseUs = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      title: "Real-Time, Low-Fee Transfers.",
      description:
        "No misdemean. No hidden charges. Your money moves on Stellar; instant, transparent, and secure.",
      image: "/images/home/feature-1.png",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hoverBgColor: "bg-white",
      hoverTextColor: "text-gray-900",
    },
    {
      title: "One Platform For Payments, Remittance, And Spending.",
      description:
        "Send money, receive payments, or convert currencies from a single wallet.",
      image: "/images/home/feature-2.png",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hoverBgColor: "bg-black",
      hoverTextColor: "text-white",
    },
    {
      title: "Virtual Cards Built For The Global Economy.",
      description:
        "Create stablecoin-backed virtual cards and spend in any currency, anywhere. Perfect for freelancers, travelers, and digital businesses.",
      image: "/images/home/feature-3.png",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hoverBgColor: "bg-gradient-to-br from-[#014330] to-[#017755]",
      hoverTextColor: "text-white",
    },
    {
      title: "Powered By Blockchain, Made For Humans.",
      description:
        "Enjoy all the speed and transparency of Web3, wrapped in a simple, modern interface that feels familiar.",
      image: "/images/home/feature-4.png",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hoverBgColor: "bg-[#A57000]",
      hoverTextColor: "text-white",
    },
  ];

  return (
    <section className="relative py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Here&apos;s Why You Should Choose Us
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Whether you&apos;re sending money home, running an online business,
            or paying across borders, SurgePay is designed just for you.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-10 rounded-3xl shadow-xl transition-all duration-500 ease-in-out min-h-[400px] flex flex-col ${
                hoveredIndex === index
                  ? `${feature.hoverBgColor} ${feature.hoverTextColor} shadow-2xl scale-105`
                  : `${feature.bgColor} ${feature.textColor}`
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Content */}
              <div className="flex-1 flex flex-col">
                <motion.h3
                  animate={{
                    scale: hoveredIndex === index ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold mb-4 leading-tight"
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  animate={{
                    scale: hoveredIndex === index ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-lg leading-relaxed transition-colors duration-500 mb-6"
                >
                  {feature.description}
                </motion.p>

                {/* Feature Image Container */}
                <div className="flex-1 relative mt-auto">
                  {index === 1 && hoveredIndex === 1 ? (
                    // Second feature - Two cards swiping out smoothly
                    <div className="relative h-40">
                      <motion.div
                        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
                        animate={{
                          x: -40,
                          y: -10,
                          rotate: -15,
                          scale: 1.1,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 100,
                        }}
                        className="absolute left-0 top-0 z-20"
                      >
                        <Image
                          src={feature.image}
                          width={160}
                          height={120}
                          alt={feature.title}
                          className="w-40 h-30 object-contain drop-shadow-2xl"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
                        animate={{
                          x: 40,
                          y: 10,
                          rotate: 12,
                          scale: 0.9,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 100,
                        }}
                        className="absolute right-0 top-0 z-10"
                      >
                        <Image
                          src={feature.image}
                          width={160}
                          height={120}
                          alt={feature.title}
                          className="w-40 h-30 object-contain drop-shadow-2xl opacity-90"
                        />
                      </motion.div>
                    </div>
                  ) : index === 2 ? (
                    // Third feature - Image positioned at bottom right and grows
                    <motion.div
                      animate={{
                        scale: hoveredIndex === 2 ? 1.8 : 1,
                        x: hoveredIndex === 2 ? 20 : 0,
                        y: hoveredIndex === 2 ? 20 : 0,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      className="absolute bottom-4 right-4"
                    >
                      <Image
                        src={feature.image}
                        width={120}
                        height={90}
                        alt={feature.title}
                        className="w-30 h-22 object-contain drop-shadow-xl"
                      />
                    </motion.div>
                  ) : index === 0 ? (
                    // First feature - Larger image with swirl tilt
                    <motion.div
                      animate={{
                        rotate: hoveredIndex === 0 ? [0, -10, 5, -5, 2, 0] : 0,
                        scale: hoveredIndex === 0 ? 1.4 : 1.2,
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      }}
                      className="flex justify-center items-center"
                    >
                      <Image
                        src={feature.image}
                        width={200}
                        height={150}
                        alt={feature.title}
                        className="w-50 h-38 object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  ) : index === 3 ? (
                    // Fourth feature - Tilt animation
                    <motion.div
                      animate={{
                        rotate: hoveredIndex === 3 ? [0, -8, 6, -4, 0] : 0,
                        scale: hoveredIndex === 3 ? 1.3 : 1.1,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                      }}
                      className="flex justify-center items-center"
                    >
                      <Image
                        src={feature.image}
                        width={160}
                        height={120}
                        alt={feature.title}
                        className="w-40 h-30 object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  ) : (
                    // Default state for other features
                    <div className="flex justify-center items-center">
                      <Image
                        src={feature.image}
                        width={140}
                        height={105}
                        alt={feature.title}
                        className="w-35 h-26 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Background overlay for smooth transition */}
              <motion.div
                initial={false}
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 rounded-3xl ${
                  index === 1
                    ? "bg-black"
                    : index === 2
                      ? "bg-gradient-to-br from-[#014330] to-[#017755]"
                      : index === 3
                        ? "bg-[#A57000]"
                        : "bg-white"
                } -z-10`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#00ff88] rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00ff88] rounded-full opacity-5 blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </section>
  );
};

export default WhyChooseUs;
