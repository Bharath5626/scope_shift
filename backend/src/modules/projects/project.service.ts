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

    return prisma.project.create({
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
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
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

export const getProjectById = async (id: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        features: true,
        analyses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) return null;

    return syncProjectStatus(project);
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const updateProject = async (
  id: string,
  data: Partial<{ name: string; description: string; type: string; status: string;  startDate: Date;deadline: Date; }>
) => {
  try {
    return prisma.project.update({ where: { id }, data });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const deleteProject = async (id: string) => {
  try {
    return prisma.project.delete({ where: { id } });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getAnalyzedProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
      where: { analyses: { some: {} } },
      include: {
        createdBy: { select: { name: true } },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(projects.map(syncProjectStatus));
  } catch (error) {
    throw handleDatabaseError(error);
  }
};