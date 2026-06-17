import prisma from "../../config/database";

export const createProject = async (data: {
  name: string;
  description?: string;
  type: string;
  status?: string;
}) => {
  return prisma.project.create({ data });
};

export const getProjects = async () => {
  return prisma.project.findMany({ orderBy: { createdAt: "desc" } });
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({ where: { id } });
};

export const updateProject = async (
  id: string,
  data: Partial<{ name: string; description: string; type: string; status: string }>
) => {
  return prisma.project.update({ where: { id }, data });
};

export const deleteProject = async (id: string) => {
  return prisma.project.delete({ where: { id } });
};
