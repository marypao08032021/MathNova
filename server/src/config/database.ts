import { Sequelize } from 'sequelize';
import { getDatabaseOptions } from './databaseOptions';

const options = getDatabaseOptions();
export const sequelize = new Sequelize(options.connectionString, {
  dialect: 'postgres', logging: false,
  dialectOptions: { ssl: options.ssl },
  pool: { max: 5, min: 0, acquire: 10000, idle: 10000 }
});
export default sequelize;
