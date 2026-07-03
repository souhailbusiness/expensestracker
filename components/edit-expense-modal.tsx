'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag } from 'lucide-react';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: any;
  onClose: () => void;
  onSave: (id: string, updates: any) => Promise<void>;
  categories: any[];
  currencies: string[];
}

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

export function EditExpenseModal({
  isOpen,
  expense,
  onClose,
  onSave,
  categories,
  currencies,
}: EditExpenseModalProps) {
  const [editData, setEditData] = useState({
    categoryId: '',
    item: '',
    quantity: '1',
    unit: 'kg',
    amount: '',
    currency: 'MAD',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const categoryOptions = useMemo(() => {
    return categories;
  }, [categories]);

  const selectedCategory = useMemo(() => {
    return categoryOptions.find((cat) => cat.id === editData.categoryId);
  }, [categoryOptions, editData.categoryId]);

  const unitMode = selectedCategory?.unitMode || 'none';
  const unitOptions = unitMode === 'measure' ? MEASURE_UNITS : PERIOD_UNITS;
  const itemSuggestions = selectedCategory?.items || [];

  // Initialize form when expense or isOpen changes - use useEffect to avoid render-time state updates
  useEffect(() => {
    if (isOpen && expense) {
      const category = categoryOptions.find(
        (cat) => cat.label === expense.category
      );
      setEditData({
        categoryId: category?.id || categoryOptions[0]?.id || 'fuel',
        item: expense.item || '',
        quantity: String(expense.quantity ?? 1),
        unit: expense.unit || 'kg',
        amount: String(expense.amount || ''),
        currency: expense.currency || 'MAD',
        date: expense.date || new Date().toISOString().split('T')[0],
        notes: expense.notes || '',
      });
    }
  }, [isOpen, expense, categoryOptions]);

  const handleClose = () => {
    onClose();
  };

  const handleSaveEdit = async () => {
    if (!expense?.id) return;
    const amountValue = Number.parseFloat(editData.amount);
    const quantityValue = Number.parseFloat(editData.quantity);
    if (!Number.isFinite(amountValue) || amountValue <= 0) return;
    if (unitMode === 'measure') {
      if (!Number.isFinite(quantityValue) || quantityValue <= 0) return;
    }

    setIsSaving(true);
    try {
      const categoryLabel = selectedCategory?.label || 'Other';
      await onSave(expense.id, {
        amount: amountValue,
        currency: editData.currency,
        category: categoryLabel,
        item: editData.item.trim(),
        quantity:
          unitMode === 'measure'
            ? quantityValue
            : Number.isFinite(quantityValue) && quantityValue > 0
              ? quantityValue
              : 1,
        unit: unitMode === 'none' ? 'item' : editData.unit,
        date: editData.date,
        notes: editData.notes.trim() || undefined,
      });
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <Select
                value={editData.categoryId}
                onValueChange={(value) => {
                  const config = categoryOptions.find((cat) => cat.id === value);
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
                list="edit-modal-items"
                value={editData.item}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, item: e.target.value }))
                }
                className="border-indigo-200 focus:border-indigo-500"
              />
              <datalist id="edit-modal-items">
                {itemSuggestions.map((item: string) => (
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
                  {currencies.map((code) => (
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

          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 text-white font-semibold"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              className="border-indigo-200 text-slate-700 hover:bg-indigo-50"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
