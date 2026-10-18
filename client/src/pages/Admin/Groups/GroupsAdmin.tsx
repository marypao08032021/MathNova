import AdminLayout from '../AdminLayout/AdminLayout';
import Superusuario from '../Superusuario/Superusuario';
export default function GroupsAdmin(){return <AdminLayout activePage="groups"><Superusuario embedded title="Grupos y cursos" matches='grupo|curso|inscrip|alumno_grupo' /></AdminLayout>}
