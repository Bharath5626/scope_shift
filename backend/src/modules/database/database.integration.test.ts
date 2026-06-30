/**
 * Integration tests for database transaction safety.
 * Tests atomic operations, rollback behavior, and error handling.
 */

import prisma from '../../config/database';
import { createProjectWithFeatures } from '../projects/project.service';
import { createAnalysis } from '../analysis/analysis.service';
import { addFeature } from '../features/feature.service';
import { 
  handleDatabaseError, 
  DatabaseError,
  getDatabaseErrorStatusCode 
} from '../../utils/database-errors';

describe('Database Transaction Safety Integration Tests', () => {
  let testUserId: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.analysis.deleteMany({});
    await prisma.feature.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Project Creation with Features Transaction', () => {
    it('should create project without features', async () => {
      const project = await createProjectWithFeatures(
        {
          name: 'Test Project No Features',
          type: 'web',
          teamSize: 2,
        },
        testUserId
      );

      expect(project).toBeDefined();
      testProjectId = project.id;

      // Verify no features were created
      const projectFeatures = await prisma.feature.findMany({
        where: { projectId: project.id },
      });

      expect(projectFeatures).toHaveLength(0);
    });

    it('should handle invalid data gracefully', async () => {
      await expect(
        createProjectWithFeatures(
          {
            name: '', // Invalid: empty name
            type: 'web',
            teamSize: 2,
          },
          testUserId
        )
      ).rejects.toThrow();
    });
  });

  describe('Analysis Persistence', () => {
    it('should save analysis with basic metrics', async () => {
      if (!testProjectId) {
        const project = await createProjectWithFeatures(
          {
            name: 'Analysis Test Project',
            type: 'web',
            teamSize: 2,
          },
          testUserId
        );
        testProjectId = project.id;
      }

      const analysisData = {
        projectId: testProjectId,
        // Legacy fields
        scopeIncreasePercent: 10,
        additionalHours: 50,
        delayWeeks: 2,
        riskLevel: 'Medium',
      };

      const analysis = await createAnalysis(analysisData);

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
    });

    it('should update project status to active after analysis', async () => {
      if (!testProjectId) {
        const project = await createProjectWithFeatures(
          {
            name: 'Status Test Project',
            type: 'web',
            teamSize: 2,
          },
          testUserId
        );
        testProjectId = project.id;
      }

      // Create an analysis to trigger status update
      await createAnalysis({
        projectId: testProjectId,
        riskLevel: 'Medium',
      });

      const project = await prisma.project.findUnique({
        where: { id: testProjectId },
      });

      expect(project?.status).toBe('active');
    });
  });

  describe('Duplicate Analysis Prevention', () => {
    it('should prevent duplicate analyses with same feature set', async () => {
      // Create a new project for this test
      const project = await createProjectWithFeatures(
        {
          name: 'Duplicate Test Project',
          type: 'web',
          teamSize: 2,
        },
        testUserId
      );

      const featureEstimates = [
        { feature: 'Feature A', complexity: 'Medium', estimatedHours: 40 },
        { feature: 'Feature B', complexity: 'Simple', estimatedHours: 20 },
      ];

      const analysisData = {
        projectId: project.id,
        featureEstimates,
        riskLevel: 'Medium',
      };

      // First analysis should succeed
      const analysis1 = await createAnalysis(analysisData);
      expect(analysis1).toBeDefined();

      // Second analysis with same feature estimates should return the existing one
      // due to application-level duplicate check
      const analysis2 = await createAnalysis(analysisData);
      expect(analysis2.id).toBe(analysis1.id);
    });

    it('should prevent concurrent duplicate analysis creation', async () => {
      // Create a new project for this test
      const project = await createProjectWithFeatures(
        {
          name: 'Concurrency Test Project',
          type: 'web',
          teamSize: 2,
        },
        testUserId
      );

      const featureEstimates = [
        { feature: 'Feature X', complexity: 'High', estimatedHours: 60 },
        { feature: 'Feature Y', complexity: 'Medium', estimatedHours: 30 },
      ];

      const analysisData = {
        projectId: project.id,
        featureEstimates,
        riskLevel: 'High',
      };

      // Fire multiple concurrent requests
      const promises = Array.from({ length: 10 }, () => createAnalysis(analysisData));

      const results = await Promise.allSettled(promises);

      // All should succeed (either by creating or returning existing)
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBe(10);

      // All should return the same analysis ID
      const analysisIds = successful.map(r => (r as PromiseFulfilledResult<any>).value.id);
      const uniqueIds = new Set(analysisIds);
      expect(uniqueIds.size).toBe(1);

      // Verify only one analysis exists in database
      const analyses = await prisma.analysis.findMany({
        where: { projectId: project.id },
      });
      expect(analyses.length).toBe(1);
    });
  });

  describe('Database Error Handling', () => {
    it('should handle record not found error', async () => {
      // Try to delete a non-existent project
      const deleteError = await prisma.project.delete({
        where: { id: 'non-existent-id-12345' },
      }).catch(e => e);

      const dbError = handleDatabaseError(deleteError);
      // Check that the error was handled and has a message
      expect(dbError).toBeInstanceOf(DatabaseError);
      expect(dbError.message).toBeDefined();
    });

    it('should map error codes to correct HTTP status codes', async () => {
      const duplicateError = handleDatabaseError(new Error('P2002'));
      expect(getDatabaseErrorStatusCode(duplicateError)).toBe(409);

      const notFoundError = handleDatabaseError(new Error('P2025'));
      expect(getDatabaseErrorStatusCode(notFoundError)).toBe(404);

      const foreignKeyError = handleDatabaseError(new Error('P2003'));
      expect(getDatabaseErrorStatusCode(foreignKeyError)).toBe(400);

      const timeoutError = handleDatabaseError(new Error('P1008'));
      expect(getDatabaseErrorStatusCode(timeoutError)).toBe(503);
    });
  });

  describe('No Partial Writes', () => {
    it('should not leave orphan features', async () => {
      // Find any features without valid project references
      // This is handled by cascade delete in the schema
      const allFeatures = await prisma.feature.findMany({
        include: {
          project: true,
        },
      });

      const orphanFeatures = allFeatures.filter(f => !f.project);
      expect(orphanFeatures).toHaveLength(0);
    });

    it('should not leave orphan analyses', async () => {
      // Find any analyses without valid project references
      // This is handled by cascade delete in the schema
      const allAnalyses = await prisma.analysis.findMany({
        include: {
          project: true,
        },
      });

      const orphanAnalyses = allAnalyses.filter(a => !a.project);
      expect(orphanAnalyses).toHaveLength(0);
    });
  });

  describe('Feature Operations with Error Handling', () => {
    it('should handle invalid feature data', async () => {
      await expect(
        addFeature('invalid-project-id', {
          title: 'Test',
          category: 'core',
          priority: 'high',
        })
      ).rejects.toThrow();
    });
  });
});
