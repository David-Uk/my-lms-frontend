'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-sm border-b border-gray-100 py-1' : 'bg-transparent py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How it Works', 'Testimonials'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm font-medium text-gray-600 hover:text-[var(--brand-primary)] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--brand-primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/5 text-[var(--brand-primary)] text-xs font-semibold mb-6 border border-[var(--brand-primary)]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
              Next-Gen Academic Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
              Innovating the Future of{' '}
              <span className="text-[var(--brand-primary)]">Learning</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              Edo Innovates LMS provides a comprehensive learning environment designed for Edo State&apos;s digital transformation. Empowering students and tutors with AI-driven pedagogical tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="px-10 h-12 text-base">
                  Enroll Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-10 h-12 text-base"
              >
                Explore Tour
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[var(--brand-secondary)]" />
                <span>State Accredited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[var(--brand-secondary)]" />
                <span>AI Integrated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[var(--brand-secondary)]" />
                <span>Career Focused</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
