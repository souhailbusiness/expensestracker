import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  message: string;
  createdAt: Date;
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatHistory: Model<IChatHistory> =
  mongoose.models.ChatHistory ||
  mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);

export default ChatHistory;
