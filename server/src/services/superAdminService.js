const crypto = require('node:crypto');
const quote = value => '"' + String(value).replaceAll('"','""') + '"';
const safeRow = row => Object.fromEntries(Object.entries(row).filter(([key]) => !/password|contrasena|token|secret|clave/i.test(key)));
async function metadata(db) {
 const tables=(await db.query(`SELECT t.table_name,COALESCE(array_agg(k.column_name::text ORDER BY k.ordinal_position) FILTER(WHERE k.column_name IS NOT NULL),'{}') AS pk FROM information_schema.tables t LEFT JOIN information_schema.table_constraints c ON c.table_schema=t.table_schema AND c.table_name=t.table_name AND c.constraint_type='PRIMARY KEY' LEFT JOIN information_schema.key_column_usage k ON k.constraint_schema=c.constraint_schema AND k.constraint_name=c.constraint_name AND k.table_name=t.table_name WHERE t.table_schema='public' AND t.table_type='BASE TABLE' GROUP BY t.table_name ORDER BY t.table_name`)).rows;
 const fks=(await db.query(`SELECT child.relname AS child,parent.relname AS parent,cn.nspname AS child_schema,array_agg(ca.attname::text ORDER BY i.n) AS child_cols,array_agg(pa.attname::text ORDER BY i.n) AS parent_cols FROM pg_constraint f JOIN pg_class child ON child.oid=f.conrelid JOIN pg_class parent ON parent.oid=f.confrelid JOIN pg_namespace cn ON cn.oid=child.relnamespace JOIN pg_namespace pn ON pn.oid=parent.relnamespace CROSS JOIN LATERAL generate_subscripts(f.conkey,1) AS i(n) JOIN pg_attribute ca ON ca.attrelid=child.oid AND ca.attnum=f.conkey[i.n] JOIN pg_attribute pa ON pa.attrelid=parent.oid AND pa.attnum=f.confkey[i.n] WHERE f.contype='f' AND pn.nspname='public' GROUP BY f.oid,child.relname,parent.relname,cn.nspname`)).rows;
 return {tables,fks};
}
const tableFor=(meta,name)=>{const t=meta.tables.find(t=>t.table_name===name);if(!t||!t.pk.length||['mathnova_admin_auditoria','mathnova_configuracion'].includes(name))throw Error('Tabla no disponible para edición o eliminación.');return t;};
function keysFor(t,key){if(!key||typeof key!=='object'||Array.isArray(key)||Object.keys(key).length!==t.pk.length||!t.pk.every(k=>['string','number','boolean'].includes(typeof key[k])))throw Error('Identificador de registro inválido.');return t.pk.map(k=>key[k]);}
const where=(columns)=>columns.map((c,i)=>`${quote(c)}=$${i+1}`).join(' AND ');
async function planDeletion(db,meta,name,key,actor){
 const nodes=[],seen=new Set();const walk=async(table,key,depth)=>{
  if(depth>30||seen.size>=2000)throw Error('La operación es demasiado grande; elimina primero conjuntos menores.');
  const t=tableFor(meta,table),values=keysFor(t,key),identity=table+JSON.stringify(values);if(seen.has(identity))return;seen.add(identity);
  const row=(await db.query(`SELECT * FROM public.${quote(table)} WHERE ${where(t.pk)}`,values)).rows[0];if(!row){if(!depth)throw Error('El registro ya no existe.');return;}
  if(table==='registro'&&String(row.id_usuario)===String(actor))throw Error('No puedes eliminar tu propia cuenta activa.');
  for(const fk of meta.fks.filter(f=>f.parent===table)){
   const matches=(await db.query(`SELECT * FROM ${quote(fk.child_schema)}.${quote(fk.child)} WHERE ${where(fk.child_cols)} LIMIT 2001`,fk.parent_cols.map(k=>row[k]))).rows;
   if(matches.length>2000)throw Error('Hay demasiados registros vinculados; reduce la operación.');
   if(matches.length&&fk.child_schema!=='public')throw Error('Hay dependencias fuera de public; requiere revisión de base de datos.');
   for(const child of matches){const ct=tableFor(meta,fk.child);await walk(fk.child,Object.fromEntries(ct.pk.map(k=>[k,child[k]])),depth+1);}
  }
  nodes.push({table,key:Object.fromEntries(t.pk.map(k=>[k,row[k]])),row});
 };
 await walk(name,key,0);
 const deletingAdmins=nodes.filter(n=>n.table==='registro'&&['admin','administrador'].includes(n.row.rol)&&n.row.estado).length;
 if(deletingAdmins){const total=Number((await db.query(`SELECT COUNT(*) AS n FROM public.registro WHERE rol IN ('admin','administrador') AND estado=true`)).rows[0].n);if(total-deletingAdmins<1)throw Error('Debe conservarse al menos un administrador activo.');}
 const normalized=nodes.map(({table,key,row})=>({table,key,row})).sort((a,b)=>JSON.stringify([a.table,a.key]).localeCompare(JSON.stringify([b.table,b.key])));
 const hash=crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
 return {nodes,hash,summary:Object.entries(nodes.reduce((a,n)=>({...a,[n.table]:(a[n.table]||0)+1}),{})).map(([table,count])=>({table,count}))};
}
module.exports={metadata,tableFor,keysFor,where,quote,safeRow,planDeletion};
