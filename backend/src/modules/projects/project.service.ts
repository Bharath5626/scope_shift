import prisma from "../../config/database";
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

export const createProject = async (
  data: {
    name: string;
    description?: string;
    type: string;
    deadline?: string;
  },
  userId: string
) => {
  if (!data.name || !data.type) {
    throw new Error("Missing required fields");
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    const today = new Date();

    // reset time for fair comparison
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      throw new Error("Deadline cannot be in the past");
    }
  }

  return prisma.project.create({
    data: {
      ...data,
      createdById: userId,
    },
  });
};

export const getProjects = async () => {
  const projects = await prisma.project.findMany({
    include: {
      createdBy: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Promise.all(projects.map(syncProjectStatus));
};
export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      features: true,
      analyses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) return null;

  return syncProjectStatus(project);
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

export const getAnalyzedProjects = async () => {
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
};