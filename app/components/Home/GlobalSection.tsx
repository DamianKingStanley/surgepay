"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const GlobalSection = () => {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Title & Description at Top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Built For Global Citizens
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            Whether you&apos;re sending money home, running an online business,
            or paying across borders, SurgePay is designed just for you.
          </p>
        </motion.div>

        <div className="flex flex-col items-center justify-between gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Map Image as regular image */}
              <div className="w-full overflow-hidden">
                <Image
                  src="/images/home/map.png"
                  width={1000}
                  height={700}
                  alt="Global coverage map"
                  className="w-full h-auto object-fill"
                />
              </div>

              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#00ff88] rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#00ff88] rounded-full opacity-10 blur-xl"></div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {/* Features List */}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl gap-8">
                {/* Currencies */}
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-[#00ff88] mb-2">
                    10+
                  </div>
                  <div className="text-gray-600">
                    african & foreign currencies supported.
                  </div>
                </div>

                {/* Countries */}
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-gray-400 mb-2">
                    5+
                  </div>
                  <div className="text-gray-600">
                    active african & international countries covered (with more
                    coming soon).
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#00ff88] rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00ff88] rounded-full opacity-5 blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </section>
  );
};

export default GlobalSection;
