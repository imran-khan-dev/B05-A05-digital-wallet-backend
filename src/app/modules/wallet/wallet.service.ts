import mongoose from "mongoose";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";
import { WalletStatus } from "./wallet.interface";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import normalizePhone from "../../utils/normalizePhone";

interface IWithdrawPayload {
  userId: string;
  agentID: string;
  amount: number;
}

interface ISendMoneyUserToUserPayload {
  userId: string;
  receiver: string;
  amount: number;
}

const addMoneyWallet = async (payload: {
  userEmail: string;
  agentId: string;
  amount: number;
}) => {
  const { userEmail, agentId, amount } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check agent
    const agent = await User.findById(agentId).session(session);
    if (!agent || agent.isApproved === false) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent is not approved or does not exist"
      );
    }

    // 2. Find user by email
    const user = await User.findOne({ email: userEmail }).session(session);
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist");
    }

    // 3. Find wallet by user._id (since Wallet.owner references User._id)
    const wallet = await Wallet.findOne({ owner: user._id }).session(session);
    if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    if (wallet.status === WalletStatus.BLOCKED) {
      throw new AppError(httpStatus.BAD_REQUEST, "User's wallet is blocked");
    }

    // 4. Update wallet balance
    wallet.balance += amount;
    await wallet.save({ session });

    // 5. Create transaction
    const transactionData: Partial<ITransaction> = {
      type: TransactionType.CASH_IN,
      amount,
      from: agent._id,
      to: user._id,
      status: TransactionStatus.COMPLETED,
      initiatorRole: "agent",
      initiatedBy: agent._id,
    };

    const thisTransaction = await Transaction.create([transactionData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return {
      user: user.name,
      wallet,
      transaction: thisTransaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const withdrawMoneyFromWallet = async (payload: IWithdrawPayload) => {
  const { userId, agentID: agentEmailOrPhone, amount } = payload;

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

    const formattedPhone = normalizePhone(agentEmailOrPhone);

    const agent = await User.findOne({
      $or: [{ email: agentEmailOrPhone }, { phone: formattedPhone }],
      role: "AGENT",
    }).session(session);

    if (!agent || agent.role !== "AGENT") {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid agent ID");
    }

    if (agent?.isApproved === false) {
      throw new AppError(httpStatus.BAD_REQUEST, "Agent is not approved yet!");
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

    const transactionData: Partial<ITransaction> = {
      type: TransactionType.CASH_OUT,
      amount,
      from: user._id,
      to: agent._id,
      status: TransactionStatus.COMPLETED,
      initiatorRole: "agent",
      initiatedBy: agent._id,
    };

    await Transaction.create([transactionData], { session });

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
  const { userId, receiver: recevierEmailorPhone, amount } = payload;

  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(userId).session(session);
    if (!sender) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender not found");
    }

    const formattedPhone = normalizePhone(recevierEmailorPhone);

    const recipient = await User.findOne({
      $or: [{ email: recevierEmailorPhone }, { phone: formattedPhone }],
      role: "USER",
    }).session(session);

    // console.log("check user id:", recipientEmail, recipient);

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

    const transactionData: Partial<ITransaction> = {
      type: TransactionType.SEND_MONEY,
      amount,
      from: senderWallet._id, // wallet ID
      to: recipientWallet._id, // wallet ID
      status: TransactionStatus.COMPLETED,
      initiatorRole: "user",
      initiatedBy: sender._id,
    };

    await Transaction.create([transactionData], { session });

    await session.commitTransaction();
    session.endSession();

    return {
      from: {
        id: sender._id,
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

const updateWalletByAdmin = async (
  userId: string,
  payload: {
    status?: WalletStatus;
  }
) => {
  const walletUpdated = await Wallet.findOneAndUpdate(
    { owner: userId },
    payload,
    { new: true, runValidators: true }
  );

  if (!walletUpdated) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  return walletUpdated;
};

const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ owner: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  const walletId = new mongoose.Types.ObjectId(wallet._id);

  const transactions = await Transaction.aggregate([
    {
      $match: {
        $or: [{ from: walletId }, { to: walletId }],
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalIn: {
          $sum: {
            $cond: [{ $eq: ["$to", walletId] }, "$amount", 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ["$from", walletId] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const summary = transactions[0] || {
    totalTransactions: 0,
    totalIn: 0,
    totalOut: 0,
  };

  const data = {
    balance: wallet.balance,
    ...summary,
  };

  return data;
};

export const WalletServices = {
  addMoneyWallet,
  withdrawMoneyFromWallet,
  sendMoneyUserToUser,
  updateWalletByAdmin,
  getMyWallet,
};
