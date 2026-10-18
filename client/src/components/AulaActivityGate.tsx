import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import useAulaAccess from '../hooks/useAulaAccess';
import '../styles/aula.css';
export default function AulaActivityGate({codigo,children}:{codigo:string;children:ReactNode}){
 const aula=useAulaAccess();const activity=aula.actividades.find(a=>a.codigo===codigo);
 if(aula.loading)return <main className="mn-aula mn-aula-lock" role="status"><h1>Comprobando acceso…</h1></main>;
 if(activity?.permitida)return <>{children}</>;
 return <main className="mn-aula mn-aula-lock"><span>MathNova · Acceso a la misión</span><h1>{activity?.titulo||'Actividad no disponible'}</h1><p>{aula.error||activity?.motivo||'Necesitas una cuenta, un grupo y la autorización de tu docente.'}</p><p>Puedes seguir explorando los mundos. Tus intentos guardados se conservan.</p><div className="mn-aula-actions"><Link to="/seleccion-mundos">Volver a los mundos</Link><button onClick={aula.refresh}>Comprobar de nuevo</button></div></main>;
}
