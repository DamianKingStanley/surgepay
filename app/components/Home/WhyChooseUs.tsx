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
              className={`relative p-8 rounded-2xl shadow-lg transition-all duration-500 ease-in-out ${
                hoveredIndex === index
                  ? `${feature.hoverBgColor} ${feature.hoverTextColor} shadow-2xl`
                  : `${feature.bgColor} ${feature.textColor}`
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex flex-col h-full">
                {/* Feature Image Container */}
                <div className="mb-6 relative">
                  {index === 1 && hoveredIndex === 1 ? (
                    // Second feature - Two cards swiping out
                    <div className="relative h-32">
                      <motion.div
                        initial={{ x: 0, rotate: 0 }}
                        animate={{ x: -20, rotate: -5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute left-0 top-0"
                      >
                        <Image
                          src={feature.image}
                          width={120}
                          height={80}
                          alt={feature.title}
                          className="w-30 h-20 object-contain"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ x: 0, rotate: 0 }}
                        animate={{ x: 20, rotate: 5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute right-0 top-0"
                      >
                        <Image
                          src={feature.image}
                          width={120}
                          height={80}
                          alt={feature.title}
                          className="w-30 h-20 object-contain opacity-80"
                        />
                      </motion.div>
                    </div>
                  ) : (
                    // Other features - Single image with different animations
                    <motion.div
                      animate={{
                        rotate:
                          (index === 0 && hoveredIndex === 0) ||
                          (index === 3 && hoveredIndex === 3)
                            ? [0, -3, 3, -2, 2, 0]
                            : 0,
                        scale:
                          (index === 0 && hoveredIndex === 0) ||
                          (index === 3 && hoveredIndex === 3)
                            ? 1.1
                            : index === 2 && hoveredIndex === 2
                              ? 1.3
                              : 1,
                      }}
                      transition={{
                        duration:
                          (index === 0 && hoveredIndex === 0) ||
                          (index === 3 && hoveredIndex === 3)
                            ? 0.6
                            : 0.4,
                        ease: "easeInOut",
                      }}
                      className="flex justify-center"
                    >
                      <Image
                        src={feature.image}
                        width={index === 2 && hoveredIndex === 2 ? 140 : 100}
                        height={index === 2 && hoveredIndex === 2 ? 112 : 80}
                        alt={feature.title}
                        className={`object-contain transition-all duration-500 ${
                          index === 2 && hoveredIndex === 2
                            ? "w-35 h-28"
                            : "w-25 h-20"
                        }`}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <motion.h3
                    animate={{
                      scale: hoveredIndex === index ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-xl font-bold mb-3 leading-tight"
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    animate={{
                      scale: hoveredIndex === index ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="leading-relaxed transition-colors duration-500"
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </div>

              {/* Background overlay for smooth transition */}
              <motion.div
                initial={false}
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 rounded-2xl ${
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
