import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletServices } from "./wallet.service";
import { JwtPayload } from "jsonwebtoken";

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

const withdrawMoneyFromWallet = catchAsync(
  async (req: Request, res: Response) => {
    const { agentEmail, amount } = req.body;
    const decodedToken = req.user as JwtPayload;
    const userId = decodedToken.userId;

    const result = await WalletServices.withdrawMoneyFromWallet({
      userId,
      agentEmail,
      amount,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Money withdrawn successfully",
      data: result,
    });
  }
);

export const WalletController = {
  addMoneyToWallet,
  withdrawMoneyFromWallet,
};
