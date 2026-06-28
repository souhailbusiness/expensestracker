'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
 
import { Card } from '@/components/ui/card';
import useSWR from 'swr';
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
import { useAuth } from '@/hooks/use-auth';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

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

export default function AnalyticsPage() {
  
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: expensesData } = useSWR<{ expenses: Expense[] }>(
    isAuthenticated ? '/api/expenses' : null,
    fetcher
  );

  const expenses = expensesData?.expenses || [];

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const categoryBreakdown = expenses.reduce(
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

    // Monthly data
    const monthlyData: Record<string, number> = {};
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount;
    });

    const monthlyChartData = Object.entries(monthlyData)
      .sort()
      .slice(-12)
      .map(([month, amount]) => ({
        month: new Date(`${month}-01`).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        amount: parseFloat(amount.toFixed(2)),
      }));

    // Top categories by spending
    const topCategories = categoryBreakdown
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Daily average
    const uniqueDays = new Set(
      expenses.map((exp) => new Date(exp.date).toLocaleDateString())
    ).size;
    const dailyAverage = uniqueDays > 0 ? totalSpent / uniqueDays : 0;

    // This month total
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTotal = expenses
      .filter((exp) => new Date(exp.date) >= thisMonthStart)
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Last month total
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthTotal = expenses
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
      monthlyChartData,
    };
  }, [expenses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Expense Tracker
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Expense Tracker</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${analytics.totalSpent.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Expense Tracker</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${analytics.thisMonthTotal.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Expense Tracker</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${analytics.lastMonthTotal.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Average Daily Spend</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${analytics.dailyAverage.toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Spending Trend */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Expense Tracker
            </h2>
            {analytics.monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
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
              <p className="text-gray-600 text-center py-8">
                Expense Tracker
              </p>
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Expense Tracker
            </h2>
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
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Expense Tracker
              </p>
            )}
          </Card>
        </div>

        {/* Pie Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Expense Tracker
          </h2>
          {analytics.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, amount }) =>
                    `${category}: $${amount.toFixed(0)}`
                  }
                  outerRadius={120}
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
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Expense Tracker
            </p>
          )}
        </Card>

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
                          ${cat.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {cat.count}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          ${(cat.amount / cat.count).toFixed(2)}
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
