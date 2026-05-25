import { Users, BookOpen, Trophy } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Works</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple three-step process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {[
            { step: '01', title: 'Create Account', description: 'Sign up for free and choose your role - Learner, Tutor, or Admin.', icon: Users },
            { step: '02', title: 'Explore Courses', description: 'Browse our catalog, enroll in courses, or create your own content.', icon: BookOpen },
            { step: '03', title: 'Start Learning', description: 'Engage with interactive content, take quizzes, and track your progress.', icon: Trophy },
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
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
