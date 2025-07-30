import z from "zod";
import { WalletStatus } from "./wallet.interface";

export const addMoneyToWalletZodSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required.")
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Invalid MongoDB ObjectId format.",
    }),

  amount: z
    .number()
    .min(10, { message: "Minimum cash-in amount is 10 BDT." })
    .positive({ message: "Amount must be a positive number." }),
});

export const updateWalletZodSchema = z.object({
  balance: z
    .number()
    .min(0, { message: "Balance cannot be negative." })
    .optional(),

  status: z
    .enum(Object.values(WalletStatus) as [string, ...string[]])
    .optional(),
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
