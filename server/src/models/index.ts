import { sequelize } from '../config/database';
import Student from './Student';
import SyncLog from './SyncLog';
import User from './User';
import Estudiante from './Estudiante';
import Teacher from './Teacher';
import Admin from './Admin';
import ProporcionalidadInversa from './ProporcionalidadInversa';
import ActividadRampas from './ActividadRampas';
import ActividadTripulacion from './ActividadTripulacion';
import ActividadHolograma from './ActividadHolograma';
import ActividadSensor from './ActividadSensor';
import ActividadNucleo from './ActividadNucleo';
import ActividadOraculo from './ActividadOraculo';

User.hasOne(Estudiante, { foreignKey: 'id_usuario' });
Estudiante.belongsTo(User, { foreignKey: 'id_usuario' });

User.hasOne(Teacher, { foreignKey: 'id_usuario' });
Teacher.belongsTo(User, { foreignKey: 'id_usuario' });

User.hasOne(Admin, { foreignKey: 'id_usuario' });
Admin.belongsTo(User, { foreignKey: 'id_usuario' });

// La actividad referencia registro, no usuario. No redefinir esa FK con User.

export {
  sequelize,
  Student,
  SyncLog,
  User,
  Estudiante,
  Teacher,
  Admin,
  ProporcionalidadInversa,
  ActividadRampas,
  ActividadTripulacion,
  ActividadHolograma,
  ActividadSensor,
  ActividadNucleo,
  ActividadOraculo,
};

export const initDb = async (force = false): Promise<void> => {
  if (force) throw new Error('No se permite recrear tablas durante el arranque de la base recuperada.');
  await sequelize.authenticate();
  console.log('Conexión PostgreSQL verificada. El esquema recuperado no se sincroniza automáticamente.');
};
