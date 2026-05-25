import { Brain, BookOpen, Trophy, Shield, Globe, Clock } from 'lucide-react';

const features = [
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
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00A651]/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-black text-gray-900 mb-6 leading-tight tracking-tighter">
            Equipping You with{' '}
            <span className="text-[#004D20]">Tomorrow&apos;s</span> Skills
          </h2>
          <p className="text-xl text-gray-500 font-medium">
            A state-of-the-art infrastructure built for learners, instructors, and the Edo digital economy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, i) => (
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
  );
}
