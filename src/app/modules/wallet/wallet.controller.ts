import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletServices } from "./wallet.service";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "./wallet.model";

const addMoneyToWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  const decodedToken = req.user as JwtPayload;
  const agentId = decodedToken.userId;

  const result = await WalletServices.addMoneyWallet({
    userId,
    agentId,
    amount,
  });

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

const sendMoneyUserToUser = catchAsync(async (req: Request, res: Response) => {
  const { recipientEmail, amount } = req.body;
  const decodedToken = req.user as JwtPayload;
  const userId = decodedToken.userId;

  const result = await WalletServices.sendMoneyUserToUser({
    userId,
    recipientEmail,
    amount,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Money sent successfully",
    data: result,
  });
});

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const allWallets = await Wallet.find();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Wallets Retrived Successfully",
    data: allWallets,
  });
});

const updateWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const payload = req.body;

  const updatedWallet = await WalletServices.updateWalletByAdmin(
    userId,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet updated successfully",
    data: updatedWallet,
  });
});

export const WalletController = {
  addMoneyToWallet,
  withdrawMoneyFromWallet,
  sendMoneyUserToUser,
  getAllWallets,
  updateWallet,
};
