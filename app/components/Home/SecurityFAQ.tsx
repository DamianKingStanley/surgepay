"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const SecurityFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Are there hidden fees for cross-border?",
      answer:
        "No, we believe in complete transparency. All fees are clearly displayed before you confirm any transaction. There are no hidden charges for cross-border payments.",
    },
    {
      question: "Can I send money to people in other countries?",
      answer:
        "Yes, you can send money to over 50 countries worldwide. Our platform supports instant transfers to most destinations with competitive exchange rates.",
    },
    {
      question: "Which currencies do virtual cards support?",
      answer:
        "Our virtual cards support multiple currencies including USD, EUR, GBP, and major African currencies. You can create cards in different currencies based on your needs.",
    },
    {
      question: "Is my money safe with SurgePay?",
      answer:
        "Absolutely. We use bank-level security including 256-bit encryption, two-factor authentication, and regular security audits. Your funds are protected by enterprise-grade security measures.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="w-full max-w-md lg:max-w-lg">
                <Image
                  src="/images/home/security.png"
                  width={500}
                  height={400}
                  alt="Security Illustration"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
            </motion.div>

            {/* Right Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Your Security Comes First
              </h2>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                From encryption to identity verification, SurgePay is
                <br />
                built on enterprise-grade security standards to
                <br />
                protect your money.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed">
                We&apos;re compliant with international regulations and
                <br />
                financial partners to ensure every transaction is safe.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Multi-Currency Digital Wallets
            </h3>
            <p className="text-lg text-gray-600">
              Get answers to common questions about our security and services
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between focus:outline-none"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {openIndex === index ? (
                      <FiChevronUp className="w-5 h-5 text-[#00ff88]" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="w-12 h-1 bg-[#00ff88] rounded-full mb-4"></div>
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-[#00ff88] rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-[#00ff88] rounded-full opacity-5 blur-3xl"></div>
    </section>
  );
};

export default SecurityFAQ;
