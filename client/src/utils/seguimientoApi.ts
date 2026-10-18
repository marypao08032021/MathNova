import {getAuthToken} from './authSession';
export async function seguimientoApi(path:string,init:RequestInit={}){const r=await fetch('/api/seguimiento'+path,{...init,headers:{Authorization:`Bearer ${getAuthToken()}`,'Content-Type':'application/json',...init.headers},cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.mensaje||'No se pudo completar la operación.');return d;}
