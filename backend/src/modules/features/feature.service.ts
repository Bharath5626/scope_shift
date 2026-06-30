import prisma from "../../config/database";
import { handleDatabaseError } from "../../utils/database-errors";
import {
  logDatabaseTransactionStart,
  logDatabaseTransactionSuccess,
  logDatabaseTransactionRollback,
} from "../../utils/database-logging";

export const getFeaturesByProject = async (projectId: string, type?: string) => {
  try {
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
  }
) => {
  try {
    const count = await prisma.feature.count({ where: { projectId } });
    return prisma.feature.create({
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
  }>
) => {
  try {
    return prisma.feature.update({ where: { id }, data });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const deleteFeature = async (id: string) => {
  try {
    return prisma.feature.delete({ where: { id } });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const reorderFeatures = async (projectId: string, orderedIds: string[]) => {
  const startTime = Date.now();
  logDatabaseTransactionStart('reorderFeatures', projectId);

  try {
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
