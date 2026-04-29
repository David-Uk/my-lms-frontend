'use client';

import { useEffect, useState } from 'react';
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

export default function LandingPage() {
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
    <div className="min-h-screen bg-white font-roboto">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
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

            {/* CTA Buttons */}
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[#F8F9FA]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#004D20 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00A651]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#004D20]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-[#00A651]/10 text-[#004D20] text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-1000">
                <Zap className="h-4 w-4 fill-[#00A651] text-[#00A651]" />
                <span>Next-Gen Academic Ecosystem</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-poppins font-black text-gray-900 leading-[1.1] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
                Innovating the Future of{' '}
                <span className="text-[#004D20] relative">
                  Learning
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#00A651]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 0 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Edo Innovates LMS provides a comprehensive learning environment designed for Edo State&apos;s digital transformation. Empowering students and tutors with AI-driven pedagogical tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
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

              {/* Trust Indicators */}
              <div className="pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs font-black text-gray-400 uppercase tracking-widest animate-in fade-in duration-1000 delay-500">
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

            {/* Hero Image/Illustration */}
            <div className="relative animate-in fade-in zoom-in duration-1000">
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

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
                <Star className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { value: '10K+', label: 'Digital Talents', icon: Users },
              { value: '500+', label: 'Certified Tutors', icon: GraduationCap },
              { value: '1,200+', label: 'Skill Tracks', icon: BookOpen },
              { value: '98%', label: 'Placement Rate', icon: Star },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F8F9FA] rounded-[1.5rem] mb-6 group-hover:bg-[#004D20] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-green-900/20 group-hover:-translate-y-2">
                   <stat.icon className="h-7 w-7" />
                </div>
                <p className="text-4xl font-poppins font-black text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00A651]/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-black text-gray-900 mb-6 leading-tight tracking-tighter">
              Equipping You with{' '}
              <span className="text-[#004D20]">
                Tomorrow&apos;s
              </span> Skills
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              A state-of-the-art infrastructure built for learners, instructors, and the Edo digital economy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: Brain,
                title: 'AI Study Companion',
                description: 'Personalized learning paths and AI-generated assessments tailored to your unique learning style.',
                color: 'bg-green-50 text-[#004D20]',
              },
              {
                icon: BookOpen,
                title: 'High-Density Content',
                description: 'Immersive course structures featuring rich media, live interactions, and practical projects.',
                color: 'bg-blue-50 text-blue-700',
              },
              {
                icon: Trophy,
                title: 'Live Gamification',
                description: 'Collaborative quiz sessions and real-time coding challenges to boost engagement and retention.',
                color: 'bg-orange-50 text-orange-700',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Robust accreditation system ensuring verifiable certificates for your professional portfolio.',
                color: 'bg-indigo-50 text-indigo-700',
              },
              {
                icon: Globe,
                title: 'Remote Accessibility',
                description: 'Learn from anywhere in the world with offline-first support and low-bandwidth optimization.',
                color: 'bg-emerald-50 text-[#00A651]',
              },
              {
                icon: Clock,
                title: 'Analytics Dashboard',
                description: 'Detailed insights into your academic journey with predictive performance metrics.',
                color: 'bg-slate-50 text-slate-700',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-10 bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500 hover:-translate-y-3 border border-gray-50"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-poppins font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free and choose your role - Learner, Tutor, or Admin.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Explore Courses',
                description: 'Browse our catalog, enroll in courses, or create your own content.',
                icon: BookOpen,
              },
              {
                step: '03',
                title: 'Start Learning',
                description: 'Engage with interactive content, take quizzes, and track your progress.',
                icon: Trophy,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative z-10">
                  <div className="text-5xl font-bold text-gray-100 mb-4">{item.step}</div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>

                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Loved by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Thousands
              </span>
            </h2>
            <p className="text-lg text-gray-600">See what our users have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Computer Science Student',
                content: 'The AI quiz generator has been a game-changer for my exam preparation. I can create custom quizzes on any topic in seconds!',
                avatar: 'SJ',
              },
              {
                name: 'Michael Chen',
                role: 'Course Instructor',
                content: 'Managing my courses and tracking student progress has never been easier. The live quiz feature keeps my students engaged.',
                avatar: 'MC',
              },
              {
                name: 'Emily Rodriguez',
                role: 'University Administrator',
                content: 'This LMS streamlined our entire educational process. The role-based access control is exactly what we needed.',
                avatar: 'ER',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-[#004D20] rounded-[3rem] p-16 lg:p-24 text-center overflow-hidden shadow-2xl shadow-green-900/40">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
                 <Logo iconOnly className="h-10 w-10" />
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-poppins font-black text-white mb-8 leading-tight tracking-tighter">
                Ready to Join the <br /> Digital Revolution?
              </h2>
              <p className="text-xl text-green-50/70 mb-12 max-w-2xl mx-auto font-medium">
                Be part of Edo State&apos;s growing community of digital innovators. Access premium resources, connect with industry experts, and accelerate your career.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-[#00A651] hover:bg-white hover:text-[#004D20] text-white text-xl px-12 h-16 rounded-2xl font-black shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-xl px-12 h-16 rounded-2xl font-black transition-all duration-500"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001D0B] text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00A651]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
            {/* Brand */}
            <div className="space-y-8">
              <Logo className="invert brightness-200" />
              <p className="text-gray-400 font-medium leading-relaxed">
                The official Learning Management System of Edo Innovates. Dedicated to empowering the next generation of digital leaders through technology and innovation.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'Instagram', 'Facebook'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#00A651] transition-all duration-300 border border-white/5 hover:border-transparent hover:-translate-y-1"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-[#00A651] mb-10">Strategic Hubs</h4>
              <ul className="space-y-4">
                {['Innovation Hub', 'Creative Hub', 'Tech Park', 'Production Center', 'Incubation Zone'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 font-bold hover:text-white transition-colors duration-300 flex items-center gap-2 group text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004D20] group-hover:bg-[#00A651] transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-[#00A651] mb-10">Academy Info</h4>
              <ul className="space-y-4">
                {['Course Catalog', 'Scholarship Programs', 'Alumni Network', 'Career Services', 'Partner Hub'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 font-bold hover:text-white transition-colors duration-300 flex items-center gap-2 group text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004D20] group-hover:bg-[#00A651] transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-[#00A651] mb-10">Connect</h4>
              <ul className="space-y-4">
                <li className="text-gray-400 font-bold text-sm">
                  Innovation Hub, <br />
                  ICE Road, Benin City, <br />
                  Edo State, Nigeria.
                </li>
                <li className="pt-4">
                  <a href="mailto:info@edoinnovates.com" className="text-white font-black hover:text-[#00A651] transition-colors text-sm">
                    info@edoinnovates.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
              © 2026 EDO INNOVATES. All rights reserved.
            </p>
            <div className="flex items-center gap-10">
              <Link href="#" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
