'use client';

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 pt-24">
        <article className="prose prose-slate max-w-none rounded-2xl bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm italic text-slate-500">
            Last updated: May 31, 2026
          </p>

          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Welcome to ExpensesTracker. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our application.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            1. Information We Collect
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Because ExpensesTracker is a personal finance tool, we process the financial information you explicitly input into the application:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Account Information:</strong>
                <span className="ml-2 text-slate-600">Email address and name used during registration or authentication.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Financial Transaction Data:</strong>
                <span className="ml-2 text-slate-600">Expense amounts, categories, dates, and item names that you manually log or track.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Technical Data:</strong>
                <span className="ml-2 text-slate-600">IP addresses, browser types, and device identifiers required to maintain platform security and optimal performance.</span>
              </div>
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            2. How We Use Your Information
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We use the collected data strictly to run and improve your experience:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <span className="text-slate-600">To maintain, secure, and update your personal dashboard.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <span className="text-slate-600">To generate your localized financial charts, trends, and analytical insights.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <span className="text-slate-600">To send essential account alerts, security updates, and support messages.</span>
            </li>
          </ul>
          <p className="mt-4 font-semibold text-slate-900">
            We do not sell, rent, or trade your personal or financial data to third-party advertisers.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            3. Data Security
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We implement robust, industry-standard security measures—including end-to-end encryption for data in transit and at rest—to prevent unauthorized access, alteration, or disclosure of your financial records.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            4. Data Retention and Deletion
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Your data is kept for as long as your account remains active. You maintain absolute ownership over your information; you can export your data or permanently delete your account and all associated transaction history at any time directly through your account settings.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            5. Contact Information
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            If you have any questions or concerns regarding this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@expensestracker.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              privacy@expensestracker.com
            </a>
            .
          </p>
        </article>
      </div>
    </main>
  );
}
