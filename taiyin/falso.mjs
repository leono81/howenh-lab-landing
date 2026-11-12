// Solo para desarrollo: un Taiyin de mentira, sin modelo ni API key, para ver la interfaz.
// `npm run falso` y abrir la página con `npm run dev`. Elige la respuesta por palabras de la pregunta.
import http from 'node:http';

const GUION = [
  [/penon|incend|fuego/, [{ tipo: 'texto', texto: 'Penon es nuestro sistema de detección temprana de incendios forestales para Tierra del Fuego. ' }, { tipo: 'accion', accion: 'mostrar_capas_penon' }, { tipo: 'texto', texto: '¿Querés que te cuente algo más?' }]],
  [/minuto|recorr|laboratorio/, [{ tipo: 'texto', texto: 'Te muestro el laboratorio.' }, { tipo: 'accion', accion: 'recorrido' }]],
  [/reuni|kenos|clinica|clínica/, [{ tipo: 'texto', texto: 'Te preparo el pedido. Revisalo y elegí cómo mandarlo.' }, { tipo: 'accion', accion: 'preparar_reunion', organizacion: 'Clínica', interes: 'Ver Kenos', nombre: '' }]],
  [/factur|hown|celular/, [{ tipo: 'accion', accion: 'fijar', cosa: 'hown' }, { tipo: 'texto', texto: 'Sí, con Hown: le mandás un audio o un texto por Telegram y te devuelve la factura de ARCA con su PDF.' }]],
  [/convenio/, [{ tipo: 'texto', texto: 'Tenemos un conve' }, { tipo: 'corte' }]],
  [/receta/, [{ tipo: 'rechazo' }]],
  [/./, [{ tipo: 'accion', accion: 'llevar_a', seccion: 'hablemos' }, { tipo: 'texto', texto: 'Eso no lo sé; lo mejor es charlarlo con el equipo.' }]],
];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

http
  .createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
    if (req.method === 'OPTIONS') return res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'content-type' }).end();
    let s = '';
    for await (const c of req) s += c;
    const pregunta = JSON.parse(s).mensajes.at(-1).texto.toLowerCase();
    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8' });
    for (const ev of GUION.find(([re]) => re.test(pregunta))[1]) {
      if (ev.tipo === 'texto') for (const p of ev.texto.match(/.{1,6}/gs)) res.write(`data: ${JSON.stringify({ tipo: 'texto', texto: p })}\n\n`), await espera(40);
      else res.write(`data: ${JSON.stringify(ev)}\n\n`), await espera(200);
      if (ev.tipo === 'corte' || ev.tipo === 'rechazo') return res.end();
    }
    res.end(`data: ${JSON.stringify({ tipo: 'fin' })}\n\n`);
  })
  .listen(8787, () => console.log('taiyin falso en :8787'));
