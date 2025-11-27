import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Classika",
  description:
    "Reset your Classika account password and regain access to your school management platform.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
