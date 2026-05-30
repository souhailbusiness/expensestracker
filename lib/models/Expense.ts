import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  category: string;
  item: string;
  quantity: number;
  unit: string;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'MAD',
    },
    category: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
      maxlength: 500,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    unit: {
      type: String,
      required: true,
      default: 'item',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense ||
  mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
