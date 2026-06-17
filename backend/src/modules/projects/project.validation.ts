import { z } from "zod";

export const createProjectSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
});