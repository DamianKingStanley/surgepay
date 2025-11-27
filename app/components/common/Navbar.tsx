"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);

  const navItems = [
    { name: "Products", href: "/products" },
    { name: "Features", href: "/features" },
    { name: "FAQ", href: "/faq" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      ref={navbarRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`fixed  left-5 md:left-36 top-5 -translate-x-1/2 z-50 
    w-[90%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[80%]
    backdrop-blur-lg transition-all duration-300 rounded-2xl 
    ${
      scrolled
        ? "bg-white/95 text-black shadow-xl border border-gray-200"
        : "bg-[#33A786] text-white shadow-lg border border-gray-100"
    }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center flex-1"
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/images/surgelogo.svg"
                width={120}
                height={40}
                alt="SurgePay"
                className="h-8 w-auto"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className=" hover:text-[#00ff88] transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Download App Button - Right */}
          <div className="hidden lg:flex items-center justify-end flex-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#C1AB28] text-white px-6 py-2.5 rounded-3xl font-bold hover:bg-[#6c5c02] transition-all duration-300 shadow-lg"
            >
              Download App
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-4">
            {/* Download App Button - Mobile */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-[#C1AB28] text-white px-6 py-2.5 rounded-3xl font-bold hover:bg-[#6c5c02] transition-all duration-300 shadow-lg text-sm"
            >
              Download
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg focus:outline-none text-gray-300 hover:text-[#00ff88]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-gray-800 border-t border-gray-700 rounded-b-2xl"
          >
            <div className="px-6 pb-6 pt-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-4 text-gray-300 hover:text-[#00ff88] transition-colors duration-200 font-medium border-b border-gray-700 last:border-0"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Download Button Full Width */}
              {/* <div className="pt-4">
                <button className="w-full bg-[#00ff88] text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-[#00e579] transition-all duration-300 shadow-lg">
                  Download App
                </button>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
