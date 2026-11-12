// El albatros de ceja negra de «Desde la isla»: planea a lo largo de la costa, en los ejes isométricos
// de la maqueta del hero, con el mar grabado como allá: la orilla arriba a la izquierda, las líneas de
// agua apretadas contra ella y cada vez más separadas y tenues mar adentro, y el dibujo que se apaga en
// el papel con un contorno irregular. Prototipo, capturas y referencias en docs/design/aves/ (elegido
// en el canvas el 2026-11-12, con las fotos que pasó Leono).
//
// Mundo en metros: U a lo largo de la costa (en pantalla, arriba a la derecha), V mar adentro (abajo a
// la derecha), Z arriba; quien mira está del lado del mar, arriba (-1, 1, 1). El cuerpo es un sólido de
// anillos y se ve con su silueta real; las alas tienen la planta en banana de las fotos (la muñeca
// adelante, la mano hacia atrás), van en arco hacia abajo al planear y su tono cambia con la luz.
// El vuelo es dinámico: eses desparejas, sube al girar y baja rasante, con su sombra en el agua. La
// cámara lo sigue a lo largo de la costa: la orilla queda quieta y pasan la playa y el agua. La tierra
// es el papel, con la playa en puntos. Todo es periódico en 16 s.
//
// Corre solo mientras se ve; con movimiento reducido queda quieto en un cuadro.

type V3 = number[];
type Pt = number[];

