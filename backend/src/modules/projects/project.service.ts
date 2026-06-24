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
};

export const getProjects = async () => {
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
};
export const getProjectById = async (id: string) => {
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
};

export const updateProject = async (
  id: string,
  data: Partial<{ name: string; description: string; type: string; status: string;  startDate: Date;deadline: Date; }>
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