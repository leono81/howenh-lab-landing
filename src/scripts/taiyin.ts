// Taiyin en la página (docs/taiyin.md): manda la pregunta al servicio, muestra la respuesta
// mientras llega y mueve la página con las acciones que pide el modelo. Penon, Facturación y
// Productos escuchan el evento 'taiyin' y marcan detail.hecho cuando se ocupan ellos.
// Los textos de los recorridos están escritos a mano (de la página y de docs/penon-hechos.md):
// el modelo decide cuándo mostrarlos, no qué dicen.

type Msj = { rol: 'vos' | 'taiyin'; texto: string };
type Accion = { accion: string; seccion?: string; cosa?: string; organizacion?: string; interes?: string; nombre?: string };

const URL_CHAT = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://localhost:8787/chat' : 'https://taiyin.howenh-labs.com/chat';
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CORREO = 'contacto@howenh-labs.com';

const MENSAJES = {
  corte: 'De eso prefiero que te cuente el equipo. Te llevo a Hablemos.',
  rechazo: 'Eso no lo puedo responder. Si querés, te cuento del laboratorio, de Penon o de los productos.',
  muchas: `Hiciste muchas preguntas seguidas. Probá en unos minutos, o escribinos a ${CORREO}.`,
  descansa: `Taiyin está descansando. Escribinos a ${CORREO}.`,
  error: `Algo falló de mi lado. Probá de nuevo en un rato, o escribinos a ${CORREO}.`,
};

const SECCION: Record<string, string> = {
  inicio: '.hero-a',
  laboratorio: '#laboratorio',
  penon: '#penon',
  estacion: '#estacion',
  kenos: '.kenos',
  facturacion: '.facturacion',
  nosotros: '#nosotros',
  hablemos: '#contacto',
};
const KENOS = ['kenos_agenda', 'kenos_historia', 'kenos_ordenes', 'kenos_coberturas', 'kenos_reportes'];

// s: la altura de la pila de Penon (0 a 4,4, una unidad por capa); marcas: las entradas de la leyenda
const CAPAS = [
  { s: 1, marcas: [0, 1], texto: 'Abajo, la isla con sus lagos y el bosque nativo. Encima, el peligro de incendio del día en tres zonas, con datos del Servicio Meteorológico Nacional.' },
  { s: 3, marcas: [2, 3], texto: 'Después, las zonas industriales y petroleras (lo que cae ahí se rotula, no se descarta) y los rayos que registra el satélite GOES-19.' },
  { s: 4.4, marcas: [4, 5], texto: 'Arriba, lo que rodea a cada foco y los focos de calor de NASA FIRMS (LANCE). Penon no pronostica: muestra lo observado y medido.' },
];
const RECORRIDO: [string, string][] = [
  ['laboratorio', 'Howenh es un laboratorio de software e inteligencia artificial de Tierra del Fuego, con cuatro líneas de trabajo.'],
  ['penon', 'Penon: detección temprana y vigilancia satelital de incendios forestales en la isla.'],
  ['estacion', 'Una estación propia para escuchar satélites pequeños, sumada a una red abierta.'],
  ['kenos', 'Kenos: turnos, pacientes y la administración del consultorio, en un solo sistema.'],
  ['facturacion', 'Hown, Yon y Kaux: facturación y contabilidad, conectadas a ARCA.'],
  ['hablemos', 'Y acá, Hablemos: contanos qué necesitás y coordinamos una reunión.'],
];
const DESTELLO =
  '<svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="1.6" fill="currentColor"/><path d="M11.5 8H15M10.5 10.5l2.5 2.5M8 11.5V15M5.5 10.5L3 13M4.5 8H1M5.5 5.5L3 3M8 4.5V1M10.5 5.5L13 3" stroke="currentColor" stroke-width="0.9" fill="none"/></svg>';

const raiz = document.querySelector<HTMLElement>('.taiyin')!;
const lugar = raiz.parentElement!;
const campo = raiz.querySelector<HTMLInputElement>('#taiyin-campo')!;
const hoja = raiz.querySelector<HTMLElement>('.taiyin-hoja')!;
const elPregunta = hoja.querySelector<HTMLElement>('.taiyin-pregunta')!;
const elTexto = hoja.querySelector<HTMLElement>('.taiyin-texto')!;
const elPaso = hoja.querySelector<HTMLElement>('.taiyin-paso')!;
const ficha = hoja.querySelector<HTMLFormElement>('.taiyin-ficha')!;
const correo = ficha.querySelector<HTMLAnchorElement>('.taiyin-correo')!;
const copiado = ficha.querySelector<HTMLElement>('.taiyin-copiado')!;

const historial: Msj[] = [];
let ocupado = false;
let guion = new AbortController(); // lo que Taiyin está mostrando; se corta si la persona mueve la página

// ---------- mover la página ----------

const esperar = (ms: number, signal: AbortSignal) =>
  new Promise<void>((ok) => {
    const t = setTimeout(ok, ms);
    signal.addEventListener('abort', () => (clearTimeout(t), ok()), { once: true });
  });

