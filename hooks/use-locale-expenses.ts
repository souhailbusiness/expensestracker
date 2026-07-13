 'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export interface LocalExpense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  item: string;
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
  serverId?: string;
}

const STORAGE_KEY = 'purchasestracker.expenses';
const CURRENCY_KEY = 'purchasestracker.currency';
const CATEGORY_KEY = 'purchasestracker.categories';
const DEFAULT_UNIT = 'kg';

type ServerExpense = {
  _id: string;
  amount: number;
  currency: string;
  category: string;
  item: string;
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
};

function readExpenses(): LocalExpense[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return (parsed as LocalExpense[]).map((expense) => ({
      ...expense,
      quantity: Number.isFinite(expense.quantity) ? expense.quantity : 1,
      unit: expense.unit || DEFAULT_UNIT,
      date:
        typeof expense.date === 'string' && expense.date
          ? expense.date
          : new Date().toISOString().split('T')[0],
    }));
  } catch {
    return [];
  }
}

function writeExpenses(expenses: LocalExpense[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function readCurrency(): string {
  if (typeof window === 'undefined') return 'MAD';
  return window.localStorage.getItem(CURRENCY_KEY) || 'MAD';
}

function writeCurrency(currency: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CURRENCY_KEY, currency);
}

function readCategories(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(CATEGORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeCategories(categories: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function normalizeServerExpense(expense: ServerExpense): LocalExpense {
  return {
    id: expense._id,
    serverId: expense._id,
    amount: expense.amount,
    currency: expense.currency || 'MAD',
    category: expense.category,
    item: expense.item,
    quantity: Number.isFinite(expense.quantity) ? expense.quantity : 1,
    unit: expense.unit || DEFAULT_UNIT,
    date: expense.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: expense.notes || undefined,
  };
}

function toIsoDate(date: string | Date | undefined) {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

export function useLocalExpenses() {
  const { isAuthenticated, isLoading } = useAuth();
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [currency, setCurrencyState] = useState('MAD');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    setCurrencyState(readCurrency());
    setCustomCategories(readCategories());
    setExpenses(readExpenses());
  }, []);

  const fetchExpensesFromServer = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([]);
      return;
    }

    try {
      const response = await fetch('/api/expenses', { cache: 'no-store' });
      if (!response.ok) {
        if (response.status !== 401) {
          console.warn('[local-expenses] fetchExpensesFromServer returned:', response.status);
        }
        return;
      }

      const data = await response.json();
      const serverExpenses = Array.isArray(data?.expenses)
        ? data.expenses.map(normalizeServerExpense)
        : [];

      setExpenses(serverExpenses);
      writeExpenses(serverExpenses);
    } catch (error) {
      console.error('[local-expenses] fetchExpensesFromServer failed:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading) {
      void fetchExpensesFromServer();
    }
  }, [isAuthenticated, isLoading, fetchExpensesFromServer]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setExpenses(readExpenses());
      }
      if (event.key === CURRENCY_KEY) {
        setCurrencyState(readCurrency());
      }
      if (event.key === CATEGORY_KEY) {
        setCustomCategories(readCategories());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setCurrency = useCallback((nextCurrency: string) => {
    setCurrencyState(nextCurrency);
    writeCurrency(nextCurrency);
  }, []);

  const addCustomCategory = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const current = readCategories();
    const normalized = trimmed.toLowerCase();
    const exists = current.some((category) => category.toLowerCase() === normalized);
    if (exists) return;

    const next = [trimmed, ...current];
    setCustomCategories(next);
    writeCategories(next);
  }, []);

  const removeCustomCategory = useCallback((label: string) => {
    const current = readCategories();
    const next = current.filter((category) => category.toLowerCase() !== label.toLowerCase());
    setCustomCategories(next);
    writeCategories(next);
  }, []);

  const addExpense = useCallback(
    async (expense: Omit<LocalExpense, 'id'>) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          item: expense.item,
          quantity: expense.quantity,
          unit: expense.unit,
          date: toIsoDate(expense.date),
          notes: expense.notes,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[local-expenses] addExpense API error:', response.status, text);
        throw new Error('Failed to save expense');
      }

      const data = await response.json();
      const serverExpense = data?.expense as ServerExpense | undefined;
      const createdExpense = serverExpense ? normalizeServerExpense(serverExpense) : undefined;

      if (createdExpense) {
        setExpenses((prev) => {
          const next = [createdExpense, ...prev];
          writeExpenses(next);
          return next;
        });
      }

      await fetchExpensesFromServer();
      return createdExpense;
    },
    [fetchExpensesFromServer]
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<LocalExpense>) => {
      const target = expenses.find((expense) => expense.id === id);
      const targetId = target?.serverId || id;

      const response = await fetch(`/api/expenses/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: updates.amount ?? target?.amount,
          currency: updates.currency ?? target?.currency,
          category: updates.category ?? target?.category,
          item: updates.item ?? target?.item,
          quantity: updates.quantity ?? target?.quantity,
          unit: updates.unit ?? target?.unit,
          date: updates.date ? toIsoDate(updates.date) : target?.date,
          notes: updates.notes ?? target?.notes,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[local-expenses] updateExpense API error:', response.status, text);
        await fetchExpensesFromServer();
        throw new Error('Failed to update expense');
      }

      await fetchExpensesFromServer();
    },
    [expenses, fetchExpensesFromServer]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const target = expenses.find((expense) => expense.id === id);
      const targetId = target?.serverId || id;

      const response = await fetch(`/api/expenses/${targetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[local-expenses] deleteExpense API error:', response.status, text);
        await fetchExpensesFromServer();
        throw new Error('Failed to delete expense');
      }

      setExpenses((prev) => {
        const next = prev.filter((expense) => expense.id !== id);
        writeExpenses(next);
        return next;
      });

      await fetchExpensesFromServer();
    },
    [expenses, fetchExpensesFromServer]
  );

  return {
    expenses,
    currency,
    customCategories,
    setCurrency,
    addCustomCategory,
    removeCustomCategory,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}

export const useExpenses = useLocalExpenses;
