import prisma from "../../config/database";

type CreateAuditLogInput = {
  projectId: string;
  action: string;
  description?: string;
  changes?: Record<string, { from: any; to: any }>;
  userId?: string;
  features?: any; // Snapshot of features at the time of this log
};

export const createAuditLog = async (data: CreateAuditLogInput) => {
  console.log('createAuditLog called with:', {
    projectId: data.projectId,
    action: data.action,
    hasFeatures: !!data.features,
    featuresLength: data.features ? (Array.isArray(data.features) ? data.features.length : 'not array') : 'null/undefined',
    featuresSample: data.features && Array.isArray(data.features) && data.features.length > 0 ? data.features[0] : null
  });

  const result = await prisma.auditLog.create({
    data: {
      projectId: data.projectId,
      action: data.action,
      description: data.description,
      changes: data.changes as any,
      userId: data.userId,
      features: data.features as any,
    },
  });

  console.log('Audit log created successfully with ID:', result.id);
  return result;
};

export const getAuditLogsByProjectId = async (projectId: string) => {
  return prisma.auditLog.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to last 50 entries
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const detectChanges = (
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, { from: any; to: any }> => {
  const changes: Record<string, { from: any; to: any }> = {};
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    const oldValue = oldData[key];
    const newValue = newData[key];

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue;
    }

    // Skip internal fields
    if (key === "id" || key === "createdAt" || key === "updatedAt") {
      continue;
    }

    changes[key] = {
      from: oldValue,
      to: newValue,
    };
  }

  return changes;
};
