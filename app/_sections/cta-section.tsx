import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export function CTASection() {
  return (
    <section className="py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#004D20] rounded-[3rem] p-16 lg:p-24 text-center overflow-hidden shadow-2xl shadow-green-900/40">
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
                <Button size="lg" className="bg-[#00A651] hover:bg-white hover:text-[#004D20] text-white text-xl px-12 h-16 rounded-2xl font-black shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-xl px-12 h-16 rounded-2xl font-black transition-all duration-500">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
