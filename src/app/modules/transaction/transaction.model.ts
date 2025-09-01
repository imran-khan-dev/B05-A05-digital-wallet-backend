import { Schema, model } from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    fee: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.COMPLETED,
    },
    initiatorRole: {
      type: String,
      enum: ["user", "agent", "admin"],
      required: true,
    },
    initiatedBy: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
