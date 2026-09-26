import { Router } from "express";
import {
  forgotPassword,
  getAllUsers,
  getUserById,
  loginUser,
  registerUser,
  resetPassword,
  updateAvatarController,
  updateUser,
  updateUserProfile,
  verifyUserEmail,
} from "../controllers/authController.js";
import upload from "../middlewares/multer.js";
import {
  loginValidation,
  signupValidation,
} from "../middlewares/validation.js";

import roleMiddleware from "../middlewares/roleMiddleware.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = Router();

router.post("/register-user", signupValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/verify-email", verifyUserEmail);
router.post("/reset-password/:token", resetPassword);
router.post("/send-password-reset-link", forgotPassword);
router.put(
  "/user/update/:user_id",
  verifyUser,
  roleMiddleware("admin", "user"),
  updateUserProfile
);
router.patch(
  "/user/upload-avatar/:user_id",
  verifyUser,
  roleMiddleware("admin", "user"),
  upload.single("avatar"),
  updateAvatarController
);
router.get(
  "/user/me/:user_id",
  verifyUser,
  roleMiddleware("admin", "user"),
  getUserById
);

// Admin routes for user management
router.get("/admin/users", verifyUser, roleMiddleware("admin"), getAllUsers);

router.put(
  "/admin/users/:user_id",
  verifyUser,
  roleMiddleware("admin"),
  updateUser
);

export default router;
