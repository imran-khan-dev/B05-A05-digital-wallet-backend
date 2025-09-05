import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionServices } from "./transaction.service";
import { Transaction } from "./transaction.model";

const seeAllTransactionsHistory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await Transaction.find();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Transaction history retrieved successfully",
      data: result,
    });
  }
);

const transactionSum = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionServices.transactionSum();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Transactions Sum retrieved successfully",
    data: result,
  });
});

const seeTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const minAmount = parseInt(req.query.minAmount as string) || 10;
    const maxAmount = parseInt(req.query.maxAmount as string);

    const result = await TransactionServices.seeTransactionHistory({
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
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Transaction history retrieved successfully",
      data: result,
    });
  }
);

export const TransactionControllers = {
  seeTransactionHistory,
  seeAllTransactionsHistory,
  transactionSum,
};
