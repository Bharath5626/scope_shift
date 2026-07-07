import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  sendPasswordOTP,
  resetPasswordWithOTP,
  uploadAvatar,
  getAllUsers,
} from "./user.service";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  file?: Express.Multer.File;
}

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const user = await getUserProfile(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { name, profileImage, theme } = req.body;
    const user = await updateUserProfile(userId, { name, profileImage, theme });
    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  }
);

export const uploadProfileAvatar = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { avatarUrl } = await uploadAvatar(file, userId);
    
    // Update user's profile image
    await updateUserProfile(userId, { profileImage: avatarUrl });
    
    res.status(200).json({
      success: true,
      data: { avatarUrl },
      message: "Avatar uploaded successfully",
    });
  }
);

export const changeUserPassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(userId, { currentPassword, newPassword });
    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

export const sendOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await sendPasswordOTP(email);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword } = req.body;
    const result = await resetPasswordWithOTP(email, { otp, newPassword });
    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

export const getAllUsersList = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const currentUserId = req.user!.id;
    const searchQuery = req.query.search as string | undefined;
    const users = await getAllUsers(currentUserId, searchQuery);
    res.status(200).json({
      success: true,
      data: users,
    });
  }
);
