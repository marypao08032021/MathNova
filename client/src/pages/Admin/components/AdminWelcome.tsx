import type {AdminPage} from '../AdminLayout/AdminLayout';
import hero from '../../../assets/admin-dashboard.png';
const titles:Record<AdminPage,string>={dashboard:'Centro de mando MathNova',users:'Equipo de exploradores',groups:'Grupos de aprendizaje',activities:'Misiones y aprendizajes',resources:'Biblioteca de la misión',reports:'Bitácora de resultados',requests:'Centro de seguimiento',settings:'Configuración de MathNova'};
export default function AdminWelcome({page}:{page:AdminPage}){return <section className="mn-admin-welcome"><div><span>MathNova · Superusuario</span><h2>{titles[page]}</h2><p>Acompaña el aprendizaje y administra tu comunidad escolar.</p></div><img src={hero} alt="" aria-hidden="true"/></section>}
