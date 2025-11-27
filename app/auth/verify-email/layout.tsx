import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Your Email - Classika",
  description:
    "Verify your email address to complete your Classeek account setup and start managing your school digitally.",
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
