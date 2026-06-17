import prisma from "../../config/database";

export const createScopeVersion = async (data: {
  projectId: string;
  versionNumber: number;
  title: string;
  description?: string;

  features?: {
    title: string;
    description?: string;
    priority?: string;
  }[];
}) => {
  const { features = [], ...scopeVersionData } = data;

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
  projectId: string
) => {
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
  id: string
) => {
  return prisma.scopeVersion.findUnique({
    where: {
      id,
    },
  });
};

export const deleteScopeVersion = async (
  id: string
) => {
  return prisma.scopeVersion.delete({
    where: {
      id,
    },
  });
};