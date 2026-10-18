import AdminLayout from '../AdminLayout/AdminLayout';
import Superusuario from '../Superusuario/Superusuario';
export default function ResourcesAdmin(){return <AdminLayout activePage="resources"><p className="mn-super-message">Registra el enlace al archivo o video. Puedes organizar los recursos en colecciones y cambiar su estado de publicación.</p><Superusuario embedded title="Recursos y colecciones" matches='^mathnova_(recursos|colecciones)$' /></AdminLayout>}
