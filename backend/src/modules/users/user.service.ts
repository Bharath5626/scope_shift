import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../config/database";
import { env } from "../../config/env";
import fs from "fs/promises";
import path from "path";

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
};

// Generate a secure 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for storage
const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

// Verify OTP
const verifyOTP = async (otp: string, hashedOTP: string): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOTP);
};

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

export const uploadAvatar = async (file: Express.Multer.File, userId: string) => {
  await ensureUploadsDir();
  
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  const fileExtension = path.extname(file.originalname);
  const sanitizedBaseName = sanitizeFilename(file.originalname.replace(fileExtension, ''));
  const fileName = `${userId}-${Date.now()}-${sanitizedBaseName}${fileExtension}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Save the file using multer's buffer
  await fs.writeFile(filePath, file.buffer);
  
  // Return the URL (in production, this would be a cloud storage URL)
  const avatarUrl = `/uploads/avatars/${fileName}`;
  
  return { avatarUrl };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: { name?: string; profileImage?: string; theme?: "light" | "dark" }
) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const changePassword = async (
  userId: string,
  data: { currentPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(
    data.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw createHttpError("Current password is incorrect", 401);
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return { message: "Password updated successfully" };
};

export const sendPasswordOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);
  
  // Set OTP to expire in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      otpCode: hashedOTP,
      otpExpiresAt: expiresAt,
    },
  });

  // TODO: Send email with OTP
  // For now, we'll log it (in production, use email service)
  console.log(`OTP for ${user.email}: ${otp}`);

  return { message: "OTP sent successfully" };
};

export const resetPasswordWithOTP = async (
  email: string,
  data: { otp: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      otpCode: true,
      otpExpiresAt: true,
    },
  });

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    throw createHttpError("No OTP requested. Please request a new OTP.", 400);
  }

  // Check if OTP is expired
  if (new Date() > user.otpExpiresAt) {
    throw createHttpError("OTP has expired. Please request a new OTP.", 400);
  }

  // Verify OTP
  const isOTPValid = await verifyOTP(data.otp, user.otpCode);

  if (!isOTPValid) {
    throw createHttpError("Invalid OTP", 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  // Update password and clear OTP
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      otpCode: null,
      otpExpiresAt: null,
    },
  });

  return { message: "Password reset successfully" };
};

export const getAllUsers = async (currentUserId: string, searchQuery?: string) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId, // Exclude current user
      },
      ...(searchQuery && {
        OR: [
          {
            name: {
              contains: searchQuery,
            },
          },
          {
            email: {
              contains: searchQuery,
            },
          },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users;
};
