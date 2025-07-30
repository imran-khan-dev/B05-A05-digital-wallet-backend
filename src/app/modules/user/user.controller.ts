import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { User } from "./user.model";
import { Role } from "./user.interface";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: `${user.role} Created Successfully`,
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allUsers = await User.find({ role: Role.USER });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Users Retrived Successfully",
      data: allUsers,
    });
  }
);

const getAllAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allAgents = await User.find({ role: Role.AGENT });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Agents Retrived Successfully",
      data: allAgents,
    });
  }
);

export const UserControllers = {
  createUser,
  getAllUsers,
  getAllAgents,
};
