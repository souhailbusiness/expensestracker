export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_60%)] px-6 pb-24 pt-24 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-indigo-600">About SpendWise</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Clarity and confidence for every expense.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          SpendWise helps you track spending habits, set budgets, and visualize your financial progress. Our mission is to make smart money decisions effortless, with data that is always in sync across your devices.
        </p>
      </div>
    </main>
  );
}
