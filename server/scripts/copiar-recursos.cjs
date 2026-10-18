const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const output = path.join(root, 'dist');
let count = 0;
function copyResources(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const input = path.join(directory, entry.name);
    if (entry.isDirectory()) copyResources(input);
    else if (entry.isFile() && entry.name.endsWith('.json')) {
      const target = path.join(output, path.relative(source, input));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(input, target);
      count++;
    }
  }
}
if (!fs.existsSync(path.join(output, 'app.js'))) {
  throw new Error('Falta compilar el servidor antes de copiar sus recursos.');
}
copyResources(source);
const catalog = path.join(output, 'config', 'pilotCatalog.json');
if (!fs.existsSync(catalog)) throw new Error('Falta el catálogo del piloto en la compilación.');
JSON.parse(fs.readFileSync(catalog, 'utf8'));
console.log(`Recursos del servidor preparados: ${count} archivo(s) JSON.`);
