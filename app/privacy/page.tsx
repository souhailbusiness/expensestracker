export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_60%)] px-6 pb-24 pt-24 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-indigo-600">Privacy</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Your data stays yours.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          SpendWise only stores the data needed to power your dashboards. We never sell your information and you can request deletion at any time.
        </p>
      </div>
    </main>
  );
}
