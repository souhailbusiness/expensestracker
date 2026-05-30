import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  language: z.enum(['en', 'fr', 'ar']).default('en'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const expenseSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().min(1, 'Category is required'),
  item: z
    .string()
    .min(1, 'Item is required')
    .max(500, 'Item must be less than 500 characters'),
  quantity: z.number().min(0, 'Quantity must be positive').default(1),
  unit: z.string().min(1, 'Unit is required'),
  date: z.string(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  budget: z.number().min(0, 'Budget must be positive'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .default('#3B82F6'),
});

export const purchaseSchema = z.object({
  merchandiseId: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
