// Lo que Taiyin puede hacer y lo que no puede decir. Todo puro, para probarlo sin red (reglas.test.mjs).

export const TURNOS = 8; // preguntas por conversación
export const LARGO_PREGUNTA = 500;
export const LARGO_RESPUESTA = 2000;

export const SECCIONES = ['inicio', 'laboratorio', 'penon', 'estacion', 'kenos', 'facturacion', 'nosotros', 'hablemos'];
export const COSAS = ['hown', 'yon', 'kaux', 'kenos_agenda', 'kenos_historia', 'kenos_ordenes', 'kenos_coberturas', 'kenos_reportes'];

// Las tools son de la página: el servidor contesta «hecho» y le pasa la acción al navegador.
// Listas cerradas: el modelo no puede inventar una sección ni una capa.
const tool = (name, description, properties = {}, required = []) => ({
  name,
  description,
  strict: true,
  eager_input_streaming: true,
  input_schema: { type: 'object', properties, required, additionalProperties: false },
});
const texto = (description) => ({ type: 'string', description });

export const HERRAMIENTAS = [
  tool(
    'llevar_a',
    'Lleva al visitante a una sección de la página y la marca con una luz. Usala cada vez que hables de algo que tiene su sección (el laboratorio, Penon, la estación terrena, Kenos, la facturación, Hablemos), para mostrar en vez de describir.',
    { seccion: { type: 'string', enum: SECCIONES, description: 'La sección de la página.' } },
    ['seccion'],
  ),
  tool(
    'mostrar_capas_penon',
    'Recorre Penon capa por capa en la página, con textos ya escritos (territorio, SMN, industria y petróleo, rayos, contexto y la capa satelital). Usala cuando pregunten qué es Penon o cómo funciona. No repitas lo que dicen las capas.',
  ),
  tool(
    'fijar',
    'Deja fijo en la página un producto de facturación (hown, yon, kaux) o una parte de Kenos (agenda, historia clínica, órdenes y sesiones, presentación a las coberturas, reportes). Usala cuando pregunten por ese producto o esa función.',
    { cosa: { type: 'string', enum: COSAS, description: 'Lo que se fija.' } },
    ['cosa'],
  ),
  tool(
    'recorrido',
    'El laboratorio en un minuto: un recorrido por toda la página, con textos ya escritos. Usala cuando pidan un resumen general o un recorrido, o no sepan por dónde empezar. No repitas lo que dice el recorrido.',
  ),
  tool(
    'preparar_reunion',
    'Arma el pedido de reunión para que lo mande el visitante (por la agenda o por su correo). Usala cuando quieran una reunión, una demostración, contratar algo, trabajar en Howenh o hablar con alguien. Completá solo con lo que la persona ya dijo y dejá vacío lo demás. Nunca pidas datos personales.',
    {
      organizacion: texto('Su organización o empresa, si la dijo; si no, vacío.'),
      interes: texto('Qué quiere ver o charlar, en pocas palabras.'),
      nombre: texto('Su nombre, solo si lo dijo; si no, vacío.'),
    },
    ['organizacion', 'interes', 'nombre'],
  ),
];

// lo que vuelve al modelo después de cada tool, solo si todavía no contestó (server.mjs)
const RESPONDE = 'Ahora contestá en una o dos oraciones, sin describir lo que se ve.';
export const RESULTADOS = {
  llevar_a: `Hecho: la página muestra esa sección. ${RESPONDE}`,
  mostrar_capas_penon: `Hecho: la página está recorriendo las capas con sus textos; no los repitas. ${RESPONDE}`,
  fijar: `Hecho: la página lo muestra. ${RESPONDE}`,
  recorrido: `Hecho: la página está haciendo el recorrido con sus textos; no lo repitas. ${RESPONDE}`,
  preparar_reunion: `Hecho: el visitante ve la ficha con los botones para agendar o mandar el correo. ${RESPONDE}`,
};

const objeto = (o, claves) => o !== null && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).every((k) => claves.includes(k));

