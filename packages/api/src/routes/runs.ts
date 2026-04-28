import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPrisma } from '../db.js';
import type { CreateRunBody, EvalResponse } from '../types.js';

export function registerRunRoutes(fastify: FastifyInstance): void {
  const prisma = getPrisma();

  /**
   * POST /api/runs
   * Forwards a batch of tests to eva-run and returns the assigned test_ids.
   */
  fastify.post(
    '/api/runs',
    async (
      request: FastifyRequest<{ Body: CreateRunBody }>,
      reply: FastifyReply,
    ) => {
      const { evaRunUrl, tests } = request.body;

      if (!Array.isArray(tests) || tests.length === 0) {
        return reply.status(400).send({ error: 'tests array must not be empty' });
      }

      const baseUrl =
        evaRunUrl ??
        process.env.EVA_RUN_URL ??
        'http://localhost:3000';

      const url = `${baseUrl}/eval`;

      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tests),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return reply.status(502).send({ error: `Cannot reach eva-run: ${message}` });
      }

      if (!res.ok) {
        const text = await res.text();
        return reply.status(res.status).send({ error: text });
      }

      const data = (await res.json()) as EvalResponse;

      return {
        run_id: tests[0].run_id,
        test_ids: data.test_ids,
      };
    },
  );

  /**
   * GET /api/runs
   * Returns a list of distinct run_ids with aggregate pass/fail counts.
   */
  fastify.get('/api/runs', async () => {
    const rows = await prisma.testResult.groupBy({
      by: ['run_id'],
      _count: { id: true },
      _min: { started_at: true },
      orderBy: { _min: { started_at: 'desc' } },
    });

    const runIds = rows.map((r) => r.run_id);

    if (runIds.length === 0) {
      return { runs: [] };
    }

    // Fetch pass counts in one query
    const passCounts = await prisma.testResult.groupBy({
      by: ['run_id'],
      where: { run_id: { in: runIds }, passed: true },
      _count: { id: true },
    });

    const passMap = new Map(passCounts.map((r) => [r.run_id, r._count.id]));

    const runs = rows.map((r) => {
      const total = r._count.id;
      const passed = passMap.get(r.run_id) ?? 0;
      return {
        run_id: r.run_id,
        total,
        passed,
        failed: total - passed,
        pass_rate: total > 0 ? passed / total : 0,
        started_at: r._min.started_at,
      };
    });

    return { runs };
  });

  /**
   * GET /api/runs/:run_id
   * Returns aggregate stats and the list of TestResult rows for a run.
   */
  fastify.get(
    '/api/runs/:run_id',
    async (request: FastifyRequest<{ Params: { run_id: string } }>) => {
      const { run_id } = request.params;

      const [tests, total, passed] = await Promise.all([
        prisma.testResult.findMany({
          where: { run_id },
          orderBy: { started_at: 'asc' },
        }),
        prisma.testResult.count({ where: { run_id } }),
        prisma.testResult.count({ where: { run_id, passed: true } }),
      ]);

      return {
        run_id,
        total,
        passed,
        failed: total - passed,
        pass_rate: total > 0 ? passed / total : 0,
        tests,
      };
    },
  );

  /**
   * GET /api/runs/:run_id/tests/:test_id/asserts
   * Returns all AssertResult rows for a specific test.
   */
  fastify.get(
    '/api/runs/:run_id/tests/:test_id/asserts',
    async (
      request: FastifyRequest<{ Params: { run_id: string; test_id: string } }>,
    ) => {
      const { test_id } = request.params;

      const asserts = await prisma.assertResult.findMany({
        where: { test_id },
        orderBy: { started_at: 'asc' },
      });

      return { asserts };
    },
  );
}
