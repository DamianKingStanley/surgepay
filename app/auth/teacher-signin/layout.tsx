import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Sign In - Classika",
  description:
    "Sign in to your Classika teacher account to access your dashboard, manage classes, and create assessments.",
};

export default function TeacherSigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
