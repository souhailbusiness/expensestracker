'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Bus,
  Car,
  Coffee,
  Droplets,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  HeartPulse,
  Home,
  Laptop,
  Phone,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  Utensils,
  Dumbbell,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useLocalExpenses } from '@/hooks/use-local-expenses';
import { AIAssistantModal } from '@/components/ai-assistant-modal';
import { EditExpenseModal } from '@/components/edit-expense-modal';

const CATEGORIES = [
  {
    id: 'fuel',
    label: 'Diesel & Fuel',
    icon: Fuel,
    items: ['diesel', 'gasoline', 'oil'],
    unitMode: 'measure',
    defaultUnit: 'L',
  },
  {
    id: 'groceries',
    label: 'Groceries',
    icon: ShoppingBag,
    items: ['onion', 'tomato', 'banana', 'bread', 'milk'],
    unitMode: 'measure',
    defaultUnit: 'kg',
  },
  {
    id: 'restaurant',
    label: 'Restaurants',
    icon: Utensils,
    items: ['lunch', 'dinner', 'coffee', 'snack'],
    unitMode: 'none',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Bus,
    items: ['bus', 'taxi', 'train', 'parking'],
    unitMode: 'none',
  },
  {
    id: 'car',
    label: 'Car & Maintenance',
    icon: Car,
    items: ['wash', 'repair', 'tires', 'insurance'],
    unitMode: 'none',
  },
  {
    id: 'home',
    label: 'Home & Utilities',
    icon: Home,
    items: ['rent', 'electricity', 'water', 'internet'],
    unitMode: 'period',
    defaultUnit: 'month',
  },
  {
    id: 'health',
    label: 'Healthcare',
    icon: HeartPulse,
    items: ['medicine', 'doctor', 'pharmacy'],
    unitMode: 'none',
  },
  {
    id: 'education',
    label: 'Education',
    icon: BookOpen,
    items: ['books', 'course', 'tuition'],
    unitMode: 'none',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Film,
    items: ['cinema', 'music', 'event'],
    unitMode: 'period',
    defaultUnit: 'hour',
  },
  {
    id: 'gaming',
    label: 'Games',
    icon: Gamepad2,
    items: ['game', 'subscription'],
    unitMode: 'period',
    defaultUnit: 'month',
  },
  {
    id: 'clothing',
    label: 'Clothing',
    icon: Shirt,
    items: ['shirt', 'shoes', 'pants'],
    unitMode: 'none',
  },
  {
    id: 'beauty',
    label: 'Beauty & Care',
    icon: Sparkles,
    items: ['parfum', 'cosmetics', 'skincare'],
    unitMode: 'none',
  },
  {
    id: 'gifts',
    label: 'Gifts',
    icon: Gift,
    items: ['gift', 'donation'],
    unitMode: 'none',
  },
  {
    id: 'tech',
    label: 'Tech & Devices',
    icon: Laptop,
    items: ['phone', 'laptop', 'accessory'],
    unitMode: 'none',
  },
  {
    id: 'phone',
    label: 'Phone & Internet',
    icon: Phone,
    items: ['data', 'plan', 'top-up'],
    unitMode: 'period',
    defaultUnit: 'month',
  },
  {
    id: 'coffee',
    label: 'Coffee & Drinks',
    icon: Coffee,
    items: ['coffee', 'tea', 'juice'],
    unitMode: 'none',
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: Dumbbell,
    items: ['gym', 'equipment'],
    unitMode: 'period',
    defaultUnit: 'hour',
  },
  {
    id: 'water',
    label: 'Water',
    icon: Droplets,
    items: ['bottled water', 'filter'],
    unitMode: 'measure',
    defaultUnit: 'L',
  },
  {
    id: 'personal',
    label: 'Personal Care',
    icon: Scissors,
    items: ['haircut', 'salon'],
    unitMode: 'none',
  },
];

