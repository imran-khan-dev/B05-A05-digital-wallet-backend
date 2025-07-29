import { User } from "./../user/user.model";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/create",
  checkAuth(Role.USER, Role.AGENT),
  validateRequest(createWalletZodSchema),
  WalletController.createWallet
);
