import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Mirror } from "@/components/sections/Mirror";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Intelligence } from "@/components/sections/Intelligence";
import { Trophy } from "@/components/sections/Trophy";
import { Offer } from "@/components/sections/Offer";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";
import { getHomeContent } from "@/lib/content";

export default function Home() {
  const content = getHomeContent();

  return (
    <div className="font-sans antialiased text-brand-text bg-brand-background">
      <Header />
      <Hero content={content.hero} />
      <Mirror content={content.mirror} />
      <HowItWorks content={content.howItWorks} />
      <Intelligence content={content.intelligence} />
      <Trophy content={content.trophy} />
      <Offer content={content.offer} />
      <FAQ content={content.faq} />
      <Footer content={content.footer} />
    </div>
  );
}
