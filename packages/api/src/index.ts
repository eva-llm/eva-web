import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRunRoutes } from './routes/runs.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

await fastify.register(cors, {
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
});

fastify.get('/health', async () => ({ status: 'ok' }));

registerRunRoutes(fastify);

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3001);
    const address = await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`eva-web API running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

await start();
