export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 pt-24">
        <div className="rounded-2xl bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Have a question, feedback, or a feature suggestion? We would love to hear from you! The ExpensesTracker team is dedicated to building the best possible experience for our users, and your insights help us improve every single day.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Contact Us</h2>
              <p className="text-slate-600">
                <strong className="text-slate-900">Support & Partnership Inquiries:</strong>{' '}
                <a href="mailto:support@expensestracker.com" className="text-indigo-600 hover:text-indigo-700">
                  support@expensestracker.com
                </a>
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Response Time</h2>
              <p className="text-slate-600">
                We typically respond to all inquiries within 24 to 48 business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
