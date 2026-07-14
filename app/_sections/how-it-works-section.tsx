import { Users, BookOpen, Trophy } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            How It <span className="text-[var(--brand-primary)]">Works</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Get started in minutes with our simple three-step process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Account', description: 'Sign up for free and choose your role - Learner, Tutor, or Admin.', icon: Users },
            { step: '02', title: 'Explore Courses', description: 'Browse our catalog, enroll in courses, or create your own content.', icon: BookOpen },
            { step: '03', title: 'Start Learning', description: 'Engage with interactive content, take quizzes, and track your progress.', icon: Trophy },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold text-gray-200 mb-3">{item.step}</div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
