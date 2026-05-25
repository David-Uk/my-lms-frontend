'use client';

import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  Brain,
  ArrowRight,
  CheckCircle,
  Play,
  Star,
  Menu,
  X,
  Zap,
  Shield,
  Globe,
  Clock
} from 'lucide-react';
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
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {['Features', 'How it Works', 'Testimonials', 'Pricing'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm font-bold text-gray-500 hover:text-[#004D20] transition-all duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00A651] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-gray-700 hover:text-[#004D20]">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#004D20] hover:bg-black text-white px-8 h-12 rounded-xl font-black shadow-xl shadow-green-900/20 transition-all duration-300 active:scale-95">
                  Get Started Free
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[#F8F9FA]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#004D20 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00A651]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#004D20]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-[#00A651]/10 text-[#004D20] text-xs font-black uppercase tracking-widest">
                <Zap className="h-4 w-4 fill-[#00A651] text-[#00A651]" />
                <span>Next-Gen Academic Ecosystem</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-poppins font-black text-gray-900 leading-[1.1] tracking-tighter">
                Innovating the Future of{' '}
                <span className="text-[#004D20] relative">
                  Learning
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#00A651]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 0 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Edo Innovates LMS provides a comprehensive learning environment designed for Edo State&apos;s digital transformation. Empowering students and tutors with AI-driven pedagogical tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-[#004D20] hover:bg-black text-white text-lg px-12 h-16 rounded-2xl font-black shadow-2xl shadow-green-900/30 transition-all duration-500 hover:scale-105 active:scale-95 group"
                  >
                    Enroll Now
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 h-16 rounded-2xl border-2 border-gray-200 hover:bg-white hover:border-[#004D20] hover:text-[#004D20] transition-all duration-500 font-bold group"
                >
                  <Play className="mr-3 h-5 w-5 text-[#00A651]" />
                  Explore Tour
                </Button>
              </div>

              <div className="pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00A651]" />
                  <span>State Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00A651]" />
                  <span>AI Integrated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00A651]" />
                  <span>Career Focused</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,77,32,0.15)] p-8 lg:p-12 transform hover:scale-[1.02] transition-transform duration-700">
                <div className="bg-gradient-to-br from-[#004D20] to-[#002D13] rounded-[2rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <GraduationCap className="h-64 w-64" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                          <Logo iconOnly className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-poppins font-black text-xl tracking-tight leading-none uppercase italic">Campus Live</p>
                          <p className="text-white/60 font-bold text-xs uppercase tracking-widest mt-1">Edo Innovation Hub</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {[
                        { title: 'Frontend Engineering', progress: 88, color: 'bg-[#00A651]' },
                        { title: 'Digital Marketing', progress: 62, color: 'bg-emerald-400' },
                        { title: 'Data Analytics', progress: 41, color: 'bg-green-300' },
                      ].map((course, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-black uppercase tracking-wider">{course.title}</span>
                            <span className="text-xs font-black">{course.progress}%</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${course.color} rounded-full transition-all duration-1500`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
                <Star className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>
    </>
  );
}
