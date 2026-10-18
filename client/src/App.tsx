import LiveClassroom from './pages/Seguimiento/LiveClassroom';
import CuentaPage from "./pages/Seguimiento/CuentaPage";
import AyudaDocente from "./pages/Seguimiento/AyudaDocente";
import MathNovaShell from "./components/MathNovaShell";
import AvisosDocente from "./pages/AvisosDocente/AvisosDocente";
import AulaDocente from "./pages/AulaDocente/AulaDocente";
import Superusuario from "./pages/Admin/Superusuario/SuperusuarioPage";
import TesterBanner from "./components/TesterBanner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "./routes/RequireAuth";
import {
  getSessionUser,
  hasAuthSession,
  isGuestSession,
} from "./utils/authSession";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno";
import Feedback from "./pages/Feedback/Feedback";
import SeleccionMundos from "./pages/SeleccionMundos/SeleccionMundos";
import Recompensas from "./pages/Recompensas/Recompensas";
import Estadisticas from "./pages/Estadisticas/Estadisticas";

import ActividadesMathGeometry from "./pages/ActividadesMathGeometry/ActividadesMathGeometry";
import Actividad1MathGeometry from "./pages/ActividadesMathGeometry/Actividad1MathGeometry";
import Actividad2MathGeometry from "./pages/ActividadesMathGeometry/Actividad2MathGeometry";
import Actividad3MathGeometry from "./pages/ActividadesMathGeometry/Actividad3MathGeometry";
import Actividad4MathGeometry from "./pages/ActividadesMathGeometry/Actividad4MathGeometry";
import Actividad5MathGeometry from "./pages/ActividadesMathGeometry/Actividad5MathGeometry";
import Actividad6MathGeometry from "./pages/ActividadesMathGeometry/Actividad6MathGeometry";
import Actividad7MathGeometry from "./pages/ActividadesMathGeometry/Actividad7MathGeometry";
import Actividad8MathGeometry from "./pages/ActividadesMathGeometry/Actividad8MathGeometry";

import ActividadesMathData from "./pages/ActividadesMathData/ActividadesMathData";
import GeneradorEnergiaInversa from "./pages/ActividadesMathData/GeneradorEnergiaInversa";
import RampasDeLanzamiento from "./pages/ActividadesMathData/RampasDeLanzamiento";
import EncuestaTripulacion from "./pages/ActividadesMathData/EncuestaTripulacion";
import HologramaReportes from "./pages/ActividadesMathData/HologramaReportes";
import SensorFrecuencias from "./pages/ActividadesMathData/SensorFrecuencias";
import NucleoDecisiones from "./pages/ActividadesMathData/NucleoDecisiones";
import OraculoEstacion from "./pages/ActividadesMathData/OraculoEstacion";
import SalaTresCaminos from "./pages/ActividadesMathData/SalaTresCaminos";

import ActividadesMathNumbers from "./pages/ActividadesMathNumbers/ActividadesMathNumbers";
import MathNumbersActivityRouter from "./pages/MathNumbersActivities/MathNumbersActivityRouter";

import DashboardDocente from "./pages/DashboardDocente/DashboardDocente";
import MisGruposDocente from "./pages/MisGruposDocente/MisGruposDocente";
import CrearGrupoDocente from "./pages/CrearGrupoDocente/CrearGrupoDocente";
import AdministrarAlumnosDocente from "./pages/AdministrarAlumnosDocente/AdministrarAlumnosDocente";
import ListaAlumnosDocente from "./pages/ListaAlumnosDocente/ListaAlumnosDocente";
import CalificacionesDocente from "./pages/CalificacionesDocente/CalificacionesDocente";
import GestionDocentes from "./pages/GestionDocentes/GestionDocentes";
import RetroalimentacionDocente from "./pages/RetroalimentacionDocente/RetroalimentacionDocente";
import EvaluacionesDocente from "./pages/EvaluacionesDocente/EvaluacionesDocente";
import EstadisticasDocente from "./pages/EstadisticasDocente/EstadisticasDocente";
import AvanceActividadDocente from "./pages/AvanceActividadDocente/AvanceActividadDocente";

