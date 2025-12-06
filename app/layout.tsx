import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import PageLayout from "./components/common/PageLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SurgePay – Fast, Low-Fee Global Payments & Virtual Cards",
  description:
    "Experience fast, low-fee global payments and virtual cards powered by blockchain. Send money across borders, receive payments, and spend anywhere with SurgePay.",
  keywords: [
    "SurgePay",
    "global payments",
    "cross-border payments",
    "virtual cards",
    "blockchain payments",
    "money transfer",
    "remittance",
    "digital wallet",
    "fintech",
    "crypto payments",
    "stablecoin",
    "international payments",
    "low fee transfers",
    "digital banking",
    "financial technology",
    "borderless payments",
  ],
  authors: [{ name: "SurgePay Team", url: "https://surgepay.com/" }],
  creator: "SurgePay",
  publisher: "SurgePay Technologies",
  openGraph: {
    title: "SurgePay – Fast, Low-Fee Global Payments & Virtual Cards",
    description:
      "Send money and receive money across borders within seconds. Experience fast, low-fee global payments powered by blockchain technology.",
    url: "https://surgepay.com",
    siteName: "SurgePay",
    images: [
      {
        url: "/images/og-surgepay.jpg",
        width: 1200,
        height: 630,
        alt: "SurgePay – Fast, Low-Fee Global Payments & Virtual Cards",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SurgePay – Global Payments Made Simple",
    description:
      "Whether you're sending money home, running an online business, or paying across borders, SurgePay is designed just for you.",
    images: ["/images/og-surgepay.jpg"],
    creator: "@SurgePay_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "../public/favicon.ico",
    shortcut: "../public/favicon-16x16.png",
    apple: "../public/apple-touch-icon.png",
  },
  manifest: "../public/site.webmanifest",
  // verification: {
  //   google: "your-google-verification-code",
  // },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-white text-black`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PageLayout>{children}</PageLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