const CURRENCIES = ['MAD', 'USD', 'EUR', 'GBP'];
const MEASURE_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'litres' },
  { value: 'm', label: 'metre' },
];
const PERIOD_UNITS = [
  { value: 'hour', label: 'per hour' },
  { value: 'day', label: 'per day' },
  { value: 'month', label: 'per month' },
  { value: 'year', label: 'per year' },
];
const MONTH_OPTIONS = [
  { value: 'all', label: 'All months' },
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

function makeCategoryId(label: string) {
  return `custom-${label.toLowerCase().replace(/\s+/g, '-')}`;
}

export default function DashboardPage() {
  const {
    expenses,
    currency,
    customCategories,
    updateExpense,
    deleteExpense,
    removeCustomCategory,
  } = useLocalExpenses();
  const filteredExpenses = useMemo(
    () => expenses.filter((exp) => exp.currency === currency),
    [expenses, currency]
  );
  const totalSpent = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  const otherCurrencyCount = expenses.filter(
    (exp) => exp.currency !== currency
  ).length;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<any>(null);
  const pageSize = 15;
  const [editData, setEditData] = useState({
    categoryId: CATEGORIES[0]?.id || 'fuel',
    item: '',
    quantity: '1',
    unit: 'kg',
    amount: '',
    currency,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const categoryOptions = useMemo(() => {
    const custom = customCategories.map((label) => ({
      id: makeCategoryId(label),
      label,
      icon: Tag,
      items: [] as string[],
      unitMode: 'measure',
      defaultUnit: 'kg',
    }));
    return [...custom, ...CATEGORIES];
  }, [customCategories]);

  const selectedCategory = useMemo(
    () => categoryOptions.find((cat) => cat.id === editData.categoryId),
    [categoryOptions, editData.categoryId]
  );

  const filterCategoryOptions = useMemo(
    () => categoryOptions.map((category) => category.label),
    [categoryOptions]
  );

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredExpenses]);

  const unitMode = selectedCategory?.unitMode || 'none';
  const unitOptions = unitMode === 'measure' ? MEASURE_UNITS : PERIOD_UNITS;

  const itemSuggestions = selectedCategory?.items || [];

  const getCategoryIdByLabel = (label: string) =>
    categoryOptions.find((category) => category.label === label)?.id ||
    categoryOptions[0]?.id ||
    'fuel';

  const startEdit = (expense: typeof expenses[number]) => {
    setSelectedExpenseForEdit(expense);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: any) => {
    await updateExpense(id, updates);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await deleteExpense(id);
  };

  const filteredTableExpenses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return filteredExpenses.filter((expense) => {
      const matchesCategory =
        categoryFilter === 'all' || expense.category === categoryFilter;

      const date = new Date(expense.date);
      const isValidDate = !Number.isNaN(date.getTime());
      const matchesYear =
        yearFilter === 'all' ||
        (isValidDate && date.getFullYear().toString() === yearFilter);
      const matchesMonth =
        monthFilter === 'all' ||
        (isValidDate && date.getMonth().toString() === monthFilter);

      if (!matchesCategory || !matchesYear || !matchesMonth) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        expense.item,
        expense.category,
        expense.notes || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [filteredExpenses, categoryFilter, searchQuery, monthFilter, yearFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTableExpenses.length / pageSize)
  );
  const safePage = Math.min(currentPage, totalPages);
  const pagedExpenses = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredTableExpenses.slice(start, start + pageSize);
  }, [filteredTableExpenses, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, monthFilter, yearFilter]);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] p-4 md:p-8">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Expense Tracker
            </h1>
            <p className="text-slate-600 mt-1">
              Expense Tracker Overview ({currency})
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/expenses">
              <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 text-white cursor-pointer font-semibold">
                Add Expense
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white cursor-pointer font-semibold">
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur border-indigo-100 hover:shadow-lg transition">
            <p className="text-slate-600 text-sm font-semibold">Total Spent</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {totalSpent.toFixed(2)} {currency}
            </p>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur border-indigo-100 hover:shadow-lg transition">
            <p className="text-slate-600 text-sm font-semibold">Transactions</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {filteredExpenses.length}
            </p>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur border-indigo-100 hover:shadow-lg transition">
            <p className="text-slate-600 text-sm font-semibold">Average Expense</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {(totalSpent / (filteredExpenses.length || 1)).toFixed(2)} {currency}
            </p>
          </Card>
        </div>

        {otherCurrencyCount > 0 && (
          <p className="text-sm text-slate-500 mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
            {otherCurrencyCount} expenses saved in other currencies are hidden.
          </p>
        )}

        {editingId && (
          <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-indigo-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={editData.categoryId}
                    onValueChange={(value) => {
                      const config = CATEGORIES.find((cat) => cat.id === value);
                      const mode = config?.unitMode || 'measure';
                      const nextUnit =
                        mode === 'period'
                          ? config?.defaultUnit || 'month'
                          : mode === 'none'
                            ? 'item'
                            : config?.defaultUnit || 'kg';
                      setEditData((prev) => ({
                        ...prev,
                        categoryId: value,
                        unit: nextUnit,
                        quantity: '1',
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500">
                      <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <span className="flex items-center gap-2">
                              <Icon className="size-4" />
                              <span>{category.label}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Item
                  </label>
                  <Input
                    type="text"
                    list="edit-expense-items"
                    value={editData.item}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, item: e.target.value }))
                    }
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                  <datalist id="edit-expense-items">
                    {itemSuggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {unitMode !== 'none' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {unitMode === 'measure' ? 'Quantity' : 'Duration'}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.quantity}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, quantity: e.target.value }))
                      }
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                )}
                {unitMode !== 'none' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {unitMode === 'measure' ? 'Unit' : 'Period'}
                    </label>
                    <Select
                      value={editData.unit}
                      onValueChange={(value) =>
                        setEditData((prev) => ({ ...prev, unit: value }))
                      }
                    >
                      <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.amount}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Currency
                  </label>
                  <Select
                    value={editData.currency}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={editData.date}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes
                  </label>
                  <Input
                    type="text"
                    value={editData.notes}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 text-white font-semibold"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="border-indigo-200 text-slate-700 hover:bg-indigo-50"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-white/80 backdrop-blur border-indigo-100">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <Input
                  type="text"
                  placeholder="Search items, categories, notes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-64 border-indigo-200 focus:border-indigo-500"
                />
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="md:w-56 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {filterCategoryOptions.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="md:w-48 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="All months" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="md:w-36 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {customCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customCategories.map((label) => (
                  <button
                    key={label}
                    onClick={() => removeCustomCategory(label)}
                    className="inline-flex items-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <span>{label}</span>
                    <span className="text-indigo-400">✕</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredTableExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Notes</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-indigo-100 hover:bg-indigo-50/30 transition"
                    >
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {expense.item}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {expense.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {expense.unit === 'item'
                          ? '-'
                          : `${expense.quantity} ${expense.unit}`}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-semibold text-indigo-600">
                        {expense.amount.toFixed(2)} {expense.currency}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {expense.notes || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(expense)}
                            className="text-indigo-600 hover:text-indigo-700 hover:font-semibold text-sm font-medium transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700 hover:font-semibold text-sm font-medium transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8 font-medium">No expenses yet.</p>
          )}

          {filteredTableExpenses.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-indigo-100">
              <p className="text-sm text-slate-600 font-medium">
                Showing {(safePage - 1) * pageSize + 1}-
                {Math.min(safePage * pageSize, filteredTableExpenses.length)} of
                {' '}
                {filteredTableExpenses.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-indigo-200 text-slate-700 hover:bg-indigo-50"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm font-semibold text-slate-700 px-4 py-1 bg-indigo-50 rounded-md">
                  Page {safePage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="border-indigo-200 text-slate-700 hover:bg-indigo-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={safePage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Floating AI Assistant Button */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-40"
          title="Open AI Budget Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* AI Assistant Modal */}
        <AIAssistantModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
        />
      </div>
    </div>
  );
}
