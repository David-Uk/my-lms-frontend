import dynamic from 'next/dynamic';

const HeroSection = dynamic(
  () => import('./_sections/hero-section').then(m => ({ default: m.HeroSection })),
  { loading: () => <div className="min-h-screen bg-[#F8F9FA]" /> }
);

const StatsSection = dynamic(
  () => import('./_sections/stats-section').then(m => ({ default: m.StatsSection })),
  { loading: () => <div className="h-48 bg-white animate-pulse" /> }
);

const FeaturesSection = dynamic(
  () => import('./_sections/features-section').then(m => ({ default: m.FeaturesSection })),
  { loading: () => <div className="h-96 bg-white animate-pulse" /> }
);

const HowItWorksSection = dynamic(
  () => import('./_sections/how-it-works-section').then(m => ({ default: m.HowItWorksSection })),
  { loading: () => <div className="h-96 bg-gray-50 animate-pulse" /> }
);

const TestimonialsSection = dynamic(
  () => import('./_sections/testimonials-section').then(m => ({ default: m.TestimonialsSection })),
  { loading: () => <div className="h-96 bg-white animate-pulse" /> }
);

const CTASection = dynamic(
  () => import('./_sections/cta-section').then(m => ({ default: m.CTASection })),
  { loading: () => <div className="h-96 bg-white animate-pulse" /> }
);

const FooterSection = dynamic(
  () => import('./_sections/footer-section').then(m => ({ default: m.FooterSection })),
  { loading: () => <div className="h-64 bg-[#001D0B] animate-pulse" /> }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-roboto">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
