import { Router } from "express";
import * as controller from "./analysis.controller";
import { validate } from "../../middlewares/error.middleware";
import { runAnalysisSchema } from "./analysis.validation";
import { runAnalysis } from "./analysis.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     AnalysisRun:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         projectId:
 *           type: string
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     FeatureChange:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         analysisRunId:
 *           type: string
 *         featureId:
 *           type: string
 *         changeType:
 *           type: string
 *         impactScore:
 *           type: number
 *         explanation:
 *           type: string
 *     Risk:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         analysisRunId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         severity:
 *           type: string
 *     Recommendation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         analysisRunId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         analysisRunId:
 *           type: string
 *         reportType:
 *           type: string
 *         summary:
 *           type: string
 *         generatedAt:
 *           type: string
 *           format: date-time
 *     RunAnalysisInput:
 *       type: object
 *       required: [projectId]
 *       properties:
 *         projectId:
 *           type: string
 */

/**
 * @swagger
 * /api/analysis/run:
 *   post:
 *     summary: Run analysis for a project
 *     tags:
 *       - Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RunAnalysisInput'
 *     responses:
 *       201:
 *         description: Analysis run created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AnalysisRun'
 *                 aiResult:
 *                   type: object
 *                   properties:
 *                     featureChanges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FeatureChange'
 *                     risks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Risk'
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Recommendation'
 *                     report:
 *                       $ref: '#/components/schemas/Report'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/run",
  validate(runAnalysisSchema),
  runAnalysis
);

router.get(
  "/:id/report",
  controller.getReportByAnalysisId
);

router.get(
  "/:id/risks",
  controller.getRisksByAnalysisId
);

router.get(
  "/:id/recommendations",
  controller.getRecommendationsByAnalysisId
);

router.get(
  "/:id/changes",
  controller.getChangesByAnalysisId
);
router.get(
  "/run/:id",
  controller.getAnalysisRunDetails
);
/**
 * @swagger
 * /api/analysis/project/{projectId}:
 *   get:
 *     summary: Get analysis runs for a project
 *     tags:
 *       - Analysis
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of analysis runs with associated data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       analysisRun:
 *                         $ref: '#/components/schemas/AnalysisRun'
 *                       featureChanges:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/FeatureChange'
 *                       risks:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Risk'
 *                       recommendations:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Recommendation'
 *                       reports:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Report'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/project/:projectId",
  controller.getAnalysisRuns
);

export default router;