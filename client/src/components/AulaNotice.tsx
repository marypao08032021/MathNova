import type useAulaAccess from '../hooks/useAulaAccess';
import '../styles/aula.css';
export default function AulaNotice({aula,mundo}:{aula:ReturnType<typeof useAulaAccess>;mundo:string}){
 const items=aula.actividades.filter(a=>a.mundo===mundo);const abiertas=items.filter(a=>a.permitida).length;
 return <aside className="mn-aula-notice" aria-label="Acceso docente"><strong>{aula.loading?'Comprobando tus permisos…':`${abiertas} de ${items.length||8} misiones habilitadas`}</strong><p>{aula.error||(!abiertas?items[0]?.motivo:'Tu docente decide qué actividades puedes realizar según la planeación.')||'Regístrate y espera a que tu docente te asigne un grupo y habilite sus actividades.'}</p><button type="button" onClick={aula.refresh}>Actualizar acceso</button></aside>;
}
