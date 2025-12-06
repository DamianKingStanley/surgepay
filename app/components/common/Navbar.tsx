"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const router = useRouter();

  const navItems = [
    { name: "Products", href: "#products" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" },
    { name: "Blogs", href: "/blogs" },
  ];

  const NAVBAR_OFFSET = 90;

  const scrollToHash = (hash: string) => {
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!id) return;

    let attempts = 0;
    const maxAttempts = 20;
    const attemptDelay = 100;

    const tryScroll = () => {
      attempts += 1;
      const element = document.getElementById(id) || document.querySelector(`#${id}`);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(tryScroll, attemptDelay);
      } else {
        const fallbackEl = document.querySelector(hash);
        if (fallbackEl) {
          const top = (fallbackEl as Element).getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    };

    tryScroll();
  };

  const handleNavigation = (href: string) => {
    setIsOpen(false);

    if (href.startsWith("#")) {
      const target = `/${href}`;

      const currentPath = window.location.pathname + window.location.hash;
      if (currentPath === target) {
        scrollToHash(href);
        return;
      }
      router.push(target);

      setTimeout(() => scrollToHash(href), 120);

      const onHashChange = () => {
        scrollToHash(href);
        window.removeEventListener("hashchange", onHashChange);
      };
      window.addEventListener("hashchange", onHashChange);

    } else {
      router.push(href);
    }
  };



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
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

  // Close menu when clicking ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  return (
    <motion.nav
      ref={navbarRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`fixed left-5 md:left-36 top-5 -translate-x-1/2 z-50 
        w-[90%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[80%]
        backdrop-blur-lg transition-all duration-300 rounded-2xl 
        ${scrolled
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
            <button
              onClick={() => {
                router.push("/");
                setIsOpen(false);
              }}
              className="flex items-center cursor-pointer"
            >
              <Image
                src="/images/surgelogo.svg"
                width={120}
                height={40}
                alt="SurgePay"
                className="h-8 w-auto"
              />
            </button>
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="hover:text-[#00ff88] transition-colors duration-200 font-medium cursor-pointer"
                >
                  {item.name}
                </button>
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
              className={`p-2 rounded-lg focus:outline-none ${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#00ff88]`}
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
            className={`lg:hidden overflow-hidden border-t ${scrolled
              ? 'bg-white/95 text-black border-gray-200'
              : 'bg-[#33A786] text-white border-gray-100'
              } rounded-b-2xl backdrop-blur-lg`}
          >
            <div className="px-6 pb-6 pt-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`block w-full text-left py-4 transition-colors duration-200 font-medium border-b ${scrolled
                    ? 'border-gray-200 hover:text-[#00ff88] text-gray-800'
                    : 'border-gray-100 hover:text-[#00ff88]/90 text-white'
                    } last:border-0`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;