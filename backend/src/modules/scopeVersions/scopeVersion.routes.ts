import { Router } from "express";
import * as controller from "./scopeVersion.controller";
import { validate } from "../../middlewares/error.middleware";
import { createScopeVersionSchema } from "./scopeVersion.validation";
import { createScopeVersion } from "./scopeVersion.controller";
import { verifyToken } from "../../middlewares/auth.middleware";



const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *     Feature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         scopeVersionId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *     ScopeVersion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         projectId:
 *           type: string
 *         versionNumber:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *         features:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Feature'
 *     CreateScopeVersionInput:
 *       type: object
 *       required: [projectId, versionNumber, title]
 *       properties:
 *         projectId:
 *           type: string
 *         versionNumber:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         features:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 */

/**
 * @swagger
 * /api/scope-versions:
 *   post:
 *     summary: Create a new scope version for a project
 *     description: Creates a scope version and optional features for the given project.
 *     tags:
 *       - Scope Versions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScopeVersionInput'
 *     responses:
 *       201:
 *         description: Scope version created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScopeVersion'
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
  "/",
  validate(createScopeVersionSchema),
  createScopeVersion
);

/**
 * @swagger
 * /api/scope-versions/project/{projectId}:
 *   get:
 *     summary: Get scope versions for a project
 *     description: Returns a list of scope versions including features for the specified project.
 *     tags:
 *       - Scope Versions
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of scope versions
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
 *                     $ref: '#/components/schemas/ScopeVersion'
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
  controller.getScopeVersionsByProject
);

router.get(
  "/:id",
  controller.getScopeVersionById
);

router.delete(
  "/:id",
  controller.deleteScopeVersion
);

export default router;