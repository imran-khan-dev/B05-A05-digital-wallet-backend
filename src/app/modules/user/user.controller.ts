import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { User } from "./user.model";
import { Role } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";

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

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your profile Retrieved Successfully",
      data: result.data,
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

const updateUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const payload = req.body;

  const updatedAgent = await UserServices.updateUserByAdmin(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: updatedAgent,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const payload = req.body;

  const updatedProfile = await UserServices.updateProfile(
    decodedToken.userId,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: updatedProfile,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getAllAgents,
  updateUserByAdmin,
  getMe,
  updateProfile,
};
