import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";

const seeTransactionHistory = async (payload: {
  userId: string;
  page: number;
  limit: number;
}) => {
  const { userId, page, limit } = payload;

  const skip = (page - 1) * limit;

  const filter = {
    $or: [{ from: userId }, { to: userId }],
  };

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(filter);

  const user = await User.findById(userId).select("-password");

  const result = {
    user: user,
    transactions: transactions,
  };

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const TransactionServices = {
  seeTransactionHistory,
};
