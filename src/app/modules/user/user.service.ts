import { Transaction } from "./../transaction/transaction.model";
import httpStatus from "http-status-codes";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { Wallet } from "../wallet/wallet.model";
import { IWallet, WalletStatus } from "../wallet/wallet.interface";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";

import bcrypt from "bcrypt";

const createUser = async (payload: Partial<IUser>) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email }).session(session);

    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: email as string,
    };

    const user = await User.create(
      [
        {
          email,
          password: hashedPassword,
          auths: [authProvider],
          ...rest,
        },
      ],
      { session }
    );

    if (user[0].role === "USER" || user[0].role === "AGENT") {
      const walletData: IWallet = {
        owner: user[0]._id, // Note: `create([])` returns an array due to using session
        balance: 50,
        status: WalletStatus.ACTIVE,
      };

      const transactionData: Partial<ITransaction> = {
        type: TransactionType.CASH_IN_BONUS,
        amount: 50,
        to: user[0]._id,
        status: TransactionStatus.COMPLETED,
        initiatorRole: "user",
        initiatedBy: user[0]._id,
      };

      await Wallet.create([walletData], { session });
      await Transaction.create([transactionData], { session });
    }

    await session.commitTransaction();
    session.endSession();

    return user[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const updateAgentByAdmin = async (
  agentId: string,
  payload: {
    isApproved?: boolean;
    isActive?: IsActive;
  }
) => {
  const agent = await User.findOneAndUpdate(
    { _id: agentId, role: "AGENT" },
    payload,
    { new: true, runValidators: true }
  );

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found or not an agent");
  }

  return agent;
};

const updateProfile = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updateData: Partial<IUser> = {};

  if (payload.name) {
    updateData.name = payload.name;
  }

  if (payload.phone) {
    updateData.phone = payload.phone;
  }

  if (payload.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    updateData.password = hashedPassword;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  return updatedUser;
};

export const UserServices = {
  createUser,
  updateAgentByAdmin,
  getMe,
  updateProfile,
};
