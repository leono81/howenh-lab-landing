// Taiyin: el agente de la página de Howenh Labs (docs/taiyin.md).
// POST /chat con { mensajes } y responde por SSE: texto, accion, corte, rechazo, error y fin.
// No guarda conversaciones: el contenido no se escribe en ningún lado, ni en el log.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import { HERRAMIENTAS, RESULTADOS, validarEntrada, validarPedido, filtrar, limitador } from './reglas.mjs';

const PUERTO = +(process.env.PORT ?? 8787);
const ORIGENES = (process.env.TAIYIN_ORIGENES ?? 'https://howenh-labs.com').split(',').map((s) => s.trim());
const leerMd = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const SISTEMA = `${leerMd('./instrucciones.md')}\n\n${leerMd('./conocimiento.md')}`;
const VUELTAS = 4; // llamadas al modelo por pregunta (texto → tool → texto)

const client = new Anthropic();
const pasa = limitador(+(process.env.TAIYIN_LIMITE ?? 20), 10 * 60_000); // preguntas cada 10 minutos por IP
// lo único que se registra: cantidades, sin contenido (GET /salud)
const cuentas = {
  desde: new Date().toISOString(),
  pedidos: 0,
  errores: 0,
  rechazos: 0,
  cortes: {},
  tokens: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
};

const leer = (req, tope) =>
  new Promise((ok, mal) => {
    let s = '';
    req.setEncoding('utf8');
    req.on('data', (c) => ((s += c).length > tope ? (mal(new Error('grande')), req.destroy()) : null));
    req.on('end', () => ok(s));
    req.on('error', mal);
  });

// ponytail: detrás de un solo proxy (Traefik de Coolify), la IP real es la última de X-Forwarded-For
// (la que agregó el proxy; las de antes las puede inventar el cliente). Con Cloudflare adelante, usar CF-Connecting-IP.
const ipDe = (req) => (req.headers['x-forwarded-for']?.split(',').at(-1) ?? req.socket.remoteAddress ?? '').trim();

async function conversar(historial, enviar, signal) {
  const messages = historial.map((m) => ({ role: m.rol === 'vos' ? 'user' : 'assistant', content: m.texto }));
  let dicho = '';
  for (let vuelta = 0; vuelta < VUELTAS; vuelta++) {
    const stream = client.beta.messages.stream(
      {
        model: 'claude-sonnet-5-5',
        max_tokens: 2000,
        output_config: { effort: 'low' }, // chat: a lo sumo piensa en lo difícil
        // si Sonnet 5.5 rechaza por un clasificador, la API reintenta con otro modelo
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: SISTEMA, cache_control: { type: 'ephemeral' } }],
        tools: HERRAMIENTAS,
        messages,
      },
      { signal },
    );
    let cortado = null;
    let primero = true;
    stream.on('text', (delta) => {
      if (cortado) return;
      // lo que dice después de una tool va en otra línea, no pegado a la frase anterior
      if (primero && dicho && !/\s$/.test(dicho)) delta = `\n${delta}`;
      primero = false;
      dicho += delta;
      // los últimos caracteres esperan al delta que sigue: «Predecir» puede seguir con «, no»
      cortado = filtrar(dicho.slice(0, -10));
      if (!cortado) return enviar({ tipo: 'texto', texto: delta });
      cortar(cortado);
      stream.abort();
    });
    const cortar = (regla) => {
      cuentas.cortes[regla] = (cuentas.cortes[regla] ?? 0) + 1;
      enviar({ tipo: 'corte' });
    };
    let msj;
    try {
      msj = await stream.finalMessage();
    } catch (e) {
      if (cortado || signal.aborted) return;
      throw e;
    }
    // y al final, el texto entero (antes de ejecutar nada)
    if ((cortado = filtrar(dicho))) return cortar(cortado);
    for (const k of ['input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens']) cuentas.tokens[k] += msj.usage?.[k] ?? 0;
    if (msj.stop_reason === 'refusal') {
      cuentas.rechazos++;
      return enviar({ tipo: 'rechazo' });
    }
    const usos = msj.content.filter((b) => b.type === 'tool_use');
    // max_tokens con una tool a medias: no se ejecuta
    if (msj.stop_reason !== 'tool_use' || !usos.length) break;
    const resultados = usos.map((u) => {
      const accion = validarEntrada(u.name, u.input);
      if (!accion) return { type: 'tool_result', tool_use_id: u.id, is_error: true, content: JSON.stringify({ INVALID_JSON: JSON.stringify(u.input) }) };
      enviar({ tipo: 'accion', ...accion });
      return { type: 'tool_result', tool_use_id: u.id, content: RESULTADOS[u.name] };
    });
    // las tools son de la página y su resultado es «hecho»: si ya contestó y todas sirvieron, no
    // hace falta otra vuelta al modelo (la mitad de tiempo y de costo). Solo vuelve si no dijo nada
    // o si una tool vino mal y tiene que corregirla.
    if (dicho.trim() && resultados.every((r) => !r.is_error)) break;
    messages.push({ role: 'assistant', content: msj.content });
    messages.push({ role: 'user', content: resultados });
  }
  enviar({ tipo: 'fin' });
}

http
  .createServer(async (req, res) => {
    const origen = req.headers.origin;
    const permitido = ORIGENES.includes(origen);
    const cerrar = (codigo) => res.writeHead(codigo).end();
    if (permitido) res.setHeader('Access-Control-Allow-Origin', origen), res.setHeader('Vary', 'Origin');

    if (req.method === 'GET' && req.url === '/salud') return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(cuentas));
    if (req.method === 'OPTIONS') {
      if (!permitido) return cerrar(403);
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'content-type');
      res.setHeader('Access-Control-Max-Age', '86400');
      return cerrar(204);
    }
    if (req.method !== 'POST' || req.url !== '/chat') return cerrar(404);
    if (!permitido) return cerrar(403); // frena a otros sitios, no a un script: para eso están el límite y el tope de gasto
    if (process.env.TAIYIN_APAGADO === '1') return cerrar(503);
    if (!pasa(ipDe(req))) return cerrar(429);

    let mensajes;
    try {
      mensajes = validarPedido(JSON.parse(await leer(req, 32_000)));
    } catch {}
    if (!mensajes) return cerrar(400);

    cuentas.pedidos++;
    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' });
    const enviar = (o) => res.write(`data: ${JSON.stringify(o)}\n\n`);
    const corte = new AbortController();
    res.on('close', () => res.writableFinished || corte.abort()); // el visitante cerró: no seguir gastando
    try {
      await conversar(mensajes, enviar, corte.signal);
    } catch (e) {
      cuentas.errores++;
      // solo el tipo de error, nunca el contenido
      console.error('error', e instanceof Anthropic.APIError ? `${e.status} ${e.error?.error?.type ?? ''}` : e?.name);
      if (!corte.signal.aborted) enviar({ tipo: 'error' });
    }
    res.end();
  })
  .listen(PUERTO, () => console.log(`taiyin en :${PUERTO}, orígenes ${ORIGENES.join(' ')}`));
