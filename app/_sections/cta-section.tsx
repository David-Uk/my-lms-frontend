import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--brand-primary)] rounded-xl p-12 lg:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to Join the Digital Revolution?
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
            Be part of Edo State&apos;s growing community of digital innovators. Access premium resources, connect with industry experts, and accelerate your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-white text-[var(--brand-primary)] hover:bg-gray-100 px-8 h-12 text-base font-semibold">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
