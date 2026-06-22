import { z } from "zod";

const projectTypeEnum = z.enum(["landing_page", "chatbot", "saas", "ecommerce"]);
const projectStatusEnum = z.enum(["draft", "active", "completed", "at_risk"]);

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: projectTypeEnum,
  deadline: z.string().optional(),
  status: projectStatusEnum.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: projectTypeEnum.optional(),
  deadline: z.string().optional(),
  status: projectStatusEnum.optional(),
});
