"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

const BlogSection = () => {
    const blogPosts = [
        {
            category: "Relocating",
            title: "Why Cross-Border Freelancers Lose Money (And How to Avoid It)",
            author: "Sueh Thomas",
            date: "12 Feb 2025",
            readTime: "4 min read",
            image: "/images/blog/relocating.jpg",
        },
        {
            category: "Product update",
            title: "How to Send Money Home Without Paying Too Much",
            author: "Sueh Thomas",
            date: "12 Feb 2025",
            readTime: "4 min read",
            image: "/images/blog/product-update.jpg",
        },
        {
            category: "Life Across Borders",
            title: "Relocating? Here's the Cheapest Way to Move Your Money Across Borders",
            author: "Sueh Thomas",
            date: "12 Feb 2025",
            readTime: "4 min read",
            image: "/images/blog/life-across-borders.jpg",
        },
    ];

    const categories = [
        "All topics",
        "Product update",
        "Life Across Borders",
        "Relocating",
        "Travelling",
        "Working",
        "Investing",
    ];

    return (
        <section className="relative py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            <div className="container mx-auto px-6">
                {/* Header Section */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#00ff88]/10 to-[#00ff88]/5 border border-[#00ff88]/20 mb-6">
                            <span className="text-sm font-medium text-[#00ff88]">
                                From the SurgePay Blog
                            </span>
                        </div> */}

                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            From the SurgePay Blog
                        </h2>

                        <p className="text-xl text-gray-600 leading-relaxed">
                            Money tips, real-life stories, and global finance insights to help you live borderless
                        </p>
                    </motion.div>
                </div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${index === 0
                                ? "bg-black text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {blogPosts.map((post, index) => (
                        <motion.article
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800">
                                        {post.category}
                                    </span>
                                </div>
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#00ff88] transition-colors duration-300 line-clamp-2">
                                    {post.title}
                                </h3>

                                <div className="flex items-center gap-6 text-gray-600 text-sm mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{post.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/10 flex items-center justify-center">
                                        <span className="text-sm font-bold text-[#00ff88]">
                                            {post.author.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{post.author}</p>
                                        <p className="text-sm text-gray-500">Finance Expert</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Line */}
                            <div className="h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.article>
                    ))}
                </div>

                {/* View All Button */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <button className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-black to-gray-800 text-white font-medium text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                        View All Articles
                        <svg
                            className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </button>
                </motion.div> */}
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-20 left-0 w-72 h-72 bg-[#00ff88] rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#00ff88] rounded-full opacity-5 blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </section>
    );
};

export default BlogSection;