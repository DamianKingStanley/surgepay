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
            image: "/images/home/surgecard1.png",
            // Added a secondary image for the swipe effect
            secondaryImage: "/images/home/surgecard2.png",
            bgColor: "bg-white",
            textColor: "text-gray-900",
            hoverBgColor: "bg-black",
            hoverTextColor: "text-white",
        },
        {
            title: "Virtual Cards Built For The Global Economy.",
            description:
                "Create stablecoin-backed virtual cards and spend in any currency, anywhere. Perfect for freelancers, travelers, and digital businesses.",
            image: "/images/home/phonemoney.jpg",
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
                            className={`relative p-10 rounded-3xl shadow-xl transition-all duration-500 ease-in-out min-h-[400px] flex flex-col ${hoveredIndex === index
                                ? `${feature.hoverBgColor} ${feature.hoverTextColor} shadow-2xl scale-105`
                                : `${feature.bgColor} ${feature.textColor}`
                                }`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                {/* Feature Image Container */}
                                <div
                                    className={`flex-1 relative ${index === 2
                                        ? " order-last mt-auto flex justify-end items-end"
                                        : "mt-auto"
                                        } `}
                                >
                                    {index === 0 ? (
                                        // FEATURE 1: Image at TOP and WIDER
                                        <motion.div
                                            className="absolute top-0 transform -translate-x-1/2 w-full flex justify-center"
                                            animate={{
                                                scale: hoveredIndex === 0 ? 1.2 : 1.1,
                                                y: hoveredIndex === 0 ? 10 : 0,
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                ease: "easeOut",
                                            }}
                                        >
                                            <Image
                                                src={feature.image}
                                                width={250}
                                                height={200}
                                                alt={feature.title}
                                                className="md:w-100 w-70 md:h-auto object-contain drop-shadow-2xl"
                                            />
                                        </motion.div>
                                    ) : index === 1 ? (
                                        // FEATURE 2: ATM Card at TOP and WIDER with swipe reveal effect

                                        <div className="absolute top-0 left-1/2 md:left-1/2 transform -translate-x-1/2 w-full">
                                            <motion.div
                                                className="relative mx-auto"
                                                animate={{
                                                    scale: hoveredIndex === 1 ? 1.25 : 1.1,
                                                    y: hoveredIndex === 1 ? 5 : 0,
                                                }}
                                                transition={{
                                                    duration: 0.6,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                {/* Main Card */}
                                                <motion.div
                                                    animate={{
                                                        x: hoveredIndex === 1 ? -20 : 0,
                                                        rotate: hoveredIndex === 1 ? -5 : 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        ease: "easeOut",
                                                    }}
                                                    className="z-20 relative"
                                                >
                                                    <Image
                                                        src={feature.image}
                                                        width={400}
                                                        height={200}
                                                        alt={feature.title}
                                                        className="w-100 h-auto object-contain drop-shadow-2xl"
                                                    />
                                                </motion.div>

                                                {/* Secondary Card - Swipes out from behind */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: 0, scale: 0.9 }}
                                                    animate={{
                                                        opacity: hoveredIndex === 1 ? 1 : 0,
                                                        x: hoveredIndex === 1 ? 80 : 0,
                                                        rotate: hoveredIndex === 1 ? 8 : 0,
                                                        scale: hoveredIndex === 1 ? 1.1 : 0.9,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        ease: "easeOut",
                                                        delay: hoveredIndex === 1 ? 0.2 : 0,
                                                    }}
                                                    className="absolute top-0 z-10"
                                                >
                                                    <Image
                                                        src={feature.secondaryImage || feature.image}
                                                        width={400}
                                                        height={200}
                                                        alt={feature.title}
                                                        className="w-100 h-auto object-contain drop-shadow-2xl opacity-90"
                                                    />
                                                </motion.div>
                                            </motion.div>
                                        </div>

                                    ) : index === 2 ? (
                                        <motion.div
                                            className=" bottom-0 right-0"
                                            style={{ transformOrigin: "bottom right" }}
                                            initial={{ scale: 1 }}
                                            animate={{
                                                scale: hoveredIndex === 2 ? 2 : 1,
                                                x: hoveredIndex === 2 ? -0 : 0, // move left slightly if needed
                                                y: hoveredIndex === 2 ? -0 : 0, // move up slightly if needed
                                            }}
                                            transition={{
                                                duration: 0.7,
                                                ease: "easeOut",
                                            }}
                                        >
                                            <Image
                                                src={feature.image}
                                                width={120}
                                                height={90}
                                                alt={feature.title}
                                                className="w-30 h-22 object-contain drop-shadow-2xl"
                                            />
                                        </motion.div>

                                    ) : index === 3 ? (
                                        // FEATURE 4: Image at TOP and SMALLER
                                        <motion.div
                                            className="absolute top-2 left-1/3 transform -translate-x-1/2"
                                            animate={{
                                                scale: hoveredIndex === 3 ? 1.4 : 1,
                                                y: hoveredIndex === 3 ? 5 : 0,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: "easeOut",
                                            }}
                                        >
                                            <Image
                                                src={feature.image}
                                                width={100}
                                                height={80}
                                                alt={feature.title}
                                                className="w-35 h-21 object-contain drop-shadow-xl"
                                            />
                                        </motion.div>
                                    ) : index === 3 ? (
                                        // FEATURE 4: Image at TOP and SMALLER
                                        <motion.div
                                            className="absolute top-2 left-1/3 transform -translate-x-1/2"
                                            animate={{
                                                scale: hoveredIndex === 3 ? 1.4 : 1,
                                                y: hoveredIndex === 3 ? 5 : 0,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: "easeOut",
                                            }}
                                        >
                                            <Image
                                                src={feature.image}
                                                width={100}
                                                height={80}
                                                alt={feature.title}
                                                className="w-35 h-21 object-contain drop-shadow-xl"
                                            />
                                        </motion.div>
                                    ) : (
                                        // Default fallback
                                        <div className="flex justify-center items-center">
                                            <Image
                                                src={feature.image}
                                                width={120}
                                                height={85}
                                                alt={feature.title}
                                                className="w-35 h-20 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* Text Content */}
                                <div className="flex-1 gap-2 ">
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
                                </div>


                            </div>

                            {/* Background overlay for smooth transition */}
                            <motion.div
                                initial={false}
                                animate={{
                                    opacity: hoveredIndex === index ? 1 : 0,
                                }}
                                transition={{ duration: 0.5 }}
                                className={`absolute inset-0 rounded-3xl ${index === 1
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