import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletServices } from "./wallet.service";

const addMoneyToWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  const result = await WalletServices.addMoneyWallet({ userId, amount });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Money added to wallet successfully",
    data: result,
  });
});

export const WalletController = {
  addMoneyToWallet,
};
