import { z } from "zod";

const priorityEnum = z.enum(["low", "medium", "high"]);
const featureTypeEnum = z.enum(["original", "new"]);

export const createFeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  priority: priorityEnum,
  type: featureTypeEnum.optional(),
  order: z.number().int().optional(),
});

export const updateFeatureSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: priorityEnum.optional(),
  type: featureTypeEnum.optional(),
  order: z.number().int().optional(),
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()),
});
