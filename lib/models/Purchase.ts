import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  merchandiseId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  purchaseDate: Date;
  createdAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    merchandiseId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchandise',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Purchase: Model<IPurchase> =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>('Purchase', purchaseSchema);

export default Purchase;
