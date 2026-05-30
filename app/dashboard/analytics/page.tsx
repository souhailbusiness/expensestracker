'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocalExpenses } from '@/hooks/use-local-expenses';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
];

const MONTH_OPTIONS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

export default function AnalyticsPage() {
  const { expenses, currency } = useLocalExpenses();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth())
  );
  const [selectedYear, setSelectedYear] = useState(
    String(now.getFullYear())
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((exp) => exp.currency === currency),
    [expenses, currency]
  );
  const otherCurrencyCount = expenses.filter(
    (exp) => exp.currency !== currency
  ).length;

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });
    years.add(now.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredExpenses, now]);

  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      const date = new Date(exp.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      totals[key] = (totals[key] || 0) + exp.amount;
    });
    return totals;
  }, [filteredExpenses]);

  const monthlyChartData = useMemo(() => {
    const entries = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);

    return entries.map(([monthKey, amount]) => ({
      key: monthKey,
      month: new Date(`${monthKey}-01`).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      amount: parseFloat(amount.toFixed(2)),
    }));
  }, [monthlyTotals]);

  const topItems = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      const item = exp.item?.trim() || 'Unknown';
      const rawQuantity =
        Number.isFinite(exp.quantity) && exp.quantity > 0 ? exp.quantity : 0;
      const quantity = exp.unit === 'item' ? Math.max(1, rawQuantity) : rawQuantity;
      if (!quantity) return;
      totals[item] = (totals[item] || 0) + quantity;
    });

    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([item, quantity]) => ({
        item,
        quantity: parseFloat(quantity.toFixed(2)),
      }));
  }, [filteredExpenses]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalSpent = filteredExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // Category breakdown
    const categoryBreakdown = filteredExpenses.reduce(
      (acc, exp) => {
        const existing = acc.find((item) => item.category === exp.category);
        if (existing) {
          existing.amount += exp.amount;
          existing.count += 1;
        } else {
          acc.push({
            category: exp.category,
            amount: exp.amount,
            count: 1,
          });
        }
        return acc;
      },
      [] as Array<{ category: string; amount: number; count: number }>
    );

    // Top categories by spending
    const topCategories = categoryBreakdown
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Daily average
    const uniqueDays = new Set(
      filteredExpenses.map((exp) => new Date(exp.date).toLocaleDateString())
    ).size;
    const dailyAverage = uniqueDays > 0 ? totalSpent / uniqueDays : 0;

    // This month total
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTotal = filteredExpenses
      .filter((exp) => new Date(exp.date) >= thisMonthStart)
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Last month total
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthTotal = filteredExpenses
      .filter(
        (exp) =>
          new Date(exp.date) >= lastMonthStart &&
          new Date(exp.date) <= lastMonthEnd
      )
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      totalSpent,
      thisMonthTotal,
      lastMonthTotal,
      dailyAverage,
      categoryBreakdown,
      topCategories,
    };
  }, [filteredExpenses]);

  const selectedMonthKey = `${selectedYear}-${String(
    Number(selectedMonth) + 1
  ).padStart(2, '0')}`;
  const selectedMonthTotal = monthlyTotals[selectedMonthKey] || 0;
  const previousMonthDate = new Date(
    Number(selectedYear),
    Number(selectedMonth) - 1,
    1
  );
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(
    previousMonthDate.getMonth() + 1
  ).padStart(2, '0')}`;
  const previousMonthTotal = monthlyTotals[previousMonthKey] || 0;
  const selectedMonthLabel = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    1
  ).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goPreviousMonth = () => {
    const date = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);
    setSelectedMonth(String(date.getMonth()));
    setSelectedYear(String(date.getFullYear()));
  };

  const goNextMonth = () => {
    const date = new Date(Number(selectedYear), Number(selectedMonth) + 1, 1);
    setSelectedMonth(String(date.getMonth()));
    setSelectedYear(String(date.getFullYear()));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Expense Tracker ({currency})
        </h1>

        {otherCurrencyCount > 0 && (
          <p className="text-sm text-gray-500 mb-6">
            {otherCurrencyCount} expenses saved in other currencies are hidden.
          </p>
        )}

        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Overview</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedMonthLabel}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={goPreviousMonth}>
                Previous
              </Button>
              <Button variant="outline" onClick={goNextMonth}>
                Next
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500">Selected month total</p>
                <p className="text-xl font-semibold text-gray-900">
                  {selectedMonthTotal.toFixed(2)} {currency}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500">Previous month total</p>
                <p className="text-xl font-semibold text-gray-900">
                  {previousMonthTotal.toFixed(2)} {currency}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.totalSpent.toFixed(2)} {currency}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">This Month</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.thisMonthTotal.toFixed(2)} {currency}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Last Month</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.lastMonthTotal.toFixed(2)} {currency}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Average Daily Spend</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.dailyAverage.toFixed(2)} {currency}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Spending Trend */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Spending Trend</h2>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} ${currency}`} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    name="Spending"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">No expense data yet.</p>
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h2>
            {analytics.topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} ${currency}`} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">No expense data yet.</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Most Consumed Items */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Most Consumed Items (Quantity)
            </h2>
            {topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item" angle={-30} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}`} />
                  <Bar dataKey="quantity" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">No expense data yet.</p>
            )}
          </Card>

          {/* Pie Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Category Share
            </h2>
            {analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) =>
                      `${category}: ${amount.toFixed(0)} ${currency}`
                    }
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} ${currency}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">No expense data yet.</p>
            )}
          </Card>
        </div>

        {/* Category Details Table */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Category Details
          </h2>
          {analytics.categoryBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Total Spent
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Number of Expenses
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Average
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.categoryBreakdown
                    .sort((a, b) => b.amount - a.amount)
                    .map((cat) => (
                      <tr
                        key={cat.category}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium capitalize">
                          {cat.category}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">
                          {cat.amount.toFixed(2)} {currency}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {cat.count}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(cat.amount / cat.count).toFixed(2)} {currency}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(
                            (cat.amount / analytics.totalSpent) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Expense Tracker
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
