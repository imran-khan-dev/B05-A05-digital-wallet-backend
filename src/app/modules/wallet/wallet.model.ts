import { Schema, model } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      unique: true, // one wallet per user/agent
    },
    balance: {
      type: Number,
      required: true,
      default: 50, 
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
