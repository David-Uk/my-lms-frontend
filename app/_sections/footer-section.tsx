import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function FooterSection() {
  return (
    <footer className="bg-[var(--canvas-nav)] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="invert brightness-200">
              <Logo />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The official Learning Management System of Edo Innovates. Dedicated to empowering the next generation of digital leaders.
            </p>
          </div>

          {[
            {
              title: 'Platform',
              links: ['Course Catalog', 'Scholarships', 'Alumni', 'Career Services', 'Partners'],
            },
            {
              title: 'Support',
              links: ['Help Center', 'Documentation', 'API Status', 'Contact Us', 'Report Issue'],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">{title}</h4>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Innovation Hub, ICE Road</li>
              <li>Benin City, Edo State</li>
              <li>Nigeria</li>
              <li className="pt-2">
                <a href="mailto:info@edoinnovates.com" className="text-white hover:text-[var(--brand-secondary)] transition-colors">
                  info@edoinnovates.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2026 Edo Innovates. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
