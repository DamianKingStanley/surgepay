import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your School Setup - Classika",
  description:
    "Finish setting up your Classika school account and start managing your educational institution digitally.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
