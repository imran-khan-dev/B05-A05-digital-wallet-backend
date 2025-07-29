import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";
import { envVars } from "../../config/env";
import { validateRequest } from "../../middlewares/validateRequest";
// import { forgotPasswordZodSchema } from "./auth.validation";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/logout", AuthControllers.logout);


// router.post("/refresh-token", AuthControllers.getNewAccessToken);
// router.post("/logout", AuthControllers.logout);
// router.post(
//   "/change-password",
//   checkAuth(...Object.values(Role)),
//   AuthControllers.changePassword
// );

// router.post(
//   "/set-password",
//   checkAuth(...Object.values(Role)),
//   AuthControllers.setPassword
// );

// router.post(
//   "/forgot-password",
//   validateRequest(forgotPasswordZodSchema),
//   AuthControllers.forgotPassword
// );

// router.post(
//   "/reset-password",
//   checkAuth(...Object.values(Role)),
//   AuthControllers.resetPassword
// );

export const AuthRoutes = router;
