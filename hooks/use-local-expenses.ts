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

const STORAGE_KEY = 'pt-expenses';
const CURRENCY_KEY = 'pt-expenses-currency';
const CATEGORY_KEY = 'pt-expenses-categories';
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
  const hasMergedRef = useRef(false);

  useEffect(() => {
    setExpenses(readExpenses());
    setCurrencyState(readCurrency());
    setCustomCategories(readCategories());
  }, []);

  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (!response.ok) return;
        const data = await response.json();
        const serverExpenses = Array.isArray(data?.expenses)
          ? data.expenses.map(normalizeServerExpense)
          : [];
        setExpenses(serverExpenses);
        writeExpenses(serverExpenses);
      } catch (error) {
        console.error('[local-expenses] Load server data failed:', error);
      }
    };

    loadFromServer();
  }, [status]);

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
          throw new Error('Failed to save expense');
        }

        const data = await response.json();
        const serverExpense = data?.expense as ServerExpense | undefined;
        if (!serverExpense?._id) {
          throw new Error('Invalid server response');
        }

        const normalized = normalizeServerExpense(serverExpense);
        const nextExpenses = [normalized, ...readExpenses().filter((item) => item.serverId !== normalized.serverId)];
        setExpenses(nextExpenses);
        writeExpenses(nextExpenses);
        return normalized;
      } catch (error) {
        console.error('[local-expenses] API sync failed:', error);
        const fallback: LocalExpense = {
          id: generateId(),
          ...expense,
        };
        const nextExpenses = [fallback, ...readExpenses()];
        setExpenses(nextExpenses);
        writeExpenses(nextExpenses);
        return fallback;
      }
    },
    []
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<LocalExpense>) => {
      const current = readExpenses();
      const next = current.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      );
      const updated = next.find((expense) => expense.id === id);
      if (!updated) return;

      try {
        const targetId = updated.serverId || updated.id;
        const response = await fetch(`/api/expenses/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: updated.amount,
            currency: updated.currency,
            category: updated.category,
            item: updated.item,
            quantity: updated.quantity,
            unit: updated.unit,
            date: new Date(updated.date).toISOString(),
            notes: updated.notes,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update expense');
        }

        const data = await response.json();
        const serverExpense = data?.expense as ServerExpense | undefined;
        if (!serverExpense?._id) {
          throw new Error('Invalid server response');
        }

        const normalized = normalizeServerExpense(serverExpense);
        const refreshed = readExpenses().map((expense) =>
          expense.id === id || expense.serverId === normalized.serverId
            ? normalized
            : expense
        );
        setExpenses(refreshed);
        writeExpenses(refreshed);
      } catch (error) {
        console.error('[local-expenses] API update failed:', error);
        setExpenses(next);
        writeExpenses(next);
      }
    },
    []
  );

  const deleteExpense = useCallback(async (id: string) => {
    const current = readExpenses();
    const target = current.find((expense) => expense.id === id);
    const next = current.filter((expense) => expense.id !== id);

    setExpenses(next);
    writeExpenses(next);

    if (!target) return;

    try {
      const targetId = target.serverId || target.id;
      const response = await fetch(`/api/expenses/${targetId}`, {
        method: 'DELETE',
      });

      // If server responded but deletion was not successful, restore state
      if (!response.ok) {
        console.error('[local-expenses] API delete returned non-ok:', response.status);
        setExpenses(current);
        writeExpenses(current);
      }
    } catch (error) {
      console.error('[local-expenses] API delete failed:', error);
      setExpenses(current);
      writeExpenses(current);
    }
  }, []);

  useEffect(() => {
    const mergeLocalExpenses = async () => {
      if (status !== 'authenticated' || hasMergedRef.current) return;

      const localExpenses = readExpenses().filter((expense) => !expense.serverId);
      if (!localExpenses.length) {
        hasMergedRef.current = true;
        return;
      }

      try {
        await fetch('/api/expenses/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expenses: localExpenses }),
        });
        hasMergedRef.current = true;

        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          const serverExpenses = Array.isArray(data?.expenses)
            ? data.expenses.map(normalizeServerExpense)
            : [];
          setExpenses(serverExpenses);
          writeExpenses(serverExpenses);
        }
      } catch (error) {
        console.error('[local-expenses] Merge failed:', error);
      }
    };

    mergeLocalExpenses();
  }, [status]);

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
