import {useState} from "react";
import { NavLink } from "react-router-dom";
import type { AdminPage } from "../AdminLayout/AdminLayout";
import logoMathNova from "../../../assets/logo_MathNova.png";

type AdminSidebarProps = {
  activePage: AdminPage;
  isOpen: boolean;
};

function AdminSidebar({ activePage, isOpen }: AdminSidebarProps) {
  const [expanded,setExpanded]=useState(true);
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
      <NavLink className="brand brand-image-link" to="/dashboard-administrador" aria-label="MathNova">
  <img className="brand-image" src={logoMathNova} alt="MathNova" />
</NavLink>

      <nav className="nav" aria-label="Navegación principal">
        <NavLink className={`nav-item ${activePage === "dashboard" ? "active" : ""}`} to="/dashboard-administrador">
          <svg><use href="#i-home" /></svg><span>Dashboard principal</span>
        </NavLink>

        <NavLink className={"nav-item "+(activePage==="users"?"active":"")} to="/admin/superusuario"><span>Superusuario · cuentas y registros</span></NavLink>
        <div className={"nav-section "+(expanded?"open":"")}>
          <button className="nav-item section-toggle" type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>
            <svg><use href="#i-users" /></svg><span>Gestión académica</span><svg className="chevron"><use href="#i-chevron" /></svg>
          </button>
          <div className="submenu">
            <NavLink className={activePage === "groups" ? "submenu-active" : ""} to="/admin/grupos">
              <svg><use href="#i-group" /></svg>Grupos y cursos
            </NavLink>
            <NavLink className={activePage === "activities" ? "submenu-active" : ""} to="/admin/actividades">
              <svg><use href="#i-edit" /></svg>Actividades
            </NavLink>
            <NavLink className={activePage === "activities" ? "submenu-active" : ""} to="/admin/actividades">
              <svg><use href="#i-file" /></svg>Evaluaciones
            </NavLink>
          </div>
        </div>

        <NavLink className={`nav-item ${activePage === "resources" ? "resource-active" : ""}`} to="/admin/recursos">
          <svg><use href="#i-folder" /></svg><span>Recursos</span>
        </NavLink>
        <NavLink className={`nav-item ${activePage === "reports" ? "report-active" : ""}`} to="/admin/reportes">
          <svg><use href="#i-chart" /></svg><span>Reportes</span>
        </NavLink>
        <NavLink className={`nav-item ${activePage === "requests" ? "request-active" : ""}`} to="/admin/solicitudes">
          <svg><use href="#i-calendar" /></svg><span>Solicitudes</span>
        </NavLink>
        <NavLink className={`nav-item ${activePage === "settings" ? "settings-active" : ""}`} to="/admin/configuracion">
          <svg><use href="#i-settings" /></svg><span>Configuración</span>
        </NavLink>
      </nav>

      <div className="profile-card">
        <div className="avatar avatar-large"><span></span></div>
        <div><strong>Administrador</strong><small>Super Administrador</small></div>
        <svg><use href="#i-arrow" /></svg>
      </div>
    </aside>
  );
}

export default AdminSidebar;
