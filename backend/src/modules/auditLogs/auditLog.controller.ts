import { Request, Response } from "express";
import { createAuditLog, getAuditLogsByProjectId } from "./auditLog.service";

export const getProjectAuditLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('Fetching audit logs for projectId:', id);
    console.log('Full req.params:', req.params);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const auditLogs = await getAuditLogsByProjectId(id, req.user!.id);

    console.log('Found audit logs:', auditLogs.length);

    // Log each audit log's features for debugging
    auditLogs.forEach((log: any, idx) => {
      console.log(`Log ${idx + 1} (${log.action}):`, {
        hasFeatures: !!log.features,
        featuresLength: log.features ? (Array.isArray(log.features) ? log.features.length : 'not array') : 'null/undefined',
        featuresSample: log.features && Array.isArray(log.features) && log.features.length > 0 ? log.features[0] : null
      });
    });

    res.json({
      success: true,
      data: auditLogs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};