import DashboardAdmin from "./pages/Admin/Dashboard/DashboardAdmin";
import GroupsAdmin from "./pages/Admin/Groups/GroupsAdmin";
import ActivitiesAdmin from "./pages/Admin/Activities/ActivitiesAdmin";
import ResourcesAdmin from "./pages/Admin/Resources/ResourcesAdmin";
import ReportsAdmin from "./pages/Admin/Reports/ReportsAdmin";
import RequestsAdmin from "./pages/Admin/Requests/RequestsAdmin";
import SettingsAdmin from "./pages/Admin/Settings/SettingsAdmin";

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

const normalizarRol = (rol?: string, roleId?: number | string) => {
  const valor = String(rol || "")
    .toLowerCase()
    .trim();
  const idRol = Number(roleId);

  if (
    [
      "docente_estudiante",
      "docente-estudiante",
      "docente-alumno",
      "docente_alumno",
      "maestro_estudiante",
      "maestro-estudiante",
      "mixto",
    ].includes(valor)
  ) {
    return "docente_estudiante";
  }

  if (["alumno", "student", "usuario", "estudiante"].includes(valor)) {
    return "estudiante";
  }

  if (["admin", "administrador"].includes(valor)) {
    return "admin";
  }

  if (["docente", "profesor", "maestro"].includes(valor)) {
    return "docente";
  }

  if (idRol === 1) return "docente";
  if (idRol === 2) return "estudiante";
  if (idRol === 3) return "admin";
  if (idRol === 4) return "docente_estudiante";

  return "";
};

const obtenerRutaInicial = () => {
  const tieneSesion = hasAuthSession();
  const esInvitado = isGuestSession();

  if (!tieneSesion && !esInvitado) {
    return "/login";
  }

  if (esInvitado && !tieneSesion) {
    return "/dashboard";
  }

  const usuario = getSessionUser() as SessionUser | null;

  if (!usuario) {
    return "/login";
  }

  const rolUsuario = normalizarRol(
    usuario.rol || usuario.role || usuario.tipo_usuario,
    usuario.role_id || usuario.roleId || usuario.id_rol,
  );

  if (rolUsuario === "admin") {
    return "/dashboard-admin";
  }

  if (rolUsuario === "docente" || rolUsuario === "docente_estudiante") {
    return "/dashboard-docente";
  }

  return "/dashboard";
};

function StartupRedirect() {
  return <Navigate to={obtenerRutaInicial()} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <TesterBanner/>
      <MathNovaShell><Routes>
        <Route path="/" element={<StartupRedirect />} />
        <Route path="/monitor-aula" element={<RequireAuth rolesPermitidos={["docente","admin"]}><LiveClassroom/></RequireAuth>}/>
        <Route path="/login" element={<Login />} />
<Route path="/cuenta" element={<RequireAuth rolesPermitidos={["estudiante","docente","admin"]}><CuentaPage/></RequireAuth>}/>
<Route path="/configuracion" element={<RequireAuth rolesPermitidos={["estudiante","docente","admin"]}><CuentaPage/></RequireAuth>}/>
<Route path="/solicitudes-ayuda" element={<RequireAuth rolesPermitidos={["docente","admin"]}><AyudaDocente/></RequireAuth>}/>
        <Route path="/avisos-docente" element={<RequireAuth rolesPermitidos={["docente","admin"]}><AvisosDocente/></RequireAuth>}/>

        <Route
          path="/dashboard"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]} permitirInvitado>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/seleccion-mundos"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]} permitirInvitado>
              <SeleccionMundos />
            </RequireAuth>
          }
        />

        <Route
          path="/perfil-alumno"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <PerfilAlumno />
            </RequireAuth>
          }
        />

        <Route
          path="/estadisticas"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Estadisticas />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data/rampas-lanzamiento"
          element={
            <RequireAuth>
              <RampasDeLanzamiento />
            </RequireAuth>
          }
        />
        <Route
          path="/actividades-math-data/encuesta-tripulacion"
          element={
            <RequireAuth>
              <EncuestaTripulacion />
            </RequireAuth>
          }
        />
