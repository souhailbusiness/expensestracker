'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses } from '@/hooks/use-locale-expenses';

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

function makeCategoryId(label: string) {
  return `custom-${label.toLowerCase().replace(/\s+/g, '-')}`;
}

function getCategoryConfig(categoryId: string) {
  return CATEGORIES.find((category) => category.id === categoryId);
}
export default function ExpensesPage() {
  const router = useRouter();
  const { currency, setCurrency, addExpense } = useExpenses();

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    currency,
    categoryId: CATEGORIES[0]?.id || 'fuel',
    item: '',
    quantity: '1',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, currency }));
  }, [currency]);

  const customCategoryObjects = customCategories.map((label) => ({
    id: makeCategoryId(label),
    label,
    icon: Tag,
    items: [] as string[],
    unitMode: 'none' as const,
  }));

  const categoryOptions = [...CATEGORIES, ...customCategoryObjects];

  const selectedCategory = useMemo(
    () => categoryOptions.find((cat) => cat.id === formData.categoryId),
    [categoryOptions, formData.categoryId]
  );

  const unitMode = selectedCategory?.unitMode || 'none';
  const unitOptions = unitMode === 'measure' ? MEASURE_UNITS : PERIOD_UNITS;

  const itemSuggestions = selectedCategory?.items || [];

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const categoryLabel = newCategory.trim();
    if (!customCategories.includes(categoryLabel)) {
      setCustomCategories((prev) => [...prev, categoryLabel]);
      const id = makeCategoryId(categoryLabel);
      setFormData((prev) => ({ ...prev, categoryId: id }));
      setNewCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amountValue = Number.parseFloat(formData.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) return;

    const categoryLabel = selectedCategory?.label || 'Other';
    const quantityValue = Number.parseFloat(formData.quantity);

    if (unitMode === 'measure') {
      if (!Number.isFinite(quantityValue) || quantityValue <= 0) return;
    }

    setIsSubmitting(true);

    void addExpense({
      amount: amountValue,
      currency: formData.currency,
      category: categoryLabel,
      item: formData.item.trim(),
      quantity:
        unitMode === 'measure'
          ? quantityValue
          : Number.isFinite(quantityValue) && quantityValue > 0
            ? quantityValue
            : 1,
      unit: unitMode === 'none' ? 'item' : formData.unit,
      date: formData.date,
      notes: formData.notes.trim() || undefined,
    });

    router.push('/dashboard');
  };



  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Add Expense
          </h1>
        </div>

        <Card className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    const config = getCategoryConfig(value);
                    const mode = config?.unitMode || 'measure';
                    const nextUnit =
                      mode === 'period'
                        ? config?.defaultUnit || 'month'
                        : mode === 'none'
                          ? 'item'
                          : config?.defaultUnit || 'kg';
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: value,
                      unit: nextUnit,
                      quantity: '1',
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
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
                <div className="mt-3 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add custom category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Add Category
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item
                </label>
                <Input
                  type="text"
                  list="expense-items"
                  placeholder="onion, tomato, bananas"
                  value={formData.item}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, item: e.target.value }))
                  }
                  required
                />
                <datalist id="expense-items">
                  {itemSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {unitMode !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {unitMode === 'measure' ? 'Quantity' : 'Duration'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                    }
                    required={unitMode === 'measure'}
                  />
                </div>
              )}
              {unitMode !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {unitMode === 'measure' ? 'Unit' : 'Period'}
                  </label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, unit: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, currency: value }));
                    setCurrency(value);
                  }}
                >
                  <SelectTrigger className="w-full">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <Input
                  type="text"
                  placeholder="small note or brand"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <Input
                  type="text"
                  placeholder="Add custom category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button
                  type="button"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={handleAddCategory}
                >
                  Add Category
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
