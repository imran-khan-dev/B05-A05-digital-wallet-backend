import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import {
  addMoneyToWalletZodSchema,
  sendMoneyUserToUserZodSchema,
  updateWalletByAdminZodSchema,
  withdrawMoneyFromWalletZodSchema,
} from "./wallet.validation";
import { WalletController } from "./wallet.controller";

const router = express.Router();

router.post(
  "/add-money",
  checkAuth(Role.AGENT),
  validateRequest(addMoneyToWalletZodSchema),
  WalletController.addMoneyToWallet
);

router.post(
  "/withdraw-money",
  checkAuth(Role.USER),
  validateRequest(withdrawMoneyFromWalletZodSchema),
  WalletController.withdrawMoneyFromWallet
);

router.post(
  "/send-money",
  checkAuth(Role.USER),
  validateRequest(sendMoneyUserToUserZodSchema),
  WalletController.sendMoneyUserToUser
);

router.get(
  "/my-wallet",
  checkAuth(...Object.values(Role)),
  WalletController.getMyWallet
);

router.get(
  "/all-wallets",
  checkAuth(Role.ADMIN),
  WalletController.getAllWallets
);

router.patch(
  "/update-wallet/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateWalletByAdminZodSchema),
  WalletController.updateWallet
);

export const walletRoutes = router;
