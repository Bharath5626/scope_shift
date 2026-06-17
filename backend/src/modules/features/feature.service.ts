import prisma from "../../config/database";

export const getFeaturesByProject = async (projectId: string, type?: string) => {
  return prisma.feature.findMany({
    where: { projectId, ...(type ? { type } : {}) },
    orderBy: { order: "asc" },
  });
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
  return prisma.feature.update({ where: { id }, data });
};

export const deleteFeature = async (id: string) => {
  return prisma.feature.delete({ where: { id } });
};

export const reorderFeatures = async (projectId: string, orderedIds: string[]) => {
  const updates = orderedIds.map((id, index) =>
    prisma.feature.update({ where: { id }, data: { order: index } })
  );
  return prisma.$transaction(updates);
};
