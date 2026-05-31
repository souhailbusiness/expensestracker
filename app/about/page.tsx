'use client';

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 pt-24">
        <article className="prose prose-slate max-w-none rounded-2xl bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            About ExpensesTracker
          </h1>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            Empowering Your Financial Journey
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            At ExpensesTracker, we believe that managing your money shouldn't feel like a second job. Born out of the frustration of complex spreadsheets and cluttered financial tools, ExpensesTracker was built to offer a seamless, intuitive, and beautiful way to visualize your spending habits.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Our mission is simple: to provide clarity and control over your daily finances, allowing you to make smarter financial decisions effortlessly.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            Why ExpensesTracker?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We understand that every dollar counts. Whether you are saving for a milestone, managing a strict monthly budget, or simply trying to understand where your money goes, our platform adapts to your lifestyle.
          </p>

          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Seamless Tracking:</strong>
                <span className="ml-2 text-slate-600">Log expenses on the go with zero friction.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Intelligent Insights:</strong>
                <span className="ml-2 text-slate-600">Beautiful, clear charts that turn raw data into actionable insights.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Smart Budgeting:</strong>
                <span className="ml-2 text-slate-600">Set monthly targets and watch your progress update in real time.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Privacy First:</strong>
                <span className="ml-2 text-slate-600">Your financial data belongs to you. We prioritize top-tier security to keep your information safe.</span>
              </div>
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            Our Vision
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We envision a world where everyone feels confident and secure about their financial future. By stripping away the complexity of traditional accounting tools, ExpensesTracker equips you with the metrics that truly matter.
          </p>
          <p className="mt-4 text-lg font-semibold text-indigo-600">
            Take control of your money, one day at a time.
          </p>
        </article>
      </div>
    </main>
  );
}
