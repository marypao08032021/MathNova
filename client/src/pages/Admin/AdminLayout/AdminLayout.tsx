import {type ReactNode,useState} from 'react';
import AdminIcons from '../components/AdminIcons';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import './AdminLayout.css';
import './AdminTheme.css';
import AdminWelcome from '../components/AdminWelcome';
export type AdminPage='users'|'dashboard'|'groups'|'activities'|'resources'|'reports'|'requests'|'settings';
export default function AdminLayout({activePage,children,shellClassName=''}:{activePage:AdminPage;children:ReactNode;shellClassName?:string}){const[open,setOpen]=useState(false);return <div className="admin-root"><AdminIcons/><div className={'app-shell '+shellClassName}><AdminSidebar activePage={activePage} isOpen={open}/><div className="main-wrap"><AdminTopbar onMenuClick={()=>setOpen(true)}/><AdminWelcome page={activePage}/>{children}<footer>© MathNova. Todos los derechos reservados.</footer></div></div><button className={'sidebar-backdrop '+(open?'visible':'')} type="button" aria-label="Cerrar menú" onClick={()=>setOpen(false)}/></div>}
