import { Document, Types } from "mongoose";

export enum TransactionType {
  ADD = "add",  
  SEND = "send", 
  CASH_IN = "cash-in", 
  CASH_OUT = "cash-out", 
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ITransaction extends Document {
  type: TransactionType;
  amount: number;
  from?: Types.ObjectId; // Whose wallet money was taken from
  to?: Types.ObjectId; // Whose wallet received the money
  fee?: number;
  commission?: number;
  status: TransactionStatus;
  initiatorRole: "user" | "agent" | "admin";
  initiatedBy: Types.ObjectId; // ID of the user/agent who initiated it
  createdAt?: Date;
  updatedAt?: Date;
}
