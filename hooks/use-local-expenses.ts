 'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

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

const STORAGE_KEY = '********';
const CURRENCY_KEY = '********';
const CATEGORY_KEY = '********';
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
  const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function readCurrency(): string {
  if (typeof window === 'undefined') return 'MAD';
  return localStorage.getItem(CURRENCY_KEY) || 'MAD';
}

function writeCurrency(currency: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENCY_KEY, currency);
}

function readCategories(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CATEGORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
    return [];
  } catch {
    return [];
  }
}

function writeCategories(categories: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: expense.notes || undefined,
  };
}

export function useLocalExpenses() {
  const { status } = useSession();
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [currency, setCurrencyState] = useState('MAD');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    setCurrencyState(readCurrency());
    setCustomCategories(readCategories());
  }, []);

  const fetchExpensesFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        console.warn('[local-expenses] fetchExpensesFromServer returned:', response.status);
        return;
      }
      const data = await response.json();
      const serverExpenses = Array.isArray(data?.expenses)
        ? data.expenses.map(normalizeServerExpense)
        : [];
      setExpenses(serverExpenses);
    } catch (error) {
      console.error('[local-expenses] fetchExpensesFromServer failed:', error);
    }
  }, []);

  useEffect(() => {
    // Load fresh data from server on mount and when auth status changes
    fetchExpensesFromServer();
  }, [status, fetchExpensesFromServer]);

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
    const exists = current.some(
      (category) => category.toLowerCase() === normalized
    );
    if (exists) return;

    const next = [trimmed, ...current];
    setCustomCategories(next);
    writeCategories(next);
  }, []);

  const removeCustomCategory = useCallback((label: string) => {
    const current = readCategories();
    const next = current.filter(
      (category) => category.toLowerCase() !== label.toLowerCase()
    );
    setCustomCategories(next);
    writeCategories(next);
  }, []);

  const addExpense = useCallback(
    async (expense: Omit<LocalExpense, 'id'>) => {
      try {
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
            date: new Date(expense.date).toISOString(),
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

        // Refresh list from server to ensure consistency
        await fetchExpensesFromServer();

        return serverExpense ? normalizeServerExpense(serverExpense) : undefined;
      } catch (error) {
        console.error('[local-expenses] addExpense failed:', error);
        throw error;
      }
    },
    [fetchExpensesFromServer]
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<LocalExpense>) => {
      // Optimistically update in-memory state for snappy UI
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

      try {
        const target = expenses.find((e) => e.id === id);
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
            date: updates.date ? new Date(updates.date).toISOString() : target?.date,
            notes: updates.notes ?? target?.notes,
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          console.error('[local-expenses] updateExpense API error:', response.status, text);
          // Re-sync from server to get authoritative state
          await fetchExpensesFromServer();
          return;
        }

        // On success, refresh from server to ensure DB is authoritative
        await fetchExpensesFromServer();
      } catch (error) {
        console.error('[local-expenses] updateExpense failed:', error);
        await fetchExpensesFromServer();
      }
    },
    [expenses, fetchExpensesFromServer]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      // Optimistically remove from in-memory state
      setExpenses((prev) => prev.filter((e) => e.id !== id));

      try {
        const target = expenses.find((e) => e.id === id);
        const targetId = target?.serverId || id;

        const response = await fetch(`/api/expenses/${targetId}`, {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 404) {
          const text = await response.text().catch(() => '');
          console.error('[local-expenses] deleteExpense API error:', response.status, text);
          // Re-sync with server to restore authoritative state
          await fetchExpensesFromServer();
          return;
        }

        // Refresh authoritative list from server
        await fetchExpensesFromServer();
      } catch (error) {
        console.error('[local-expenses] deleteExpense failed:', error);
        await fetchExpensesFromServer();
      }
    },
    [expenses, fetchExpensesFromServer]
  );

  // Removed mergeLocalExpenses: expenses are authoritative on the server (MongoDB)

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
