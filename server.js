// Aldex SOP Hub web server (no dependencies).
// Serves the single built page, Aldex_SOP_Hub.html, and nothing else from this folder.
// Railway (and most hosts) set PORT; locally it defaults to 8795.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = Number(process.env.PORT) || 8795;
const HOST = process.env.HOST || '0.0.0.0';
const PAGE = path.join(__dirname, 'Aldex_SOP_Hub.html');

// Read and compress the page once at startup (the screenshots are embedded, so it is ~3 MB).
const html = fs.readFileSync(PAGE);
const gz = zlib.gzipSync(html, { level: 9 });

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  if (url !== '/' && url !== '/index.html' && url !== '/Aldex_SOP_Hub.html') {
    res.writeHead(302, { Location: '/' }); return res.end();
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  const useGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const body = useGzip ? gz : html;
  res.writeHead(200, Object.assign({}, HEADERS, useGzip ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}, { 'Content-Length': body.length }));
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(PORT, HOST, () => console.log('Aldex SOP Hub listening on http://' + HOST + ':' + PORT));
