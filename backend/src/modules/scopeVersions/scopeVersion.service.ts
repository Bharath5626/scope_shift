import prisma from "../../config/database";

export const createScopeVersion = async (data: {
  projectId: string;
  versionNumber: number;
  title: string;
  description?: string;
  userId: string;

  features?: {
    title: string;
    description?: string;
    priority?: string;
  }[];
}) => {
  const { features = [], userId, ...scopeVersionData } = data;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      createdById: userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return prisma.scopeVersion.create({
    data: {
      ...scopeVersionData,

      features: {
        create: features,
      },
    },

    include: {
      features: true,
    },
  });
};
export const getScopeVersionsByProject = async (
  projectId: string,
  userId: string
) => {
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

  return prisma.scopeVersion.findMany({
    where: {
      projectId,
    },
    orderBy: {
      versionNumber: "asc",
    },
  });
};

export const getScopeVersionById = async (
  id: string,
  userId: string
) => {
  const scopeVersion = await prisma.scopeVersion.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        select: {
          createdById: true,
        },
      },
    },
  });

  if (!scopeVersion) {
    const error = new Error("Scope version not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Verify project ownership
  if (scopeVersion.project.createdById !== userId) {
    const error = new Error("You don't have permission to access this scope version") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  return scopeVersion;
};

export const deleteScopeVersion = async (
  id: string,
  userId: string
) => {
  const scopeVersion = await prisma.scopeVersion.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        select: {
          createdById: true,
        },
      },
    },
  });

  if (!scopeVersion) {
    const error = new Error("Scope version not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Verify project ownership
  if (scopeVersion.project.createdById !== userId) {
    const error = new Error("You don't have permission to delete this scope version") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  return prisma.scopeVersion.delete({
    where: {
      id,
    },
  });
};