// hasta que el scroll se asienta (o un tope, si no hubo scroll o el navegador no tiene scrollend)
const asentado = () =>
  new Promise<void>((ok) => {
    const listo = () => (clearTimeout(t), removeEventListener('scrollend', listo), ok());
    const t = setTimeout(listo, 1200);
    addEventListener('scrollend', listo);
  });

function ir(el: Element) {
  scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - 24), behavior: quieto ? 'auto' : 'smooth' });
  return asentado();
}

// la luz de carta: un marco magenta con su destello sobre lo que se muestra; se apaga si la persona mueve la página
let luces: HTMLElement[] = [];
const apagar = () => (luces.forEach((l) => l.remove()), (luces = []));
function luz(els: (Element | null | undefined)[]) {
  apagar();
  for (const el of els) {
    const r = el?.getBoundingClientRect();
    if (!r?.width) continue;
    const l = document.createElement('div');
    l.className = 'taiyin-luz';
    l.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    l.innerHTML = DESTELLO;
    document.body.append(l);
    luces.push(l);
  }
}
addEventListener('scroll', () => luces.length && apagar(), { passive: true });

const marca = (seccion: string, el: Element) => (seccion === 'hablemos' ? el.querySelector('.primario') : el.querySelector('h2, h3')) ?? el;

// le pide algo a una sección de la página; true si la sección se ocupó
function pedir(detalle: Record<string, unknown>) {
  const d = { ...detalle, hecho: false };
  dispatchEvent(new CustomEvent('taiyin', { detail: d }));
  return d.hecho;
}

function paso(cuenta: string | null, texto = '') {
  elPaso.hidden = !cuenta;
  elPaso.firstElementChild!.textContent = cuenta;
  elPaso.lastElementChild!.textContent = texto;
}

// al terminar (o al cortarse) un recorrido, el paso se va y vuelve a verse la respuesta
async function capas(signal: AbortSignal) {
  const entradas = [...document.querySelectorAll('#penon .leyenda li')];
  try {
    for (const [i, c] of CAPAS.entries()) {
      if (signal.aborted) return;
      if (pedir({ penon: c.s })) await asentado();
      else if (i === 0) await ir(document.querySelector('#penon')!); // movimiento reducido: la pila ya está armada
      paso(`Penon · ${i + 1} de ${CAPAS.length}`, c.texto);
      luz(c.marcas.map((j) => entradas[j]));
      await esperar(6000, signal);
    }
  } finally {
    paso(null);
  }
}

async function recorrido(signal: AbortSignal) {
  try {
    for (const [i, [seccion, texto]] of RECORRIDO.entries()) {
      const el = document.querySelector(SECCION[seccion]);
      if (signal.aborted) return;
      if (!el) continue;
      await ir(el);
      if (signal.aborted) return;
      paso(`${i + 1} de ${RECORRIDO.length}`, texto);
      luz([marca(seccion, el)]);
      await esperar(4500, signal);
    }
  } finally {
    paso(null);
  }
}

async function fijar(cosa: string) {
  const acto = KENOS.indexOf(cosa);
  const el = document.querySelector(acto >= 0 ? '.kenos' : '.facturacion');
  if (!el) return;
  await ir(el); // primero llegar: al entrar en pantalla, Kenos retoma su ronda
  pedir(acto >= 0 ? { kenos: acto } : { fijar: cosa });
  luz([acto >= 0 ? el.querySelectorAll('.hace li')[acto] : el.querySelector(`.fila[data-producto="${cosa}"]`)]);
}

const pedido = () => {
  const v = (k: string) => (ficha.elements.namedItem(k) as HTMLInputElement).value.trim();
  return [v('interes') && `Me interesa: ${v('interes')}.`, v('organizacion') && `Organización: ${v('organizacion')}.`, v('nombre') && `Soy ${v('nombre')}.`].filter(Boolean).join('\n');
};
function armarCorreo() {
  const cuerpo = ['Hola, quiero coordinar una reunión con Howenh Labs.', pedido()].filter(Boolean).join('\n');
  correo.href = `mailto:${CORREO}?subject=${encodeURIComponent('Reunión con Howenh Labs')}&body=${encodeURIComponent(cuerpo)}`;
}
ficha.addEventListener('input', armarCorreo);
// la agenda de Google no acepta datos por la URL (no está documentado): el pedido va al portapapeles
// y la persona lo pega en la nota de la cita. El enlace se abre igual, se copie o no.
ficha.querySelector('.primario')!.addEventListener('click', () => {
  const texto = pedido();
  if (!texto) return;
  navigator.clipboard?.writeText(texto).then(() => {
    copiado.hidden = false;
    copiado.scrollIntoView({ block: 'nearest' }); // la hoja tiene su propio scroll y la línea queda abajo
  }, () => {});
});
ficha.addEventListener('submit', (e) => e.preventDefault());

