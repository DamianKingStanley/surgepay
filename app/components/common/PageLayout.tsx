"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
