import { Transaction } from "../transaction/transaction.model";

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

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: transactions,
  };
};

export const TransactionServices = {
  seeTransactionHistory,
};
