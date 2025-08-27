import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createUserZodSchema,
  updateAgentByAdminZodSchema,
  updateProfileSchema,
} from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.patch(
  "/update-profile",
  checkAuth(...Object.values(Role)),
  validateRequest(updateProfileSchema),
  UserControllers.updateProfile
);
router.get("/all-agents", checkAuth(Role.ADMIN), UserControllers.getAllAgents);
router.patch(
  "/agent/update/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateAgentByAdminZodSchema),
  UserControllers.updateAgentByAdmin
);

router.post(
  "/transaction-history",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

export const UserRoutes = router;
