import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMerchandise extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  createdAt: Date;
}

const merchandiseSchema = new Schema<IMerchandise>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Merchandise: Model<IMerchandise> =
  mongoose.models.Merchandise ||
  mongoose.model<IMerchandise>('Merchandise', merchandiseSchema);

export default Merchandise;
