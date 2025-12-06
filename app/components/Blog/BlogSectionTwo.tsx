"use client";

import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

const BlogGridSection = () => {
    const posts = [
        {
            title: "Traveling Soon? These Money Tips can save You Stress",
            author: "Sade Thomas",
            date: "12 Feb 2025",
            readTime: "4 mins read",
            image: "/images/blog/travel-tips.jpg",
        },
        {
            title: "Relocating? Here's the Cheapest Way to Move Your Money Across Borders",
            author: "Sade Thomas",
            date: "12 Feb 2025",
            readTime: "4 mins read",
            image: "/images/blog/relocating-money.jpg",
        },
        {
            title: "The Real Cost of Being an International Student – and How to Manage It",
            author: "Sade Thomas",
            date: "12 Feb 2025",
            readTime: "4 mins read",
            image: "/images/blog/international-student.jpg",
        },
        {
            title: "My First Time Using a Virtual Card – What I Learnt",
            author: "Sade Thomas",
            date: "12 Feb 2025",
            readTime: "4 mins read",
            image: "/images/blog/virtual-card.jpg",
        },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">

                {/* TOP DIVIDER */}
                <div className="border-t border-gray-300 mb-16"></div>

                {/* FIRST ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-16">
                    {posts.slice(0, 2).map((post, i) => (
                        <div key={i} className="space-y-5">

                            {/* BIGGER IMAGE */}
                            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-200">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* TITLE */}
                            <h3 className="text-2xl font-semibold leading-snug hover:text-green-600 transition">
                                {post.title}
                            </h3>

                            {/* AUTHOR */}
                            <p className="text-gray-700">{post.author}</p>

                            {/* META */}
                            <div className="flex items-center gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* MIDDLE DIVIDER (THIS IS THE ONE YOU WANT VISIBLE) */}
                <div className="border-t border-gray-300 mb-16"></div>

                {/* SECOND ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    {posts.slice(2, 4).map((post, i) => (
                        <div key={i} className="space-y-5">

                            {/* BIGGER IMAGE */}
                            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-200">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* TITLE */}
                            <h3 className="text-2xl font-semibold leading-snug hover:text-green-600 transition">
                                {post.title}
                            </h3>

                            {/* AUTHOR */}
                            <p className="text-gray-700">{post.author}</p>

                            {/* META */}
                            <div className="flex items-center gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* BOTTOM DIVIDER */}
                <div className="border-t border-gray-300 mt-16"></div>

            </div>
        </section>
    );
};

export default BlogGridSection;
