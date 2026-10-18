import app from './app';
import { initDb } from './models';
import dotenv from 'dotenv';
import type { Server } from 'http';
import {
  findAvailablePort,
  getAccessUrls,
  getServerHost,
} from './config/network';

dotenv.config();

const DEFAULT_PORT = Number(process.env.PORT) || 3001;

export const startServer = async (): Promise<Server> => {
  const host = process.env.HOST || getServerHost();
  const port = await findAvailablePort(DEFAULT_PORT, host, process.env.PORT_STRICT === "true" ? 1 : 20);
  process.env.PORT = String(port);

  await initDb();
  if (!process.env.JWT_SECRET?.trim()) throw new Error('Falta JWT_SECRET.');

  const server = app.listen(port, host, () => {
    const urls = getAccessUrls(port);
    console.log(`🚀 MathNova disponible en ${urls.local}`);
    for (const network of urls.lan) {
      console.log(`🌐 Red local (${network.name}): ${network.address}`);
    }
  });

  return server;
};

if (require.main === module) {
  startServer()
    .then((server) => {
      const shutdown = (signal: string) => {
        console.log(`Cerrando MathNova (${signal})...`);
        server.close(() => process.exit(0));
      };

      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch(error => {
      console.error('Fatal error starting MathNova server:', error);
      process.exit(1);
    });
}
