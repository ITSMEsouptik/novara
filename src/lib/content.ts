import homeContent from "../../content/home.json";

// Type definitions for home page content
export interface HeroContent {
  headline: string;
  headlineHighlight: string;
  headlineSecondary: string;
  subheadline: string;
  inputPlaceholder: string;
  ctaButtonText: string;
  secondaryButtonText: string;
}

export interface MirrorCard {
  title: string;
  text: string;
}

export interface MirrorContent {
  title: string;
  cards: MirrorCard[];
  closingStatement: string;
}

export interface HowItWorksStep {
  iconName: "eye" | "lightning" | "box";
  title: string;
  text: string;
}

export interface HowItWorksContent {
  title: string;
  steps: HowItWorksStep[];
}

export interface IntelligencePillar {
  iconName: "search" | "target" | "brain";
  title: string;
  text: string;
}

export interface IntelligenceContent {
  title: string;
  subtitle: string;
  pillars: IntelligencePillar[];
}

export interface MediaItem {
  url: string;
  type: "image" | "video";
  title: string;
}

export interface VideoType {
  title: string;
  subtitle: string;
}

export interface TrophyContent {
  title: string;
  subtitle: string;
  videoTypes: VideoType[];
  guarantee: {
    title: string;
    text: string;
  };
  galleryRow1: MediaItem[];
  galleryRow2: MediaItem[];
  galleryRow3: MediaItem[];
}

export interface OfferContent {
  title: string;
  packageName: string;
  packageSubtitle: string;
  price: string;
  priceNote: string;
  features: string[];
  ctaButtonText: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContent {
  title: string;
  items: FAQItem[];
}

export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterContent {
  copyright: string;
  description: string;
  links: FooterLink[];
}

export interface HomePageContent {
  hero: HeroContent;
  mirror: MirrorContent;
  howItWorks: HowItWorksContent;
  intelligence: IntelligenceContent;
  trophy: TrophyContent;
  offer: OfferContent;
  faq: FAQContent;
  footer: FooterContent;
}

// Get the home page content
export function getHomeContent(): HomePageContent {
  return homeContent as HomePageContent;
}

// Individual section getters for more granular imports
export function getHeroContent(): HeroContent {
  return homeContent.hero as HeroContent;
}

export function getMirrorContent(): MirrorContent {
  return homeContent.mirror as MirrorContent;
}

export function getHowItWorksContent(): HowItWorksContent {
  return homeContent.howItWorks as HowItWorksContent;
}

export function getIntelligenceContent(): IntelligenceContent {
  return homeContent.intelligence as IntelligenceContent;
}

export function getTrophyContent(): TrophyContent {
  return homeContent.trophy as TrophyContent;
}

export function getOfferContent(): OfferContent {
  return homeContent.offer as OfferContent;
}

export function getFAQContent(): FAQContent {
  return homeContent.faq as FAQContent;
}

export function getFooterContent(): FooterContent {
  return homeContent.footer as FooterContent;
}
