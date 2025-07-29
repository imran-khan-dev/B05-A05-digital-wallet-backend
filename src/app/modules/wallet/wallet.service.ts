import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";
import { WalletStatus } from "./wallet.interface";

const addMoneyWallet = async (payload: { userId: string; amount: number }) => {
  const { userId, amount } = payload;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist");
  }

  const wallet = await Wallet.findOne({ owner: userId });
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User's wallet is blocked");
  }

  wallet.balance += amount;
  await wallet.save();

  // TODO: transaction log here

  return wallet;
};

export const WalletServices = {
  addMoneyWallet,
};
