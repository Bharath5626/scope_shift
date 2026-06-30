import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changeUserPassword,
  sendOTP,
  resetPassword,
  uploadProfileAvatar,
} from "./user.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { uploadAvatar } from "../../middlewares/upload.middleware";
import { otpRateLimit } from "../../middlewares/rateLimit.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  sendOTPSchema,
  resetPasswordSchema,
} from "./user.validation";

const router = Router();

// All profile routes require authentication except OTP endpoints
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, validate(updateProfileSchema), updateProfile);
router.post("/upload-avatar", verifyToken, uploadAvatar, uploadProfileAvatar);
router.post("/change-password", verifyToken, validate(changePasswordSchema), changeUserPassword);

// OTP endpoints don't require authentication (for password reset)
router.post("/send-otp", otpRateLimit, validate(sendOTPSchema), sendOTP);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
