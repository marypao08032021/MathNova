import {getAuthToken} from './authSession';
export function installAulaTransport(){const original=window.fetch.bind(window);window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
 const url=new URL(input instanceof Request?input.url:String(input),location.href);
 if(url.origin===location.origin&&url.pathname.startsWith('/api/')){
  const headers=new Headers(init?.headers||(input instanceof Request?input.headers:undefined));const token=getAuthToken();if(token&&!headers.has('Authorization'))headers.set('Authorization','Bearer '+token);
  const r=await original(input,{...init,headers});if(r.status===403&&!url.pathname.startsWith('/api/aula/'))window.dispatchEvent(new Event('mathnova-permisos-change'));return r;
 }return original(input,init);
};}
