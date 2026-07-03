import prisma from "../../config/database";
import {
  handleDatabaseError,
  getDatabaseErrorStatusCode,
  type DatabaseError
} from "../../utils/database-errors";
import {
  logDatabaseTransactionStart,
  logDatabaseTransactionSuccess,
  logDatabaseTransactionRollback,
  logDatabaseError,
} from "../../utils/database-logging";
import { createAuditLog, detectChanges } from "../auditLogs/auditLog.service";

const syncProjectStatus = async (project: any) => {
  if (
    project.deadline &&
    new Date(project.deadline) < new Date() &&
    project.status !== "completed"
  ) {
    return prisma.project.update({
      where: { id: project.id },
      data: { status: "completed" },
    });
  }

  return project;
};

export const createProjectWithFeatures = async (
  data: {
    name: string;
    description?: string | null;
    type: string;

    startDate?: string;
    deadline?: string;

    teamSize: number;
    techStack?: string | null;
     projectType?: string | null;
    methodology?: string | null;
    workingHours?: number | null;
    logo?: string | null;
  },
  userId: string,
  features?: Array<{
    title: string;
    description?: string;
    category: string;
    priority: string;
    type?: string;
  }>
) => {
  const startTime = Date.now();
  logDatabaseTransactionStart('createProjectWithFeatures');

  try {
    if (!data.name || !data.type) {
      throw new Error("Missing required fields");
    }

    let startDate: Date | undefined = undefined;
    let deadlineDate: Date | undefined = undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.startDate) {
      startDate = new Date(data.startDate);

      if (startDate < today) {
        throw new Error("Start date cannot be in the past");
      }
    }

    if (data.deadline) {
      deadlineDate = new Date(data.deadline);

      if (deadlineDate < today) {
        throw new Error("Deadline cannot be in the past");
      }

      if (startDate && deadlineDate < startDate) {
        throw new Error("Deadline cannot be earlier than start date");
      }
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create project
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,

          startDate,
          deadline: deadlineDate,

          teamSize: data.teamSize,
          techStack: data.techStack,
           projectType: data.projectType,

          methodology: data.methodology,
          workingHours: data.workingHours,
          logo: data.logo,

          createdById: userId,
        },
      });

      // Create features if provided
      if (features && features.length > 0) {
        const featureData = features.map((feature, index) => ({
          projectId: project.id,
          title: feature.title,
          description: feature.description,
          category: feature.category,
          priority: feature.priority,
          type: feature.type ?? "original",
          order: index,
        }));

        await tx.feature.createMany({
          data: featureData,
        });
      }

      // Create audit log with feature snapshot
      await createAuditLog({
        projectId: project.id,
        action: "created",
        description: `Project "${data.name}" was created`,
        userId,
        features: features || [],
      });

      return project;
    });

    const duration = Date.now() - startTime;
    logDatabaseTransactionSuccess('createProjectWithFeatures', result.id, duration);

    return result;
  } catch (error) {
    const dbError = handleDatabaseError(error);
    logDatabaseTransactionRollback('createProjectWithFeatures', undefined, dbError.originalCode, dbError.originalMessage);
    throw dbError;
  }
};

export const createProject = async (
  data: {
    name: string;
    description?: string | null;
    type: string;

    startDate?: string;
    deadline?: string;

    teamSize: number;
    techStack?: string | null;
     projectType?: string | null;
    methodology?: string | null;
    workingHours?: number | null;
    logo?: string | null;
  },
  userId: string
) => {
  try {
    if (!data.name || !data.type) {
      throw new Error("Missing required fields");
    }

    let startDate: Date | undefined = undefined;
    let deadlineDate: Date | undefined = undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.startDate) {
      startDate = new Date(data.startDate);

      if (startDate < today) {
        throw new Error("Start date cannot be in the past");
      }
    }

    if (data.deadline) {
      deadlineDate = new Date(data.deadline);

      if (deadlineDate < today) {
        throw new Error("Deadline cannot be in the past");
      }

      if (startDate && deadlineDate < startDate) {
        throw new Error("Deadline cannot be earlier than start date");
      }
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,

        startDate,
        deadline: deadlineDate,

        teamSize: data.teamSize,
        techStack: data.techStack,
         projectType: data.projectType,

        methodology: data.methodology,
        workingHours: data.workingHours,
        logo: data.logo,

        createdById: userId,
      },
    });

    // Fetch features for snapshot
    const features = await prisma.feature.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" },
    });

    // Create audit log for project creation with feature snapshot
    await createAuditLog({
      projectId: project.id,
      action: "created",
      description: `Project "${data.name}" was created`,
      userId,
      features,
    });

    return project;
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getProjects = async (userId: string) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Promise.all(projects.map(syncProjectStatus));
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getProjectById = async (id: string, userId: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!project) return null;

    // Check ownership
    if (project.createdById !== userId) {
      return null;
    }

    return syncProjectStatus(project);
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const updateProject = async (
  id: string,
  data: Partial<{
    name: string
    description: string
    type: string
    status: string
    startDate: string
    deadline: string
    teamSize: number
    techStack: string
    projectType: string
    methodology: string
    workingHours: number
    logo: string
  }>,
  userId?: string
) => {
  try {
    // Get the existing project to detect changes and check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Check ownership if userId is provided
    if (userId && existingProject.createdById !== userId) {
      const error = new Error("You don't have permission to update this project") as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    // Convert date strings to Date objects if provided
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.deadline !== undefined) updateData.deadline = new Date(data.deadline);
    if (data.teamSize !== undefined) updateData.teamSize = data.teamSize;
    if (data.techStack !== undefined) updateData.techStack = data.techStack;
    if (data.projectType !== undefined) updateData.projectType = data.projectType;
    if (data.methodology !== undefined) updateData.methodology = data.methodology;
    if (data.workingHours !== undefined) updateData.workingHours = data.workingHours;
    if (data.logo !== undefined) updateData.logo = data.logo;

    // Detect changes
    const changes = detectChanges(existingProject, updateData);

    // Only update and create audit log if there are actual changes
    if (Object.keys(changes).length === 0) {
      return existingProject; // No changes, return existing project
    }

    // Update the project
    const updatedProject = await prisma.project.update({ where: { id }, data: updateData });

    // Fetch current features for snapshot
    const features = await prisma.feature.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    // Create audit log if userId is provided
    if (userId) {
      await createAuditLog({
        projectId: id,
        action: "updated",
        description: `Project was updated`,
        changes,
        userId,
        features,
      });
    }

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw handleDatabaseError(error);
  }
};

export const deleteProject = async (id: string, userId: string) => {
  try {
    // First check if project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!project) {
      const error = new Error("Project not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    if (project.createdById !== userId) {
      const error = new Error("You don't have permission to delete this project") as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    return prisma.project.delete({ where: { id } });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getAnalyzedProjects = async (userId: string) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        createdById: userId,
        analyses: { some: {} },
      },
      include: {
        createdBy: { select: { name: true } },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            scopeScore: true,
            complexityScore: true,
            additionalHours: true,
            estimatedWeeks: true,
            riskLevel: true,
            complexityLevel: true,
            createdAt: true,
            // Include legacy fields for backward compatibility
            scopeIncreasePercent: true,
            delayWeeks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(projects.map(syncProjectStatus));
  } catch (error) {
    throw handleDatabaseError(error);
  }
};