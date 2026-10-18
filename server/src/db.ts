import { Pool } from 'pg';
import { getDatabaseOptions } from './config/databaseOptions';

const pool = new Pool(getDatabaseOptions());
pool.on('error', () => console.error('Una conexión PostgreSQL del pool falló.'));
export = pool;
