import AdminLayout from '../AdminLayout/AdminLayout';
import Superusuario from '../Superusuario/Superusuario';
export default function RequestsAdmin(){return <AdminLayout activePage="requests"><p className="mn-super-message">Crea solicitudes, tickets o incidencias. En Editar puedes asignar una cuenta, cambiar el estado y registrar la resolución.</p><Superusuario embedded title="Solicitudes e incidencias" matches='^mathnova_solicitudes$' /></AdminLayout>}
