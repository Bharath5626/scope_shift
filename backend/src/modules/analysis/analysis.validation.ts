import { z } from "zod";

export const runAnalysisSchema = z.object({
  projectId: z.string(),
  oldVersionId: z.string(),
  newVersionId: z.string(),
});