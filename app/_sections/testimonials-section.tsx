import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Computer Science Student',
    content: 'The AI quiz generator has been a game-changer for my exam preparation. I can create custom quizzes on any topic in seconds!',
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Course Instructor',
    content: 'Managing my courses and tracking student progress has never been easier. The live quiz feature keeps my students engaged.',
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'University Administrator',
    content: 'This LMS streamlined our entire educational process. The role-based access control is exactly what we needed.',
    avatar: 'ER',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Loved by <span className="text-[var(--brand-primary)]">Thousands</span>
          </h2>
          <p className="text-gray-500">See what our users have to say</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
