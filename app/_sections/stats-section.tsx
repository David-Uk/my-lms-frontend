import { Users, GraduationCap, BookOpen, Star } from 'lucide-react';

export function StatsSection() {
  return (
    <section className="py-20 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '10K+', label: 'Digital Talents', icon: Users },
            { value: '500+', label: 'Certified Tutors', icon: GraduationCap },
            { value: '1,200+', label: 'Skill Tracks', icon: BookOpen },
            { value: '98%', label: 'Placement Rate', icon: Star },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
                <stat.icon className="h-6 w-6 text-[var(--brand-primary)]" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
