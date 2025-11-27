"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Define routes where you want to hide the entire layout
  const noLayoutRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/admin",
    "/reset-password",
    "/auth/forgot-password",
    "/auth/onboarding",
    "/auth/verify-email",
    "/dashboard",
    "/auth/teacher-signin",
    "/teacher/dashboard",
    "/quiz/",
    "/payment/callback",
  ];

  // Define routes where you only want to hide the footer
  const noFooterRoutes = ["/updateprofile", "/[usernameOrId]"];

  // Hide footer for dynamic user profile pages like /MimiGold or /john123

  const hideLayout = noLayoutRoutes.some((path) => pathname.startsWith(path));
  const hideFooter =
    noFooterRoutes.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/contents/") ||
    hideLayout;

  return (
    <>
      {!hideLayout && <Navbar />}
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}
