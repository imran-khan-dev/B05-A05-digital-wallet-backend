import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";

const seeTransactionHistory = async (payload: {
  userId: string;
  page: number;
  limit: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
}) => {
  const {
    userId,
    page,
    limit,
    type,
    fromDate,
    toDate,
    search,
    status,
    minAmount,
    maxAmount,
  } = payload;

  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");

  const userRole = user.role;
  let filter: any = {};

  if (userRole !== "ADMIN") {
    filter.$or = [{ from: user.email }, { to: user.email }];
  }

  if (type) filter.type = type;

  if (fromDate && toDate) {
    filter.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  } else if (fromDate) {
    filter.createdAt = { $gte: new Date(fromDate) };
  } else if (toDate) {
    filter.createdAt = { $lte: new Date(toDate) };
  }

  if (search) {
    filter.$or = [
      ...(filter.$or || []),
      { from: { $regex: search, $options: "i" } },
      { to: { $regex: search, $options: "i" } },
      { email: search },
    ];
  }

  if (status) filter.status = status;

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = minAmount;
    if (maxAmount) filter.amount.$lte = maxAmount;
  }

  console.log(filter);

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  console.log(transactions);
  const total = await Transaction.countDocuments(filter);

  return {
    meta: { page, limit, total },
    data: { user, transactions },
  };
};

const transactionSum = async () => {
  const totalVolume = await Transaction.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const result = {
    totalVolume: totalVolume[0]?.total || 0,
  };

  return result;
};

export const TransactionServices = {
  seeTransactionHistory,
  transactionSum,
};
