import prisma from "../../config/database";

export const createProject = async (
  data: {
    userId: string;
    name: string;
    description?: string;
  }
) => {
  return prisma.project.create({
    data,
  });
};

export const getProjects = async () => {
  return prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { id },
  });
};
export const deleteProject = async (id: string) => {
  return prisma.project.delete({
    where: {
      id,
    },
  });
};