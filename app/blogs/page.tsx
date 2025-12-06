"use client";

import BlogSection from "../components/Blog/BlogSection";
import BlogSectionThree from "../components/Blog/BlogSectionThree";
import BlogGridSection from "../components/Blog/BlogSectionTwo";



export default function BlogPage() {
    return (
        <main className="pt-10">
            <BlogSection />
            <BlogGridSection />
            <BlogSectionThree />

        </main>
    );
}
