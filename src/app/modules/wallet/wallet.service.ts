import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";
import { WalletStatus } from "./wallet.interface";
import mongoose from "mongoose";

interface IWithdrawPayload {
  userId: string;
  agentEmail: string;
  amount: number;
}

interface ISendMoneyUserToUserPayload {
  userId: string;
  recipientEmail: string;
  amount: number;
}

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

const withdrawMoneyFromWallet = async (payload: IWithdrawPayload) => {
  const { userId, agentEmail, amount } = payload;

  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const agent = await User.findOne({ email: agentEmail }).session(session);
    if (!agent || agent.role !== "AGENT") {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid agent ID");
    }

    const userWallet = await Wallet.findOne({ owner: userId }).session(session);
    if (!userWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }

    if (userWallet.status !== WalletStatus.ACTIVE) {
      throw new AppError(httpStatus.BAD_REQUEST, "User wallet is not active");
    }

    if (userWallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    const agentWallet = await Wallet.findOne({ owner: agent._id }).session(
      session
    );
    if (!agentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }

    userWallet.balance -= amount;
    agentWallet.balance += amount;

    await userWallet.save({ session });
    await agentWallet.save({ session });

    // transaction record here...

    await session.commitTransaction();
    session.endSession();

    return {
      from: {
        id: user._id,
        newBalance: userWallet.balance,
      },
      to: {
        id: agent._id,
        newBalance: agentWallet.balance,
      },
      amount,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const sendMoneyUserToUser = async (payload: ISendMoneyUserToUserPayload) => {
  const { userId, recipientEmail, amount } = payload;

  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender not found");
    }

    const recipient = await User.findOne({ email: recipientEmail }).session(
      session
    );

  
    if (!recipient || recipient.role !== "USER") {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const senderWallet = await Wallet.findOne({ owner: userId }).session(
      session
    );
    if (!senderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found");
    }

    if (senderWallet.status !== WalletStatus.ACTIVE) {
      throw new AppError(httpStatus.BAD_REQUEST, "Sender wallet is not active");
    }

    if (senderWallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    const recipientWallet = await Wallet.findOne({
      owner: recipient._id,
    }).session(session);
    if (!recipientWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Recipient wallet not found");
    }

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save({ session });
    await recipientWallet.save({ session });

    // transaction record here...

    await session.commitTransaction();
    session.endSession();

    return {
      from: {
        id: user._id,
        newBalance: senderWallet.balance,
      },
      to: {
        id: recipient._id,
        newBalance: recipientWallet.balance,
      },
      amount,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const WalletServices = {
  addMoneyWallet,
  withdrawMoneyFromWallet,
  sendMoneyUserToUser,
};
