import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Mirror } from "@/components/sections/Mirror";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Intelligence } from "@/components/sections/Intelligence";
import { Trophy } from "@/components/sections/Trophy";
import { Offer } from "@/components/sections/Offer";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="font-sans antialiased text-brand-text bg-brand-background">
      <Header />
      <Hero />
      <Mirror />
      <HowItWorks />
      <Intelligence />
      <Trophy />
      <Offer />
      <FAQ />
      <Footer />
    </div>
  );
}
