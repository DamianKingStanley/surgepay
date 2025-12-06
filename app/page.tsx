"use client";

import AnyTimePayment from "./components/Home/AnyTimePayment";
import CurrencyRate from "./components/Home/CurrencyRate";
import FeaturesCarousel from "./components/Home/FeaturesCarousel";
import Global from "./components/Home/GlobalAcceptance";
import GlobalSection from "./components/Home/GlobalSection";
import HeroSection from "./components/Home/HeroSection";
import SecurityFAQ from "./components/Home/SecurityFAQ";
import WhyChooseUs from "./components/Home/WhyChooseUs";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <GlobalSection />
      <div id="products">
        <AnyTimePayment />


      </div>
      <div id="features">
        <WhyChooseUs />

      </div>
      <CurrencyRate />
      <Global />
      <FeaturesCarousel />
      <div id="faq">
        <SecurityFAQ />


      </div>
    </main>
  );
}
