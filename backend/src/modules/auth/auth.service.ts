import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { env } from "../../config/env";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw createHttpError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

 if (!user) {
  throw createHttpError("Email is not registered", 404);
}

const isPasswordValid = await bcrypt.compare(
  data.password,
  user.password
);

if (!isPasswordValid) {
  throw createHttpError("Incorrect password", 401);
}

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
  };
};