// La entrada de una tool, validada (con eager_input_streaming la API no la valida). null si no sirve.
export function validarEntrada(nombre, e) {
  switch (nombre) {
    case 'llevar_a':
      return objeto(e, ['seccion']) && SECCIONES.includes(e.seccion) ? { accion: nombre, seccion: e.seccion } : null;
    case 'fijar':
      return objeto(e, ['cosa']) && COSAS.includes(e.cosa) ? { accion: nombre, cosa: e.cosa } : null;
    case 'mostrar_capas_penon':
    case 'recorrido':
      return objeto(e, []) ? { accion: nombre } : null;
    case 'preparar_reunion': {
      if (!objeto(e, ['organizacion', 'interes', 'nombre'])) return null;
      const ficha = { accion: nombre };
      for (const k of ['organizacion', 'interes', 'nombre']) {
        const v = e[k] ?? '';
        if (typeof v !== 'string' || v.length > 80) return null;
        ficha[k] = v.trim();
      }
      return ficha;
    }
  }
  return null;
}

// El pedido del navegador: { mensajes: [{ rol: 'vos' | 'taiyin', texto }] }, alternados, empezando
// y terminando por el visitante. Devuelve los mensajes limpios o null.
// ponytail: el historial viene del navegador y se podría falsear (poner palabras en boca de Taiyin);
// lo frena el filtro de salida. Firmarlo con HMAC si eso pasa a importar.
export function validarPedido(cuerpo) {
  const m = cuerpo?.mensajes;
  if (!Array.isArray(m) || m.length % 2 === 0 || m.length > 2 * TURNOS - 1) return null;
  const limpios = [];
  for (const [i, x] of m.entries()) {
    const rol = i % 2 === 0 ? 'vos' : 'taiyin';
    if (x?.rol !== rol || typeof x.texto !== 'string') return null;
    const t = x.texto.trim();
    if (!t || t.length > (rol === 'vos' ? LARGO_PREGUNTA : LARGO_RESPUESTA)) return null;
    limpios.push({ rol, texto: t });
  }
  return limpios;
}

// El filtro de salida: lo que Taiyin no puede afirmar aunque el modelo se equivoque
// (docs/penon-hechos.md, docs/taiyin.md). Se mira el texto sin tildes y en minúscula.
// «no pronostica» pasa: una negación hasta 15 caracteres antes salva la palabra.
const NEGADA = String.raw`(?<!\b(?:no|ni|nunca|sin)\b[^.!?]{0,15})`;
const PROHIBIDO = [
  ['convenio', /convenio/],
  ['contrato', /\bcontrat(?:os?|ad[oa]s?|aron)\b/],
  // «secretaria» a secas no: en un consultorio hay secretarias
  ['organismo', /ministeri|subsecretari|secretaria de ambiente|manejo del fuego|ley 1579|gobierno (?:provincial|de la provincia|de tierra del fuego|fueguino)/],
  // y «¿Predecir? No» también: la negación justo después
  ['pronostico', new RegExp(NEGADA + String.raw`(?:pronostic|predic|predecir)\w*(?![,;:?!. ]{1,3}no\b)`)],
  ['garantia', new RegExp(NEGADA + String.raw`garantiz`)],
  // «en segundos» solo si es una promesa («avisa en segundos»), no si repite la pregunta
  ['latencia', /\d+\s*(?:segundos?|seg)\b|\b(?!30\b)\d+\s*minutos?\b|(?:detect|avis|alert|lleg|aparec)\w*[^.!?]{0,20}\ben (?:pocos )?(?:segundos|minutos)|tiempo real|al instante/],
  ['metrica', /\d+(?:[.,]\d+)?\s*%/],
  ['precio', /\$\s?\d|\b(?:usd|u\$s|dolares)\b/],
  ['vinculante', /vinculante/],
  ['ciudad', /rio grande/],
  ['cliente', /\bcenit\b/],
];
const plano = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// el nombre de la regla que rompe el texto, o null
export function filtrar(s) {
  const t = plano(s);
  return PROHIBIDO.find(([, re]) => re.test(t))?.[0] ?? null;
}

// ponytail: límite por IP en memoria y por contenedor; se pierde al reiniciar. Si hay más de un
// contenedor, pasarlo a Redis.
export function limitador(tope, ventanaMs) {
  const vistos = new Map();
  return (ip, ahora = Date.now()) => {
    const recientes = (vistos.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
    if (recientes.length >= tope) {
      vistos.set(ip, recientes);
      return false;
    }
    recientes.push(ahora);
    vistos.set(ip, recientes);
    if (vistos.size > 10_000) for (const [k, ts] of vistos) if (ts.every((t) => ahora - t >= ventanaMs)) vistos.delete(k);
    return true;
  };
}
