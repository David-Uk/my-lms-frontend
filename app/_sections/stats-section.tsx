import { Users, GraduationCap, BookOpen, Star } from 'lucide-react';

export function StatsSection() {
  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { value: '10K+', label: 'Digital Talents', icon: Users },
            { value: '500+', label: 'Certified Tutors', icon: GraduationCap },
            { value: '1,200+', label: 'Skill Tracks', icon: BookOpen },
            { value: '98%', label: 'Placement Rate', icon: Star },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
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
  );
}
