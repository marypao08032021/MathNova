import express from "express";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import { getAccessUrls, isLanEnabled } from "./config/network";
import syncRoutes from "./routes/syncRoutes";
import authRoutes from "./routes/authRoutes";
import proporcionalidadRoutes from "./routes/proporcionalidadRoutes";
import rampasRoutes from "./routes/rampasRoutes";
import tripulacionRoutes from "./routes/tripulacionRoutes";
import hologramaRoutes from "./routes/hologramaRoutes";
import progresoGeneralRoutes from "./routes/progresoGeneralRoutes";
import sensorRoutes from "./routes/sensorRoutes";
import nucleoRoutes from "./routes/nucleoRoutes";
import oraculoRoutes from "./routes/oraculoRoutes";
// @ts-ignore
import alumnoRoutes from "./routes/alumnoRoutes";
// @ts-ignore
import adminRoutes from "./routes/adminRoutes";
// @ts-ignore
import gruposRoutes from "./routes/grupos.routes";
// @ts-ignore Módulos JavaScript heredados que serán migrados gradualmente.
import progresoRoutes from "./routes/progreso.routes";
// @ts-ignore
import docenteAlumnosRoutes from "./routes/docenteAlumnos.routes";
// @ts-ignore
import docenteDashboardRoutes from "./routes/docenteDashboard.routes";
import docenteCalificacionesRoutes from "./routes/docenteCalificaciones.routes";
import docenteActividadesRoutes from "./routes/docenteActividades.routes";
import docenteAvanceRoutes from "./routes/docenteAvance.routes";
import docenteEstadisticasRoutes from "./routes/docenteEstadisticas.routes";
import gestionDocentesRoutes from "./routes/gestionDocentes.routes";

import pool from "./db";
// @ts-ignore Ruta administrativa validada en el servidor.
import superAdminRoutes from "./routes/superAdminRoutes";

const app = express();
const clientDistPath = process.env.CLIENT_DIST_PATH
  ? path.resolve(process.env.CLIENT_DIST_PATH)
  : path.resolve(__dirname, "../../client/dist");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
// El entorno tester utiliza los validadores reales y modelos en memoria, sin escrituras SQL.
const testerSession = require('./services/testerSession');
testerSession.installModels(require('./models'));
app.use('/api', require('./middlewares/testerMiddleware'));
app.use('/api/tester', require('./routes/testerRoutes'));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'mathnova-server', database: 'connected' });
  } catch {
    res.status(503).json({ ok: false, service: 'mathnova-server', database: 'unavailable' });
  }
});

app.get("/api/network-info", (req, res) => {
  const port = Number(req.socket.localPort || process.env.PORT || 3001);
  res.json({
    ok: true,
    lanEnabled: isLanEnabled(),
    port,
    ...getAccessUrls(port),
  });
});

// ============================================
// RUTAS
// ============================================

app.use("/api/aula", require("./routes/aulaRoutes"));
app.use("/api/avisos", require("./routes/avisosRoutes"));
app.use("/api/seguimiento", require("./routes/seguimientoRoutes"));
app.use("/api/piloto", require("./routes/pilotRoutes"));
app.use("/api", require("./middlewares/aulaMiddleware"));
app.use("/api/docente", require("./middlewares/docenteScopeMiddleware"));
app.use("/api", syncRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/proporcionalidad", proporcionalidadRoutes);
app.use("/api/progreso", progresoRoutes);
app.use("/api/rampas", rampasRoutes);
app.use("/api/tripulacion", tripulacionRoutes);
app.use("/api/holograma", hologramaRoutes);
app.use("/api/progreso-general", progresoGeneralRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/nucleo", nucleoRoutes);
app.use("/api/oraculo", oraculoRoutes);
app.use("/api/alumno", alumnoRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/docente/alumnos", docenteAlumnosRoutes);
app.use("/api/docente/dashboard", docenteDashboardRoutes);
app.use("/api/docente/calificaciones", docenteCalificacionesRoutes);
app.use("/api/docente/actividades", docenteActividadesRoutes);
app.use("/api/docente/avance-actividad", docenteAvanceRoutes);
app.use("/api/docente/estadisticas", docenteEstadisticasRoutes);
app.use("/api/docente/gestion-docentes", gestionDocentesRoutes);

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.use((req, res) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api") &&
    existsSync(path.join(clientDistPath, "index.html"))
  ) {
    res.sendFile(path.join(clientDistPath, "index.html"));
    return;
  }

  res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada",
  });
});

export default app;
