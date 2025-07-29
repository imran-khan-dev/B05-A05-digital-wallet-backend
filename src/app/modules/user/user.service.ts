import httpStatus from "http-status-codes";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { Wallet } from "../wallet/wallet.model";
import { IWallet, WalletStatus } from "../wallet/wallet.interface";
// import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email }).session(session); 

    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: email as string,
    };

    const user = await User.create(
      [
        {
          email,
          password: hashedPassword,
          auths: [authProvider],
          ...rest,
        },
      ],
      { session }
    );

    const walletData: IWallet = {
      owner: user[0]._id, // Note: `create([])` returns an array
      balance: 50,
      status: WalletStatus.ACTIVE,
    };

    await Wallet.create([walletData], { session });

    await session.commitTransaction();
    session.endSession();

    return user[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const UserServices = {
  createUser,
};
