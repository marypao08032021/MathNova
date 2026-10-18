import {getAuthToken} from './authSession';
export async function avisosApi(path:string,init:RequestInit={}){const r=await fetch('/api/avisos'+path,{...init,headers:{Authorization:`Bearer ${getAuthToken()}`,'Content-Type':'application/json',...init.headers}});const d=await r.json();if(!r.ok)throw Error(d.mensaje||'No se pudo consultar el servidor.');return d;}
