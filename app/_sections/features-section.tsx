import { Brain, BookOpen, Trophy, Shield, Globe, Clock } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Study Companion',
    description: 'Personalized learning paths and AI-generated assessments tailored to your unique learning style.',
  },
  {
    icon: BookOpen,
    title: 'High-Density Content',
    description: 'Immersive course structures featuring rich media, live interactions, and practical projects.',
  },
  {
    icon: Trophy,
    title: 'Live Gamification',
    description: 'Collaborative quiz sessions and real-time coding challenges to boost engagement and retention.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Robust accreditation system ensuring verifiable certificates for your professional portfolio.',
  },
  {
    icon: Globe,
    title: 'Remote Accessibility',
    description: 'Learn from anywhere in the world with offline-first support and low-bandwidth optimization.',
  },
  {
    icon: Clock,
    title: 'Analytics Dashboard',
    description: 'Detailed insights into your academic journey with predictive performance metrics.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Equipping You with <span className="text-[var(--brand-primary)]">Tomorrow&apos;s</span> Skills
          </h2>
          <p className="text-gray-500">
            A state-of-the-art infrastructure built for learners, instructors, and the Edo digital economy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 mb-4">
                <feature.icon className="h-5 w-5 text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
