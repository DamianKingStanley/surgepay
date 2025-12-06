"use client";

import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

const BlogSectionThree = () => {
    const posts = [
        {
            title: "Sending Money Home Every Month Real Stories From Our Users",
            author: "Sade Thomas",
            date: "12 Feb 2025",
            readTime: "4mins read",
            image: "/images/blog/sending-money.jpg",
        },
        {
            title: "5 Online Scams Everyone Falls For and How to Avoid Them",
            author: "Sade Thomas",
            date: "12 Feb 2025",
            readTime: "4mins read",
            image: "/images/blog/online-scams.jpg",
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">

                {/* TOP DIVIDER */}
                <div className="border-t border-gray-300 mb-12"></div>

                {/* GRID LAYOUT (EXACT LIKE SCREENSHOT) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                    {/* TOP LEFT IMAGE */}
                    <div className="relative w-full h-[350px] md:h-[380px] overflow-hidden">
                        <Image
                            src={posts[0].image}
                            alt={posts[0].title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* TOP RIGHT TEXT */}
                    <div className="flex flex-col justify-center px-10 py-12 bg-[#f8fafb]">
                        <h3 className="text-2xl font-semibold text-gray-900 max-w-sm leading-snug">
                            {posts[0].title}
                        </h3>

                        <p className="mt-4 text-gray-700">{posts[0].author}</p>

                        <div className="flex items-center gap-6 text-gray-600 text-sm mt-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {posts[0].date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {posts[0].readTime}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM LEFT TEXT */}
                    <div className="flex flex-col justify-center px-10 py-12 bg-[#f8fafb]">
                        <h3 className="text-2xl font-semibold text-gray-900 max-w-sm leading-snug">
                            {posts[1].title}
                        </h3>

                        <p className="mt-4 text-gray-700">{posts[1].author}</p>

                        <div className="flex items-center gap-6 text-gray-600 text-sm mt-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {posts[1].date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {posts[1].readTime}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM RIGHT IMAGE */}
                    <div className="relative w-full h-[350px] md:h-[380px] overflow-hidden">
                        <Image
                            src={posts[1].image}
                            alt={posts[1].title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                </div>

            </div>
        </section>
    );
};

export default BlogSectionThree;
