import { z } from "zod";

export const createScopeVersionSchema = z.object({
  projectId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  title: z.string().min(3),
  description: z.string().optional(),
  features: z.array(
  z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    priority: z.string().optional(),
  })
).optional(),
});