import path from 'node:path';
import dotenv from 'dotenv';

export function getDatabaseOptions() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Falta DATABASE_URL en server/.env.');
  let url: URL;
  try { url = new URL(databaseUrl); } catch { throw new Error('DATABASE_URL no es una URL válida.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('MathNova local requiere PostgreSQL.');
  const flag = String(process.env.DB_SSL ?? '').toLowerCase();
  const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname);
  const ssl = ['false', '0'].includes(flag) ? false : ['true', '1'].includes(flag) ? { rejectUnauthorized: false } : local ? false : { rejectUnauthorized: false };
  // Evitar que sslmode de la URL contradiga DB_SSL explícito.
  if (flag) url.searchParams.delete('sslmode');
  return { connectionString: url.toString(), ssl, connectionTimeoutMillis: 10000 };
}
