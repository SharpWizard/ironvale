// Ironvale asset baker server.
// usage: node tools/server.js   then open http://127.0.0.1:8770/tools/bake.html
// Serves the project folder and receives baked models, writing models/<pack>.js
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const packs = {};
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      if (url === '/out') {
        const m = JSON.parse(body);
        (packs[m.pack] || (packs[m.pack] = {}))[m.name] = m.data;
        res.end('ok');
      } else if (url === '/finish') {
        fs.mkdirSync(path.join(ROOT, 'models'), { recursive: true });
        const sizes = {};
        for (const p in packs) {
          const js = 'IV_PACK(' + JSON.stringify(p) + ',' + JSON.stringify(packs[p]) + ');\n';
          fs.writeFileSync(path.join(ROOT, 'models', p + '.js'), js);
          sizes[p] = (js.length / 1048576).toFixed(2) + 'MB/' + Object.keys(packs[p]).length;
        }
        console.log('written', sizes);
        res.end(JSON.stringify(sizes));
      } else { res.statusCode = 404; res.end(); }
    });
    return;
  }
  const f = path.join(ROOT, url);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(f)] || 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
}).listen(8770, '127.0.0.1', () => console.log('baker on http://127.0.0.1:8770/tools/bake.html'));
