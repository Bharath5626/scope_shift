import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AuthService from "./auth.service";

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = await AuthService.login(req.body);

    res.json({
      success: true,
      token,
    });
  }
);