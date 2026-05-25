import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function FooterSection() {
  return (
    <footer className="bg-[#001D0B] text-white pt-32 pb-16 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00A651]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
          <div className="space-y-8">
            <Logo className="invert brightness-200" />
            <p className="text-gray-400 font-medium leading-relaxed">
              The official Learning Management System of Edo Innovates. Dedicated to empowering the next generation of digital leaders through technology and innovation.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram', 'Facebook'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#00A651] transition-all duration-300 border border-white/5 hover:border-transparent hover:-translate-y-1">
                  <span className="text-xs font-black uppercase tracking-widest">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Strategic Hubs',
              links: ['Innovation Hub', 'Creative Hub', 'Tech Park', 'Production Center', 'Incubation Zone'],
            },
            {
              title: 'Academy Info',
              links: ['Course Catalog', 'Scholarship Programs', 'Alumni Network', 'Career Services', 'Partner Hub'],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-[#00A651] mb-10">{title}</h4>
              <ul className="space-y-4">
                {links.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 font-bold hover:text-white transition-colors duration-300 flex items-center gap-2 group text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004D20] group-hover:bg-[#00A651] transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-[#00A651] mb-10">Connect</h4>
            <ul className="space-y-4">
              <li className="text-gray-400 font-bold text-sm">
                Innovation Hub, <br /> ICE Road, Benin City, <br /> Edo State, Nigeria.
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
            <Link href="#" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