async function reunion(a: Accion) {
  for (const k of ['organizacion', 'interes', 'nombre'] as const) (ficha.elements.namedItem(k) as HTMLInputElement).value = a[k] ?? '';
  armarCorreo();
  copiado.hidden = true;
  ficha.hidden = false;
  const el = document.querySelector('#contacto');
  if (!el) return;
  await ir(el);
  luz([marca('hablemos', el)]);
}

async function hacer(a: Accion, signal: AbortSignal) {
  if (signal.aborted) return;
  switch (a.accion) {
    case 'llevar_a': {
      const el = a.seccion && document.querySelector(SECCION[a.seccion]);
      if (!el) return;
      await ir(el);
      if (a.seccion !== 'inicio') luz([marca(a.seccion!, el)]);
      return;
    }
    case 'mostrar_capas_penon':
      return capas(signal);
    case 'recorrido':
      return recorrido(signal);
    case 'fijar':
      return a.cosa ? fijar(a.cosa) : undefined;
    case 'preparar_reunion':
      return reunion(a);
  }
}

// si la persona mueve la página por su cuenta, Taiyin deja de mostrar
for (const ev of ['wheel', 'touchmove', 'keydown'])
  addEventListener(ev, (e) => raiz.contains(e.target as Node) || guion.abort(), { passive: true });

// ---------- la hoja y el acople ----------

let enHero = true;
const telefono = matchMedia('(max-width: 900px)'); // el corte de Taiyin.astro: ahí ya vive abajo, en su cuadrado
telefono.addEventListener('change', () => acoplar());
function acoplar() {
  const acoplada = !hoja.hidden && !enHero && !telefono.matches;
  if (acoplada === raiz.classList.contains('acoplada')) return;
  lugar.style.height = acoplada ? `${lugar.offsetHeight}px` : ''; // el hero no cambia de alto: nada se corre
  raiz.classList.toggle('acoplada', acoplada);
}
new IntersectionObserver(([e]) => ((enHero = e.isIntersecting), acoplar())).observe(lugar);

function cerrar() {
  guion.abort();
  apagar();
  hoja.hidden = true;
  raiz.classList.remove('abierta');
  acoplar();
}
hoja.querySelector('.taiyin-cerrar')!.addEventListener('click', cerrar);
hoja.querySelector('.taiyin-nueva')!.addEventListener('click', () => {
  historial.length = 0;
  cerrar();
  campo.focus();
});
raiz.addEventListener('keydown', (e) => e.key === 'Escape' && !hoja.hidden && (cerrar(), campo.focus()));

const decir = (texto: string) => (elTexto.textContent = texto);

// ---------- la pregunta ----------

export async function preguntar(pregunta: string) {
  const texto = pregunta.trim().slice(0, 500);
  if (!texto || ocupado) return;
  ocupado = true;
  guion.abort();
  guion = new AbortController();
  const signal = guion.signal;

  campo.value = '';
  elPregunta.textContent = texto;
  decir('');
  paso(null);
  ficha.hidden = true;
  apagar();
  hoja.hidden = false;
  raiz.classList.add('abierta');
  raiz.setAttribute('aria-busy', 'true');
  elTexto.setAttribute('aria-busy', 'true'); // el lector de pantalla lee la respuesta entera, no cada pedazo
  acoplar();

  while (historial.length > 12) historial.splice(0, 2); // las últimas seis preguntas alcanzan de contexto
  let dicho = '';
  const acciones: string[] = [];
  let cola = Promise.resolve();
  try {
    const r = await fetch(URL_CHAT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mensajes: [...historial, { rol: 'vos', texto }] }),
    });
    if (!r.ok || !r.body) throw new Error(String(r.status));
    const lector = r.body.pipeThrough(new TextDecoderStream()).getReader();
    let resto = '';
    let final = '';
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      const partes = (resto + value).split('\n\n');
      resto = partes.pop()!;
      for (const p of partes) {
        if (!p.startsWith('data: ')) continue;
        const ev = JSON.parse(p.slice(6));
        if (ev.tipo === 'texto') decir((dicho += ev.texto));
        else if (ev.tipo === 'accion') {
          acciones.push(ev.accion);
          cola = cola.then(() => hacer(ev, signal));
        } else final = ev.tipo;
      }
    }
    if (final === 'corte') {
      decir(MENSAJES.corte);
      cola.then(() => hacer({ accion: 'llevar_a', seccion: 'hablemos' }, signal));
    } else if (final === 'rechazo') {
      decir(MENSAJES.rechazo);
      historial.length = 0;
    } else if (final === 'fin') {
      historial.push({ rol: 'vos', texto }, { rol: 'taiyin', texto: dicho.trim() || `(Mostré en la página: ${acciones.join(', ')}.)` });
    } else throw new Error(final || 'cortado');
  } catch (e) {
    const estado = (e as Error).message;
    decir(estado === '429' ? MENSAJES.muchas : estado === '503' ? MENSAJES.descansa : MENSAJES.error);
  } finally {
    ocupado = false;
    raiz.removeAttribute('aria-busy');
    elTexto.removeAttribute('aria-busy');
  }
}