<Route
  path="/actividades-math-data/holograma-reportes"
  element={
    <RequireAuth>
      <HologramaReportes />
    </RequireAuth>
  }
/>

<Route
  path="/actividades-math-data/sensor-frecuencias"
  element={
    <RequireAuth>
      <SensorFrecuencias />
    </RequireAuth>
  }
/>

<Route
  path="/actividades-math-data/nucleo-decisiones"
  element={
    <RequireAuth>
      <NucleoDecisiones />
    </RequireAuth>
  }
/>

<Route
  path="/actividades-math-data/oraculo-estacion"
  element={
    <RequireAuth>
      <OraculoEstacion />
    </RequireAuth>
  }
/>

<Route
  path="/actividades-math-data/sala-tres-caminos"
  element={
    <RequireAuth>
      <SalaTresCaminos />
    </RequireAuth>
  }
/>
        <Route
          path="/retroalimentacion"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Feedback />
            </RequireAuth>
          }
        />

        <Route
          path="/recompensas"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Recompensas />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]} permitirInvitado>
              <ActividadesMathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-1"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad1MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-2"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad2MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-3"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad3MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-4"
          element={<Actividad4MathGeometry />}
        />

        <Route
          path="/actividades/geometria/actividad-5"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad5MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-6"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad6MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-7"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad7MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/geometria/actividad-8"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <Actividad8MathGeometry />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]} permitirInvitado>
              <ActividadesMathData />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-data/generador-energia"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <GeneradorEnergiaInversa />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-math-numbers"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]} permitirInvitado>
              <ActividadesMathNumbers />
            </RequireAuth>
          }
        />

        <Route
          path="/temas/numeros"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]} permitirInvitado>
              <ActividadesMathNumbers />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades/mathnumbers/:activitySlug"
          element={
            <RequireAuth rolesPermitidos={["estudiante"]}>
              <MathNumbersActivityRouter />
            </RequireAuth>
          }
        />

        <Route
          path="/docente"
          element={<Navigate to="/dashboard-docente" replace />}
        />

        <Route
          path="/dashboard-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <DashboardDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/mis-grupos-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <MisGruposDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/crear-grupo-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <CrearGrupoDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/administrar-alumnos-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <AdministrarAlumnosDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/lista-alumnos-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <ListaAlumnosDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/calificaciones-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <CalificacionesDocente />
            </RequireAuth>
          }
        />
        <Route
          path="/gestion-docentes"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <GestionDocentes />
            </RequireAuth>
          }
        />

        <Route
          path="/actividades-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <AulaDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/retroalimentacion-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <RetroalimentacionDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/evaluaciones-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <EvaluacionesDocente />
            </RequireAuth>
          }
        />

        <Route
          path="/estadisticas-docente"
          element={
            <RequireAuth rolesPermitidos={["docente"]}>
              <EstadisticasDocente />
            </RequireAuth>
          }
        />
        <Route
          path="/avance-actividad-docente"
          element={<AvanceActividadDocente />}
        />

        <Route path="/admin/superusuario" element={<RequireAuth rolesPermitidos={["admin"]}><Superusuario/></RequireAuth>}/>
        <Route path="/admin/usuarios" element={<RequireAuth rolesPermitidos={["admin"]}><Superusuario/></RequireAuth>}/>
        <Route
          path="/admin"
          element={<Navigate to="/dashboard-admin" replace />}
        />

        <Route
          path="/dashboard-admin"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <DashboardAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard-administrador"
          element={<Navigate to="/dashboard-admin" replace />}
        />

        <Route
          path="/admin/grupos"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <GroupsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/actividades"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <ActivitiesAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/recursos"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <ResourcesAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <ReportsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/solicitudes"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <RequestsAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/configuracion"
          element={
            <RequireAuth rolesPermitidos={["admin"]}>
              <SettingsAdmin />
            </RequireAuth>
          }
        />

        <Route path="*" element={<StartupRedirect />} />
      </Routes></MathNovaShell>
    </BrowserRouter>
  );
}

export default App;