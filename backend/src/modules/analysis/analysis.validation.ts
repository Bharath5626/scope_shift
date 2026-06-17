import { z } from "zod";

const riskLevelEnum = z.enum(["low", "medium", "high"]);
const complexityEnum = z.enum(["low", "medium", "high"]);

export const createAnalysisSchema = z.object({
  scopeIncreasePercent: z.number(),
  additionalHours: z.number(),
  delayWeeks: z.number(),
  riskLevel: riskLevelEnum,
  complexity: complexityEnum,
});
