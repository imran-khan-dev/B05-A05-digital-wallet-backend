import z from "zod";
import { WalletStatus } from "./wallet.interface";

export const addMoneyToWalletZodSchema = z.object({
  userEmail: z
    .string()
    .email("Invalid user email")
    .min(1, { message: "User email is required" }),

  amount: z
    .number()
    .min(10, { message: "Minimum cash-in amount is 10 BDT." })
    .positive({ message: "Amount must be a positive number." }),
});

export const withdrawMoneyFromWalletZodSchema = z.object({
  amount: z
    .number()
    .positive("Withdraw amount must be greater than 0")
    .refine((val) => !!val, { message: "Withdraw amount is required" }),

  agentEmail: z
    .string()
    .email("Invalid agent email")
    .min(1, { message: "Agent email is required" }),
});

export const sendMoneyUserToUserZodSchema = z.object({
  recipientEmail: z
    .string()
    .email("Invalid recipient email")
    .min(1, { message: "Recipient email is required" }),

  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .refine((val) => !!val, { message: "Amount is required" }),
});

export const updateWalletByAdminZodSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
});
