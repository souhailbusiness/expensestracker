import Link from 'next/link';
import {
  BarChart3,
  Lightbulb,
  PieChart,
  Wallet,
  Home,
  History,
  Plus,
  Target,
  User,
} from 'lucide-react';

export default function RootPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16">
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center rounded-full bg-indigo-50/70 px-4 py-1 text-xs font-semibold text-indigo-600">
              ✦ Smart Spending, Better Living
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              Track. Analyze. Optimize.
              <br />
              <span className="text-indigo-600">Your Expenses.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
              SpendWise helps you control every dirham and dollar with crystal-clear analytics, smart categories, and budgets that keep you on track. Feel confident about your money every day.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { icon: BarChart3, title: 'Track Every Expense' },
                { icon: Wallet, title: 'Set Budgets' },
                { icon: PieChart, title: 'Visualize Your Spending' },
                { icon: Lightbulb, title: 'Make Smarter Decisions' },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50/70 text-indigo-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {feature.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Built for clarity and confidence.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 ease-in-out hover:opacity-90 animate-pulse-zoom"
              >
                Get Started →
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold text-slate-700 underline decoration-indigo-300 underline-offset-4"
              >
                About
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <div className="absolute -right-12 top-6 hidden h-full w-80 rounded-3xl bg-white shadow-lg lg:block">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Overview</p>
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600">
                      May
                    </span>
                  </div>
                  <div className="mt-4 h-24 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
                    <div className="relative h-full w-full">
                      <div className="absolute inset-0 flex items-end justify-between">
                        {[20, 36, 28, 48].map((height, index) => (
                          <div
                            key={height}
                            className="w-2 rounded-full bg-indigo-400"
                            style={{ height: `${height}%`, opacity: 0.5 + index * 0.1 }}
                          />
                        ))}
                      </div>
                      <div className="absolute left-0 top-2 h-16 w-full rounded-full border border-indigo-200/60" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-600">Budget Overview</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      $751.25 Left
                    </p>
                    <p className="text-xs text-slate-500">from $2,000</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[62%] rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-600">Spending by Category</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full border-4 border-indigo-300 border-t-emerald-400 border-r-orange-300" />
                      <div className="text-xs text-slate-600">
                        <p>Food & Drinks $499.50</p>
                        <p>Transport $214.20</p>
                        <p>Utilities $135.80</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-xl">
                <div className="rounded-[2rem] bg-slate-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total Spent</p>
                      <p className="text-xl font-semibold text-slate-900">
                        $1,248.75
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-500">
                      +12.5%
                    </span>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-600">Spending by Category</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full border-4 border-indigo-400 border-t-pink-300 border-r-sky-300" />
                      <div className="space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-400" />
                          Food 38%
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-pink-300" />
                          Shopping 24%
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-sky-300" />
                          Bills 18%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { title: 'Grocery Store', amount: '-$52.30' },
                      { title: 'Gasoline', amount: '-$38.40' },
                      { title: 'Electricity Bill', amount: '-$120.10' },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm shadow-sm"
                      >
                        <span className="text-slate-700">{item.title}</span>
                        <span className="font-semibold text-slate-900">{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-white px-6 py-3 text-slate-500">
                    <Home className="h-4 w-4" />
                    <History className="h-4 w-4" />
                    <div className="rounded-full bg-indigo-600 p-2 text-white">
                      <Plus className="h-4 w-4" />
                    </div>
                    <Target className="h-4 w-4" />
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -top-8 right-0 hidden h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-4 text-white shadow-2xl lg:block">
                <BarChart3 className="h-full w-full" />
              </div>
              <div className="pointer-events-none absolute right-10 top-40 hidden h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-200 p-3 text-white shadow-2xl lg:block">
                <Wallet className="h-full w-full" />
              </div>
              <div className="pointer-events-none absolute -bottom-6 right-6 hidden h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-200 p-3 text-white shadow-2xl lg:block">
                <PieChart className="h-full w-full" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
