// Cuadros deterministas del prototipo de aves: fija el tiempo con window.__demo(t) y captura.
// uso: node cuadros.mjs <url> <carpeta> <ancho> <alto> <movil 0|1> <tiempos "1,2,3" | "video:segundos">
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url, dir, ancho, alto, movil, tiempos, puerto = '9381'] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${puerto}`, `--user-data-dir=${dir}/../perfil-${puerto}`, '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60 && !ws; i++) {
  await pausa(250);
  try {
    const t = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json();
    ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
  } catch {}
}
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const esperan = new Map();
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (esperan.has(d.id)) esperan.get(d.id)(d), esperan.delete(d.id); });
const cdp = (method, params = {}) => new Promise((r) => (esperan.set(++id, r), ws.send(JSON.stringify({ id, method, params }))));
const js = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
  return r.result?.result?.value;
};
await cdp('Emulation.setDeviceMetricsOverride', { width: +ancho, height: +alto, deviceScaleFactor: 2, mobile: movil === '1' });
await cdp('Page.enable');
await cdp('Page.navigate', { url });
await pausa(3000);
await js('document.fonts.ready.then(() => 1)');
const FPS = 30;
const video = tiempos.startsWith('video:');
const lista = video ? Array.from({ length: Math.round(+tiempos.slice(6) * FPS) }, (_, i) => i / FPS) : tiempos.split(',').map(Number);
for (let i = 0; i < lista.length; i++) {
  const t = lista[i];
  await js(`window.__demo(${t})`);
  await js('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(1))))');
  const { result } = await cdp('Page.captureScreenshot', { format: video ? 'jpeg' : 'png', quality: video ? 92 : undefined });
  writeFileSync(`${dir}/${video ? String(i).padStart(4, '0') + '.jpg' : 't' + t + '.png'}`, Buffer.from(result.data, 'base64'));
}
console.log(lista.length + ' cuadros');
ws.close();
chrome.kill();
process.exit(0);
