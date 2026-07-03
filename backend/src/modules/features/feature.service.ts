import prisma from "../../config/database";
import { handleDatabaseError } from "../../utils/database-errors";
import {
  logDatabaseTransactionStart,
  logDatabaseTransactionSuccess,
  logDatabaseTransactionRollback,
} from "../../utils/database-logging";
import { createAuditLog } from "../auditLogs/auditLog.service";

export const getFeaturesByProject = async (projectId: string, userId: string, type?: string) => {
  try {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        createdById: userId,
      },
    });

    if (!project) {
      const error = new Error("Project not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return prisma.feature.findMany({
      where: { projectId, ...(type ? { type } : {}) },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const addFeature = async (
  projectId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    priority: string;
    type?: string;
    order?: number;
  },
  userId: string
) => {
  try {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        createdById: userId,
      },
    });

    if (!project) {
      const error = new Error("Project not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    const count = await prisma.feature.count({ where: { projectId } });
    const feature = await prisma.feature.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        type: data.type ?? "original",
        order: data.order ?? count,
      },
    });

    // Removed individual audit log for feature addition
    // Use batch endpoint for multiple features to create single log

    return feature;
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const updateFeature = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    priority: string;
    type: string;
    order: number;
  }>,
  userId: string
) => {
  try {
    // Verify feature's project ownership
    const feature = await prisma.feature.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!feature) {
      const error = new Error("Feature not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: feature.projectId,
        createdById: userId,
      },
    });

    if (!project) {
      const error = new Error("You don't have permission to update this feature") as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    return prisma.feature.update({ where: { id }, data });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const deleteFeature = async (id: string, userId: string) => {
  try {
    // Verify feature's project ownership
    const feature = await prisma.feature.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!feature) {
      const error = new Error("Feature not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: feature.projectId,
        createdById: userId,
      },
    });

    if (!project) {
      const error = new Error("You don't have permission to delete this feature") as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    return prisma.feature.delete({ where: { id } });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const reorderFeatures = async (projectId: string, userId: string, orderedIds: string[]) => {
  const startTime = Date.now();
  logDatabaseTransactionStart('reorderFeatures', projectId);

  try {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        createdById: userId,
      },
    });

    if (!project) {
      const error = new Error("Project not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    const updates = orderedIds.map((id, index) =>
      prisma.feature.update({ where: { id }, data: { order: index } })
    );
    
    const result = await prisma.$transaction(updates);
    
    const duration = Date.now() - startTime;
    logDatabaseTransactionSuccess('reorderFeatures', projectId, duration);
    
    return result;
  } catch (error) {
    const dbError = handleDatabaseError(error);
    logDatabaseTransactionRollback('reorderFeatures', projectId, dbError.originalCode, dbError.originalMessage);
    throw dbError;
  }
};
