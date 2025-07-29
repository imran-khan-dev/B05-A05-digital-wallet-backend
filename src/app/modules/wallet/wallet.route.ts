import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { addMoneyToWalletZodSchema } from "./wallet.validation";
import { WalletController } from "./wallet.controller";

const router = express.Router();

router.post(
  "/add-money",
  checkAuth(Role.AGENT),
  validateRequest(addMoneyToWalletZodSchema),
  WalletController.addMoneyToWallet
);

export const walletRoutes = router;