const NS = 'http://www.w3.org/2000/svg';
const LOOP = 16;
const C = Math.cos(Math.PI / 6), S = 0.5;
const PSI0 = Math.PI; // rumbo medio: a lo largo de la costa, abajo a la izquierda, hacia quien mira
const AVANCE = 18; // metros que corre la costa por vuelta: lo que pasa se repite cada AVANCE
const VEL = AVANCE / LOOP;
const KU = (2 * Math.PI) / AVANCE;
// la orilla corre casi recta, como en la maqueta, con entrantes suaves
const orilla = (U: number) => 0.1 * Math.sin(2 * KU * U + 0.7) + 0.05 * Math.sin(5 * KU * U + 2.1) + 0.02 * Math.sin(11 * KU * U + 0.3);
// las líneas de agua de la maqueta del hero (en sus unidades), llevadas a metros desde la costa
const AGUA = [4, 9, 15, 22, 30, 39, 49, 60, 72, 87, 105, 127, 154, 186, 225, 272, 330, 400, 480].map((d) => d * 0.022);
const NIEBLA = [1, 0.55, 0.42, 0.32, 0.25, 0.2, 0.15, 0.12]; // la de la maqueta: de afuera hacia adentro
const azarDe = (i: number, c: number) => { const x = Math.sin(i * 12.9898 + c * 78.233) * 43758.5453; return x - Math.floor(x); };

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const suave = (x: number) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const f1 = (n: number) => Math.round(n * 10) / 10;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const cruz = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norma = (a: V3) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const punto = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const VISTA = norma([-1, 1, 1]);
const SOL = norma([-0.25, -0.45, 1]);
const hondo = (p: V3) => p[0] - p[1] - p[2]; // más grande: más lejos de quien mira
const ola = (t: number, f: number, fase = 0) => Math.sin((2 * Math.PI * f * t) / LOOP + fase);
const camino = (pts: Pt[], cerrar = false) => (pts.length ? 'M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + (cerrar ? 'Z' : '') : '');

interface Ejes { F: V3; L: V3; Up: V3 }
function ejes(psi: number, th: number, ph: number): Ejes {
  const F: V3 = [Math.cos(th) * Math.cos(psi), Math.cos(th) * Math.sin(psi), Math.sin(th)];
  const L0: V3 = [-Math.sin(psi), Math.cos(psi), 0];
  const U0: V3 = [-Math.sin(th) * Math.cos(psi), -Math.sin(th) * Math.sin(psi), Math.cos(th)];
  return { F, L: add(mul(L0, Math.cos(ph)), mul(U0, Math.sin(ph))), Up: add(mul(U0, Math.cos(ph)), mul(L0, -Math.sin(ph))) };
}
const amundo = (P0: V3, E: Ejes, f: number, l: number, u: number) => add(add(add(P0, mul(E.F, f)), mul(E.L, l)), mul(E.Up, u));
const normalPlano = (a: V3, b: V3, c: V3) => norma(cruz([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]));

// la planta del ala (de abajo, la de ceja negra): [s afuera, f adelante]
const AT = [[0.08, 0.07], [0.2, 0.1], [0.35, 0.135], [0.48, 0.165], [0.55, 0.162], [0.68, 0.11], [0.84, 0.01], [0.98, -0.11], [1.08, -0.21], [1.13, -0.27]];
const FU = [[1.13, -0.27], [1.06, -0.27], [0.94, -0.21], [0.8, -0.13], [0.66, -0.07], [0.52, -0.04], [0.4, -0.05], [0.25, -0.08], [0.08, -0.12]];
const FUGA = [...FU].reverse();
const SM = 0.5, PUNTA = 1.13; // la muñeca y la punta
const enBorde = (B: number[][], s: number) => {
  for (let i = 0; i < B.length - 1; i++) {
    const [s0, a] = B[i], [s1, b] = B[i + 1];
    if ((s - s0) * (s - s1) <= 0) return s1 === s0 ? a : a + ((b - a) * (s - s0)) / (s1 - s0);
  }
  return B[B.length - 1][1];
};
// el cuerpo: [f, medio ancho, medio alto, altura del centro]; cabeza redonda, pecho lleno, cola corta
const CUERPO = [[0.405, 0.018, 0.02, 0.035], [0.385, 0.042, 0.044, 0.035], [0.35, 0.052, 0.054, 0.03], [0.3, 0.05, 0.05, 0.024], [0.22, 0.072, 0.066, 0.012], [0.12, 0.106, 0.09, 0], [0.02, 0.12, 0.098, -0.006], [-0.1, 0.115, 0.09, -0.006], [-0.21, 0.096, 0.07, 0], [-0.3, 0.072, 0.048, 0.01], [-0.37, 0.05, 0.03, 0.016], [-0.41, 0.032, 0.016, 0.018]];

interface Anillo { f: number; c: V3; F: V3; L: V3; U: V3; en: (a: number) => V3; n: (a: number) => V3; sup: number; inf: number }

function estado(t: number) {
  const fi = (2 * Math.PI * 2 * t) / LOOP + 0.38 * ola(t, 1, 0.4) + 0.16 * ola(t, 3, 1.1);
  const A = 1.05 + 0.22 * ola(t, 1, 2.0);
  return { lat: A * Math.sin(fi) + 0.32 * ola(t, 1, 0.2), z: 1.12 + 0.52 * Math.sin(fi - 1.0) + 0.07 * ola(t, 5, 0.3) };
}

export function iniciar(svg: SVGSVGElement) {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, k = 1, O: Pt = [0, 0];
  const pr = (p: V3): Pt => [O[0] + k * C * (p[0] + p[1]), O[1] + k * (S * (p[1] - p[0]) - p[2])];
  const el = (tag: string, at: Record<string, string>, padre: Element = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const a in at) e.setAttribute(a, at[a]);
    padre.append(e);
    return e;
  };
  const pone = (e: Element, at: Record<string, string>) => { for (const a in at) e.setAttribute(a, at[a]); };

  let lineas: { d: number; fase: number; e: Element }[] = [];
  let olas: { i: number; largo: number; fase: number; n: number; e: Element }[] = [];
  let playa: { u: number; q: number }[] = [];
  let aguaMar: Element, costa: Element, arena: Element, sombra: Element;
  let gAves: Element;
  let alas: { g: Element; lonja: Element; borde: Element; rayas: Element }[] = [];
  let cuerpoG: { g: Element; cola: Element; contorno: Element; sombreado: Element; manto: Element; cejas: Element; pico: Element; culmen: Element };
  let DC = 4.5, uA = -20, uB = 20;

  // el contorno del apagado: un rectángulo redondeado que ondula a lo largo de su borde (las ondas se
  // miden en px, así ondula igual en lo largo y en lo corto), abierto del lado que va a sangre
  function contorno(capa: number, franja: boolean) {
    // la onda (A) no saca nunca el contorno de afuera hasta el borde del svg: ahí quedaría una recta
    const fx = (franja ? 0.14 : 0.2) * W, fy = 0.24 * H, A = 0.22 * fy, a = (capa + 1) / NIEBLA.length;
    const x0 = franja ? A + fx * a : -0.6 * W, x1 = franja ? 1.6 * W : W - A - fx * a, y0 = A + fy * a, y1 = H - A - fy * a;
    const R = Math.min(fy * 1.6, (y1 - y0) / 2, (x1 - x0) / 2);
    // el borde, recorrido por tramos: rectas y cuartos de círculo
    const tramos: [number, (s: number) => [Pt, Pt]][] = [];
    const recta = (p: Pt, q: Pt): [number, (s: number) => [Pt, Pt]] => {
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return [L, (s) => [[p[0] + ((q[0] - p[0]) * s) / L, p[1] + ((q[1] - p[1]) * s) / L], [(q[1] - p[1]) / L, -(q[0] - p[0]) / L]]];
    };
    const arco = (c: Pt, a0: number): [number, (s: number) => [Pt, Pt]] => [(Math.PI / 2) * R, (s) => { const an = a0 + s / R; return [[c[0] + R * Math.cos(an), c[1] + R * Math.sin(an)], [Math.cos(an), Math.sin(an)]]; }];
    tramos.push(recta([x0 + R, y0], [x1 - R, y0]), arco([x1 - R, y0 + R], -Math.PI / 2), recta([x1, y0 + R], [x1, y1 - R]), arco([x1 - R, y1 - R], 0));
    tramos.push(recta([x1 - R, y1], [x0 + R, y1]), arco([x0 + R, y1 - R], Math.PI / 2), recta([x0, y1 - R], [x0, y0 + R]), arco([x0 + R, y0 + R], Math.PI));
    const pts: Pt[] = [];
    let s0 = 0;
    for (const [L, en] of tramos) {
      for (let s = 0; s < L; s += 10) {
        const [p, n] = en(s), u = s0 + s;
        const r = A * (0.55 * Math.sin(u / 70 + 1.3) + 0.3 * Math.sin(u / 27 + 0.4) + 0.15 * Math.sin(u / 11 + 2.2));
        pts.push([p[0] + n[0] * r, p[1] + n[1] * r]);
      }
      s0 += L;
    }
    return camino(pts, true);
  }

  function montar() {
    W = svg.clientWidth;
    H = svg.clientHeight;
    if (!W || !H) return false;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // a lo ancho (debajo del texto, y en el teléfono) o al costado del texto
    const franja = W / H > 1.4;
    k = franja ? Math.min(H / 4.25, W / 6.5) : Math.min(H / 4.6, W / 6);
    O = franja ? [W * 0.5, H * 0.8] : [W * 0.52, H * 0.86];
    // la costa a DC metros del rumbo: entra por la izquierda y sale por arriba
    // (en el teléfono, más adentro: el borde de arriba se apaga y se la comería)
    DC = clamp((O[0] + 1.732 * O[1] - (franja ? (W < 600 ? 0.62 : 0.4) : 0.9) * W) / (1.732 * k), 2.8, 5.4);
    uA = -O[0] / (k * C) - 14;
    uB = (W - O[0]) / (k * C) + 12;
    svg.replaceChildren();
    let semilla = 11;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    // la aguada del mar, cargada contra la costa y lavada mar adentro, como las líneas: la franja no pesa
    const c0 = pr([0, -DC, 0]), largo = 9 * 0.866 * k;
    const defs = el('defs', {});
    const lavado = el('linearGradient', { id: 'albatros-lavado', gradientUnits: 'userSpaceOnUse', x1: String(f1(c0[0])), y1: String(f1(c0[1])), x2: String(f1(c0[0] + 0.5 * largo)), y2: String(f1(c0[1] + 0.866 * largo)) }, defs);
    // la sombra del ave, rayada como las de la maqueta: rayas finas paralelas a la costa
    const rayado = el('pattern', { id: 'albatros-rayado', width: '3', height: '3', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-30)' }, defs);
    el('line', { x1: '0', y1: '1.5', x2: '3', y2: '1.5', stroke: 'var(--tinta)', 'stroke-width': '0.8' }, rayado);
    for (const [o, a] of [[0, 0.7], [0.45, 0.35], [1, 0]]) el('stop', { offset: String(o), 'stop-color': 'var(--aguada-mar)', 'stop-opacity': String(a) }, lavado);
    aguaMar = el('path', { fill: 'url(#albatros-lavado)' });
    const gMar = el('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', stroke: 'var(--tinta)' });
    lineas = AGUA.map((d, i, a) => ({ d, fase: azar() * 6, e: el('path', { 'stroke-width': String(f1(1.1 - (i / a.length) * 0.55)), 'stroke-opacity': String(f1(0.85 - (i / a.length) * 0.72)) }, gMar) }));
    costa = el('path', { fill: 'none', stroke: 'var(--tinta)', 'stroke-width': '1.6', 'stroke-linejoin': 'round' });
    // la playa en puntos, fija en la tierra: pasa con la costa
    playa = Array.from({ length: 150 }, () => ({ u: azar() * AVANCE, q: azar() }));
    arena = el('path', { fill: 'none', stroke: 'var(--tinta-suave)', 'stroke-width': '1.5', 'stroke-linecap': 'round' });
    const gOlas = el('g', { fill: 'none', 'stroke-linecap': 'round', stroke: 'var(--tinta-suave)', 'stroke-width': '0.9' });
    // cortas, como las del hero: más largas se leían como rayones sueltos
    olas = Array.from({ length: 18 }, (_, i) => ({ i, largo: 0.15 + azar() * 0.3, fase: azar(), n: 2 + Math.floor(azar() * 3), e: el('path', {}, gOlas) }));
    sombra = el('path', { fill: 'url(#albatros-rayado)', stroke: 'none' });
    // el apagado: papel encima, capas de un mismo contorno ondulado (como la maqueta); el ave, arriba
    const gNiebla = el('g', { fill: 'var(--papel)', 'fill-rule': 'evenodd', stroke: 'none' });
    // en anillos que no se pisan, cada uno con la opacidad de todas las capas que lo cubren: papel
    // sobre papel en capas redondea y deja el borde del svg un tono más oscuro que la página
    const capas = [`M${-W} ${-H}H${2 * W}V${2 * H}H${-W}Z`, ...NIEBLA.map((_, i) => contorno(i, franja))];
    NIEBLA.forEach((_, i) => {
      const alfa = 1 - NIEBLA.slice(i).reduce((m, x) => m * (1 - x), 1);
      el('path', { d: capas[i] + capas[i + 1], 'fill-opacity': String(Math.round(alfa * 100) / 100) }, gNiebla);
    });
    gAves = el('g', { 'stroke-linejoin': 'round', 'stroke-linecap': 'round', stroke: 'var(--tinta)' });
    alas = [0, 1].map(() => {
      const g = el('g', {}, gAves);
      return { g, lonja: el('path', { fill: 'var(--tinta-suave)', 'stroke-width': '0.5' }, g), borde: el('path', { 'stroke-width': '0.9' }, g), rayas: el('path', { fill: 'none' }, g) };
    });
    const g = el('g', {}, gAves);
    cuerpoG = {
      g,
      cola: el('path', { fill: 'var(--tinta-suave)', 'fill-opacity': '0.75', 'stroke-width': '0.7' }, g),
      contorno: el('path', { fill: 'var(--papel)', 'stroke-width': '0.9' }, g),
      sombreado: el('path', { fill: 'none', 'stroke-width': '0.45', 'stroke-opacity': '0.55' }, g),
      manto: el('path', { fill: 'var(--tinta-suave)', 'fill-opacity': '0.62', stroke: 'none' }, g),
      cejas: el('path', { fill: 'none', 'stroke-width': '1.6' }, g),
      pico: el('path', { fill: 'var(--aguada-tierra)', 'stroke-width': '0.8' }, g),
      culmen: el('path', { fill: 'none', 'stroke-width': '0.5' }, g),
    };
    return true;
  }

  // el cuerpo sólido: de cada anillo, los dos puntos de la silueta vista desde quien mira
  function cuerpo(P0: V3, E: Ejes, cabeza: number) {
    const fp = 0.3;
    const anillos: Anillo[] = CUERPO.map(([f, w, h, zc]) => {
      let F = E.F, L = E.L, c: V3;
      if (f > fp && cabeza) {
        F = add(mul(E.F, Math.cos(cabeza)), mul(E.L, Math.sin(cabeza)));
        L = add(mul(E.L, Math.cos(cabeza)), mul(E.F, -Math.sin(cabeza)));
        c = add(add(amundo(P0, E, fp, 0, 0), mul(F, f - fp)), mul(E.Up, zc));
      } else c = amundo(P0, E, f, 0, zc);
      const U = E.Up;
      const a1 = Math.atan2(punto(L, VISTA) / w, -punto(U, VISTA) / h);
      const en = (a: number) => add(add(c, mul(L, w * Math.cos(a))), mul(U, h * Math.sin(a)));
      const n = (a: number) => norma(add(mul(L, Math.cos(a) / w), mul(U, Math.sin(a) / h)));
      const arriba = pr(en(a1))[1] < pr(en(a1 + Math.PI))[1];
      return { f, c, F, L, U, en, n, sup: arriba ? a1 : a1 + Math.PI, inf: arriba ? a1 + Math.PI : a1 };
    });
    const contorno = [...anillos.map((r) => pr(r.en(r.sup))), ...anillos.map((r) => pr(r.en(r.inf))).reverse()];
    return { anillos, contorno, hondo: anillos.reduce((m, r) => m + hondo(r.c), 0) / anillos.length };
  }
  // rayas de contorno en la cara a la sombra, como un grabado
  function sombreado(anillos: Anillo[]) {
    const arcos: string[] = [];
    for (const r of anillos) {
      let tramo: Pt[] = [];
      for (let j = 0; j <= 28; j++) {
        const a = (j / 28) * Math.PI * 2, n = r.n(a);
        if (punto(n, VISTA) > 0.05 && punto(n, SOL) < 0.25) tramo.push(pr(r.en(a)));
        else { if (tramo.length > 1) arcos.push(camino(tramo)); tramo = []; }
      }
      if (tramo.length > 1) arcos.push(camino(tramo));
    }
    return arcos.join('');
  }
  // el manto gris entre las alas: la parte de arriba que se ve, entre la nuca y la rabadilla
  function manto(anillos: Anillo[]) {
    const a: Pt[] = [], b: Pt[] = [];
    for (const r of anillos) {
      if (r.f > 0.2 || r.f < -0.25) continue;
      const ancho = r.f > 0.12 ? 0.55 + (0.2 - r.f) * 5 : 0.95;
      const vis: Pt[] = [];
      for (let j = 0; j <= 12; j++) { const ang = Math.PI / 2 - ancho + (j / 12) * 2 * ancho; if (punto(r.n(ang), VISTA) > 0) vis.push(pr(r.en(ang))); }
      if (vis.length) { a.push(vis[0]); b.push(vis[vis.length - 1]); }
    }
    return a.length > 1 ? camino([...a, ...b.reverse()], true) : '';
  }
  const cascara = (pts: Pt[]) => {
    const ps = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo: Pt[] = [], up: Pt[] = [];
    for (const p of ps) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of ps.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };

  function mar(t: number) {
    const f = VEL * t; // lo que corrió la costa: un punto de la tierra en U se ve en u = U + f
    const w = (2 * Math.PI) / LOOP;
    const borde = (U: number) => -DC + orilla(U);
    const cos: V3[] = [];
    for (let u = uA; u <= uB; u += 0.4) cos.push([u, borde(u - f), 0]);
    const linea = cos.map(pr);
    pone(aguaMar, { d: camino([...linea, pr([uB, 80, 0]), pr([uA, 80, 0])], true) });
    pone(costa, { d: camino(linea) });
    // las líneas de agua siguen la costa y se alisan mar adentro; el agua ondula y corre con ella
    for (const L of lineas) {
      const liso = Math.exp(-L.d / 2.5), pts: Pt[] = [];
      for (let u = uA; u <= uB; u += 0.5) {
        const U = u - f;
        const z = (0.012 + 0.03 * (1 - liso)) * (Math.sin(2 * KU * U + 3 * w * t + L.fase) + 0.7 * Math.sin(4 * KU * U - 2 * w * t + L.fase * 2));
        pts.push(pr([u, -DC + L.d + orilla(U) * liso, z]));
      }
      L.e.setAttribute('d', camino(pts));
    }
    // la playa: fija en la tierra, se repite cada AVANCE
    const arenas: string[] = [];
    for (let n = -4; n <= 3; n++) {
      for (const p of playa) {
        const u = p.u + n * AVANCE + f;
        if (u < uA || u > uB) continue;
        const q = pr([u, borde(p.u) - 0.06 - p.q * p.q * 0.7, 0]);
        arenas.push(`M${f1(q[0])} ${f1(q[1])}h0.1`);
      }
    }
    pone(arena, { d: arenas.join('') });
    // olas sueltas: nacen mar adentro, corren con el agua y se acercan a la orilla
    for (const o of olas) {
      const dur = LOOP / o.n, x0 = t / dur + o.fase, c = Math.floor(x0) % o.n, x = x0 - Math.floor(x0);
      const u = lerp(uA * 0.7, uB * 0.7, azarDe(o.i, c)) + VEL * dur * x;
      const d = 0.7 + azarDe(o.i + 50, c) * 10 - 0.4 * x;
      const v = -DC + d + orilla(u - f) * Math.exp(-d / 2.5);
      pone(o.e, { d: camino([pr([u, v, 0]), pr([u + o.largo, v, 0])]), 'stroke-opacity': String(f1(Math.max(0, Math.sin(Math.PI * x) * 0.75 * (1 - d / 13)))) });
    }
  }

  function cuadro(t: number) {
    mar(t);
    const e0 = estado(t), dt = 0.04;
    const eA = estado(t - dt), eB = estado(t + dt), eL = estado(t + 0.25 - dt), eL0 = estado(t + 0.25), eL2 = estado(t + 0.25 + dt);
    const dLat = (eB.lat - eA.lat) / (2 * dt), dz = (eB.z - eA.z) / (2 * dt);
    const ddLat = (eL2.lat - 2 * eL0.lat + eL.lat) / (dt * dt); // la inclinación se adelanta al giro
    const vel = VEL * (1 + 0.28 * (1.12 - e0.z)); // más rápido abajo, más lento arriba
    const P0: V3 = [e0.lat * Math.sin(PSI0), -e0.lat * Math.cos(PSI0), e0.z];
    const ph = clamp((ddLat / vel) * 0.8, -0.62, 0.62) + 0.05 * ola(t, 7, 0.5) + 0.03 * ola(t, 11, 1.7);
    const E = ejes(PSI0 - Math.atan2(dLat, vel), 0.55 * Math.atan2(dz, vel) - 0.02, ph);
    // con la carga de la curva el arco se abre; una vez por vuelta, dos aletazos lentos y cortos
    const carga = clamp(Math.abs(ddLat) / (vel * 2), 0, 1);
    const aletazo = suave((t - 9.6) / 0.25) * (1 - suave((t - 11.2) / 0.3)) * Math.sin(((t - 9.6) / 0.8) * Math.PI * 2);
    const d1Base = 0.06 + 0.06 * carga + 0.02 * ola(t, 6, 0.2) + 0.2 * aletazo;
    const arco = 0.5 - 0.18 * carga + 0.05 * ola(t, 3, 1) - 0.25 * aletazo;

    const lados = [1, -1].map((lado) => {
      const d1 = d1Base + (Math.sign(ph) === -lado ? 0.04 * Math.abs(ph) : 0); // el ala de adentro, más flexionada
      // el arco: el ángulo baja de a poco desde el brazo hasta la punta
      const paso = 0.02, tabla: Pt[] = [[0, 0]];
      for (let i = 1; i * paso <= PUNTA + paso; i++) {
        const ang = d1 - arco * Math.pow(Math.max(0, (i - 0.5) * paso - 0.25) / (PUNTA - 0.25), 1.5);
        tabla.push([tabla[i - 1][0] + paso * Math.cos(ang), tabla[i - 1][1] + paso * Math.sin(ang)]);
      }
      const pos = (s: number, f: number) => {
        const fa = enBorde(AT, s), ff = enBorde(FUGA, s);
        const qq = clamp((fa - f) / (fa - ff || 1), 0, 1);
        const x = s / paso, i = Math.min(Math.floor(x), tabla.length - 2), r = x - i;
        const lat = lerp(tabla[i][0], tabla[i + 1][0], r), up = lerp(tabla[i][1], tabla[i + 1][1], r);
        return amundo(P0, E, f, lado * lat, up + 0.03 * (1 - s / 1.2) * 4 * qq * (1 - qq)); // con comba
      };
      const enQ = (s: number, qq: number) => { const fa = enBorde(AT, s), ff = enBorde(FUGA, s); return pos(s, fa + (ff - fa) * qq); };
      const tira = (qq: number, s0 = 0.09, s1 = PUNTA) => { const pts: Pt[] = []; for (let s = s0; s <= s1 + 1e-6; s += 0.03) pts.push(pr(enQ(Math.min(s, PUNTA - 0.002), qq))); return camino(pts); };
      const borde = [...AT, ...FU].map(([s, f]) => pos(s, f));
      let n = normalPlano(pos(0.15, 0.08), pos(0.15, -0.1), pos(0.45, 0.15));
      if (punto(n, E.Up) < 0) n = mul(n, -1);
      const arriba = punto(n, VISTA) > 0;
      const luz = clamp(punto(arriba ? n : mul(n, -1), SOL), 0, 1);
      // arriba: cubiertas en rayas a lo largo y plumas de vuelo hacia atrás (primarias en abanico);
      // abajo: blanca, con el margen de ataque ancho, la punta y un margen de fuga fino oscuros
      const rayas: string[] = [];
      if (arriba) {
        const nC = Math.round(5 + 3 * (1 - luz));
        for (let i = 1; i <= nC; i++) rayas.push(tira((i / (nC + 1)) * 0.5));
        for (let s = 0.12; s < SM; s += 0.028 - 0.006 * (1 - luz)) rayas.push(camino([pr(enQ(s, 0.48)), pr(enQ(s + 0.006, 0.99))]));
        for (let i = 0; i < 12; i++) {
          const s = SM + 0.03 + i * 0.05;
          rayas.push(camino([pr(enQ(Math.min(s, PUNTA - 0.03), 0.4)), pr(enQ(Math.min(s + 0.03 + i * 0.006, PUNTA - 0.005), 0.995))]));
        }
      } else {
        for (const qq of [0.03, 0.07, 0.11, 0.15, 0.19, 0.23]) rayas.push(tira(qq));
        for (const qq of [0.3, 0.45, 0.6, 0.75, 0.9]) rayas.push(tira(qq, 0.9));
        rayas.push(tira(0.94, 0.09, 0.9));
      }
      // el espesor del borde de ataque, que se ve cuando el ala se inclina
      const lonja: Pt[] = [];
      for (let s = 0.08; s <= PUNTA; s += 0.05) lonja.push(pr(pos(s, enBorde(AT, s))));
      for (let s = PUNTA; s >= 0.08; s -= 0.05) lonja.push(pr(add(pos(s, enBorde(AT, s) - 0.012), mul(E.Up, -0.035 * (1 - s / 1.15)))));
      return { borde, rayas: rayas.join(''), lonja, arriba, luz, hondo: borde.reduce((m, x) => m + hondo(x), 0) / borde.length };
    });

    const cu = cuerpo(P0, E, clamp(0.4 * ph + 0.15 * ola(t, 2, 0.8), -0.5, 0.5));
    const r0 = cu.anillos[0], r1 = cu.anillos[1];
    const base: Pt[] = [];
    for (let j = 0; j < 10; j++) { const a = (j / 10) * Math.PI * 2; base.push(pr(add(add(r0.c, mul(r0.L, 0.017 * Math.cos(a))), mul(r0.U, 0.021 * Math.sin(a))))); }
    const pico = cascara([...base, pr(add(add(r0.c, mul(r0.F, 0.14)), mul(r0.U, -0.014)))]); // grueso, con el gancho abajo
    const ceja = (a: number) => camino([pr(r1.en(a)), pr(add(r1.en(a), mul(r1.F, -0.04)))]);
    const cejas = [0.35, Math.PI - 0.35].filter((a) => punto(r1.n(a), VISTA) > 0).map(ceja).join('');
    const colaW = 0.045 + 0.025 * Math.abs(ph);
    const cola = [[-0.34, 0.85], [-0.44, 1], [-0.47, 0.45], [-0.475, 0], [-0.47, -0.45], [-0.44, -1], [-0.34, -0.85]].map(([f, l]) => pr(amundo(P0, E, f, l * colaW, 0.02)));

    lados.forEach((L, i) => {
      const a = alas[i];
      pone(a.lonja, { d: camino(L.lonja, true) });
      pone(a.borde, { d: camino(L.borde.map(pr), true), fill: L.arriba ? 'var(--tinta-suave)' : 'var(--papel)', 'fill-opacity': L.arriba ? String(f1(0.42 + 0.28 * (1 - L.luz))) : '1' });
      pone(a.rayas, { d: L.rayas, 'stroke-width': L.arriba ? String(f1(0.55 + 0.4 * (1 - L.luz))) : '1.1', 'stroke-opacity': L.arriba ? String(f1(0.55 + 0.35 * (1 - L.luz))) : '0.85' });
    });
    pone(cuerpoG.cola, { d: camino(cola, true) });
    pone(cuerpoG.contorno, { d: camino(cu.contorno, true) });
    pone(cuerpoG.sombreado, { d: sombreado(cu.anillos) });
    pone(cuerpoG.manto, { d: manto(cu.anillos) });
    pone(cuerpoG.cejas, { d: cejas });
    pone(cuerpoG.pico, { d: camino(pico, true) });
    pone(cuerpoG.culmen, { d: camino([pr(r0.en(Math.PI / 2)), pr(add(add(r0.c, mul(r0.F, 0.14)), mul(r0.U, -0.004)))]) });
    // de lo más lejos a lo más cerca: el ala de atrás, el cuerpo, el ala de adelante
    [{ g: alas[0].g, h: lados[0].hondo }, { g: alas[1].g, h: lados[1].hondo }, { g: cuerpoG.g, h: cu.hondo }]
      .sort((a, b) => b.h - a.h)
      .forEach((p) => gAves.append(p.g));
    // la sombra en el agua, más nítida cuanto más bajo vuela
    const alMar = (x: V3) => { const s = x[2] / SOL[2]; return pr([x[0] - SOL[0] * s, x[1] - SOL[1] * s, 0]); };
    const silueta = [...cu.anillos.map((r) => r.en(r.sup)), ...cu.anillos.map((r) => r.en(r.inf)).reverse()];
    const d = lados.map((L) => camino(L.borde.map(alMar), true)).join('') + camino(silueta.map(alMar), true);
    pone(sombra, { d, 'fill-opacity': String(f1(clamp(0.75 - 0.3 * (e0.z - 0.6), 0.3, 0.75))) });
  }

  // para grabar cuadros exactos (docs/design/aves/cuadros.mjs), solo en desarrollo
  let grabando = false;
  if (import.meta.env.DEV) (window as unknown as { __albatros: (t: number) => void }).__albatros = (t) => { grabando = true; cuadro(t); };
  // quieto (movimiento reducido): un cuadro con el ala bien a la vista
  const QUIETO = 5;
  let corriendo = false, visto = false, listo = false, t0 = 0, desde = QUIETO, ultimo = QUIETO;
  const bucle = (ahora: number) => {
    if (!corriendo || !listo || grabando) { corriendo = false; return; }
    ultimo = (desde + (ahora - t0) / 1000) % LOOP;
    cuadro(ultimo);
    requestAnimationFrame(bucle);
  };
  const arrancar = () => {
    if (corriendo || quieto || !visto || grabando) return;
    corriendo = true;
    desde = ultimo;
    t0 = performance.now();
    requestAnimationFrame(bucle);
  };
  listo = montar();
  if (listo) cuadro(QUIETO);
  new IntersectionObserver(([e]) => {
    visto = e.isIntersecting;
    if (visto) arrancar();
    else corriendo = false;
  }).observe(svg);
  // al cambiar el tamaño se vuelve a armar la escena con la nueva escala
  let ancho = W;
  new ResizeObserver(() => {
    if (svg.clientWidth === ancho) return;
    ancho = svg.clientWidth;
    listo = montar();
    if (listo) cuadro(ultimo);
    arrancar();
  }).observe(svg);
}
