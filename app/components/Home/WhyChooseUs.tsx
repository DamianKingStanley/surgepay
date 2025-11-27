"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiZap, FiCreditCard, FiGlobe, FiShield } from "react-icons/fi";

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Real-Time, Low-Fee Transfers.",
      description:
        "No misdemean. No hidden charges. Your money moves on Stellar; instant, transparent, and secure.",
      image: "/images/home/feature-1.png", // Replace with your image
    },
    {
      icon: <FiCreditCard className="w-6 h-6" />,
      title: "One Platform For Payments, Remittance, And Spending.",
      description:
        "Send money, receive payments, or convert currencies from a single wallet.",
      image: "/images/home/feature-2.png", // Replace with your image
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: "Virtual Cards Built For The Global Economy.",
      description:
        "Create stablecoin-backed virtual cards and spend in any currency, anywhere. Perfect for freelancers, travelers, and digital businesses.",
      image: "/images/home/feature-3.png", // Replace with your image
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Powered By Blockchain, Made For Humans.",
      description:
        "Enjoy all the speed and transparency of Web3, wrapped in a simple, modern interface that feels familiar.",
      image: "/images/home/feature-4.png", // Replace with your image
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-6 items-start"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-[#00ff88] rounded-xl flex items-center justify-center text-gray-900">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature Image */}
                <div className="w-full max-w-xs">
                  <Image
                    src={feature.image}
                    width={300}
                    height={200}
                    alt={feature.title}
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alternative Layout - If you prefer side-by-side images and text */}
        {/* Uncomment this section if you want the images to be larger and side-by-side with text */}
        {/*
        <div className="space-y-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
            >
              {/* Image Side * /}
              <div className="lg:w-1/2">
                <div className="w-full max-w-md">
                  <Image
                    src={feature.image}
                    width={400}
                    height={300}
                    alt={feature.title}
                    className="w-full h-auto object-cover rounded-2xl shadow-xl"
                  />
                </div>
              </div>

              {/* Content Side * /}
              <div className="lg:w-1/2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#00ff88] rounded-xl flex items-center justify-center text-gray-900">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        */}
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#00ff88] rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00ff88] rounded-full opacity-5 blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </section>
  );
};

export default WhyChooseUs;
