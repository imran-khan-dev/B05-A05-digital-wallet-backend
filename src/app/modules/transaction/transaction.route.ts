import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionControllers } from "./transaction.controller";

const router = Router();

router.get(
  "/transaction-history",
  checkAuth(Role.ADMIN),
  TransactionControllers.seeAllTransactionsHistory
);

router.get(
  "/transaction-sum/",
  checkAuth(Role.ADMIN),
  TransactionControllers.transactionSum
);

router.get(
  "/transaction-history/:id", 
  checkAuth(Role.USER),
  TransactionControllers.seeTransactionHistory
);

export const TransactionRoutes = router;
