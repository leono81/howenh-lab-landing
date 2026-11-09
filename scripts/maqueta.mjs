// Construye src/data/maqueta.json: la maqueta isométrica de la costa (relieve levantado).
// Parte de src/data/mapa.json (planta, `npm run mapa`) y de docs/lugar/dem-marco.bin, y deja
// todo ya proyectado: el SVG no usa matrices, así los trazos tienen grosor parejo.
// Uso: node scripts/maqueta.mjs   (npm run maqueta)
//
// Decisiones:
// - Se mira hacia el OESTE desde el mar, frente a la boca del río: la ciudad queda adelante y
//   la costa sube hasta el cabo, que cierra la lámina arriba a la derecha. Del cabo se ven las
//   dos paredes (la del este, que es la que se ve desde la playa y la ciudad, y la que mira al
//   mar) y la cima. Mirando desde el norte la cima no se ve: con el relieve exagerado cae hacia
//   atrás más empinada que la visual, y el cabo queda como una pared suelta.
//   Eje de la costa (a) abajo a la izquierda, tierra adentro (b) arriba a la izquierda, altura
//   vertical. Es un giro puro de la planta, sin espejo.
// - El relieve va exagerado EXAG veces (91 m en 21 km no se ven a escala real).
// - Los tramos de costa sin nada (cabo-misión, misión-ciudad) van comprimidos: es una maqueta
//   esquemática. Dentro del cabo, la misión y la ciudad la escala horizontal es la real.
// - El cabo es un sólido diseñado sobre el DEM: el DEM de 30 m ubica el filo y da las alturas,
//   pero lo redondea; la forma del corte (banda de roca vertical arriba, talud con cárcavas
//   abajo) sale de las fotos (flow/ref-cabo-23..27).
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const mapa = JSON.parse(readFileSync(new URL('../src/data/mapa.json', import.meta.url), 'utf8'));
const { capas, lugares, costaY } = mapa;

const EXAG = 7; // exageración vertical
const A0 = 20; // fin oeste del bloque (x del marco): se funde con el papel
const A1 = 1900; // corte este, pasando la boca del río
const FONDO = costaY + 345; // tierra adentro hasta ~3,4 km (la pista del aeropuerto termina a 3 km)
const FUNDE = 50; // los últimos 500 m se funden con el papel
const FRENTE = costaY - 118; // borde del bloque en el mar
const ZOCALO = 15; // espesor del bloque bajo el nivel del mar
const C = Math.cos(Math.PI / 6), S = 0.5;

// --- azar con semilla (el dibujo sale igual en cada corrida) ---
let semilla = 11;
const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const mezcla = (a, b, t) => a + (b - a) * t;

// --- compresión de la costa: escala local a lo largo de x, integrada ---
const ZONAS = [[480, 720, 0.3], [890, 1260, 0.45]]; // [desde, hasta, escala]
const RAMPA = 50;
const escala = (x) => {
  let s = 1;
  for (const [a, b, k] of ZONAS) s = Math.min(s, 1 - (1 - k) * suave((x - a) / RAMPA + 0.5) * (1 - suave((x - b) / RAMPA + 0.5)));
  return s;
};
const TX0 = -200, TX1 = 2400;
const tabla = new Float64Array(TX1 - TX0 + 1);
for (let i = 1; i < tabla.length; i++) tabla[i] = tabla[i - 1] + escala(TX0 + i - 0.5);
const Wcrudo = (x) => {
  const f = Math.min(tabla.length - 1.001, Math.max(0, x - TX0)), i = Math.floor(f);
  return tabla[i] + (tabla[i + 1] - tabla[i]) * (f - i);
};
const W = (x) => Wcrudo(x) - Wcrudo(A0); // x del marco → a (comprimido, 0 en el corte oeste)
const Winv = (a) => {
  let lo = TX0, hi = TX1;
  for (let n = 0; n < 24; n++) {
    const m = (lo + hi) / 2;
    if (W(m) < a) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
};
const AMAX = W(A1);

// --- DEM (metros), en el marco de mapa.json ---
const buf = readFileSync(new URL('../docs/lugar/dem-marco.bin', import.meta.url));
const [nx, ny, paso] = [buf.readInt32LE(0), buf.readInt32LE(4), buf.readInt32LE(8)];
const crudo = new Float32Array(nx * ny);
for (let i = 0; i < nx * ny; i++) crudo[i] = buf.readInt16LE(12 + i * 2) / 10;
const alisar = (z, veces) => {
  for (let n = 0; n < veces; n++) {
    const s = new Float32Array(nx * ny);
    for (let r = 0; r < ny; r++)
      for (let q = 0; q < nx; q++) {
        let t = 0, m = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dq = -1; dq <= 1; dq++) {
            const rr = r + dr, qq = q + dq;
            if (rr < 0 || qq < 0 || rr >= ny || qq >= nx) continue;
            t += z[rr * nx + qq];
            m++;
          }
        s[r * nx + q] = t / m;
      }
    z = s;
  }
  return z;
};
const zFino = alisar(crudo, 1); // campo: una pasada (ruido del DSM)
const zLiso = alisar(crudo, 8); // ciudad: el DSM levanta los techos; ahí se aplana
const bilineal = (z, x, y) => {
  const fq = Math.min(nx - 1.001, Math.max(0, x / paso)), fr = Math.min(ny - 1.001, Math.max(0, y / paso));
  const q = Math.floor(fq), r = Math.floor(fr), tq = fq - q, tr = fr - r, i = r * nx + q;
  return z[i] * (1 - tq) * (1 - tr) + z[i + 1] * tq * (1 - tr) + z[i + nx] * (1 - tq) * tr + z[i + nx + 1] * tq * tr;
};
const dem = (x, y) => mezcla(bilineal(zFino, x, y), bilineal(zLiso, x, y), suave((x - 950) / 150));

// --- el cabo: filo del acantilado (x, y del marco, altura en m, ancho del corte en unidades) ---
// Del oeste a la punta y un tramo corto de la cara este: según el DEM el escarpe del este
// solo es abrupto en los primeros ~200 m; más adentro es la rampa suave que se ve desde la ruta. La posición sale del DEM
// (línea donde la altura cae a la mitad, corrida ~20 m tierra adentro); en la punta se corre
// 30 m hacia el mar para que la baliza (OSM) quede arriba, al filo. Las alturas siguen la
// cresta del DEM suavizada, con 91 m en la baliza.
const FILO = [
  [121, 814, 50, 10], [138, 806, 60, 10], [156, 802, 66, 10], [173, 796, 68, 10], [189, 789, 70, 10],
  [205, 781, 74, 10], [221, 771, 80, 10], [237, 762, 84, 10], [253, 754.5, 87, 9.5], [270, 748.5, 89, 8.5],
  [286, 740.5, 90, 6], [299, 735.2, 91, 4.4], [312, 735.5, 91, 4.4], [321, 737.5, 88, 4.8], [326, 743, 80, 7],
  [328.5, 752, 66, 8], [330, 763, 50, 8],
];
const PIE_M = 1.5; // altura de la playa al pie
const BANDA = 0.36; // la banda de roca: el 36 % de arriba de la altura...
const BANDA_ANCHO = 0.16; // ...en el 16 % del ancho (casi vertical)
// estaciones cada ~0,8 unidades, con esquinas redondeadas (Chaikin) y normal hacia afuera
const estaciones = (() => {
  let pts = FILO;
  for (let n = 0; n < 2; n++) {
    const q = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      q.push(a.map((v, k) => v * 0.75 + b[k] * 0.25), a.map((v, k) => v * 0.25 + b[k] * 0.75));
    }
    q.push(pts[pts.length - 1]);
    pts = q;
  }
  const est = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.8));
    for (let j = 0; j < n; j++) est.push(a.map((v, k) => v + ((b[k] - v) * j) / n));
  }
  est.push(pts[pts.length - 1]);
  return est.map(([x, y, h, f], i) => {
    const p = est[Math.max(0, i - 2)], q = est[Math.min(est.length - 1, i + 2)];
    const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy);
    const t = i / (est.length - 1);
    // en las dos puntas el corte se desvanece hacia lo que dice el DEM
    return { x, y, h, f, nx: dy / l, ny: -dx / l, peso: suave(t / 0.12) * suave((1 - t) / 0.06) };
  });
})();
const CAJA = [100, 345, 715, 850]; // fuera de esto el cabo no influye
// perfil del corte: fracción de la altura según la fracción del ancho (0 filo, 1 pie)
const tDe = (r) => (r <= BANDA_ANCHO ? (BANDA * r) / BANDA_ANCHO : BANDA + (1 - BANDA) * ((r - BANDA_ANCHO) / (1 - BANDA_ANCHO)) ** (1 / 0.85));
const rDe = (t) => (t <= BANDA ? (BANDA_ANCHO * t) / BANDA : BANDA_ANCHO + (1 - BANDA_ANCHO) * ((t - BANDA) / (1 - BANDA)) ** 0.85);
// distancia con signo al filo (+ afuera, hacia el mar) y la estación más cercana
function alFilo(x, y) {
  let mejor = Infinity, k = 0;
  for (let i = 0; i < estaciones.length; i++) {
    const e = estaciones[i], d = (x - e.x) ** 2 + (y - e.y) ** 2;
    if (d < mejor) (mejor = d), (k = i);
  }
  const e = estaciones[k];
  const lado = (x - e.x) * e.nx + (y - e.y) * e.ny;
  return { d: Math.sqrt(mejor) * (lado >= 0 ? 1 : -1), e };
}
// altura del terreno en metros
function altM(x, y) {
  const base = dem(x, y);
  if (x < CAJA[0] || x > CAJA[1] || y < CAJA[2] || y > CAJA[3]) return base;
  const { d, e } = alFilo(x, y);
  if (d < -30 || d > e.f + 14 || e.peso === 0) return base;
  let h;
  if (d <= 0) h = mezcla(e.h, Math.max(base, e.h * 0.45), suave(-d / 28)); // cima: del filo a la rampa del DEM
  else if (d < e.f) h = PIE_M + (e.h - PIE_M) * (1 - tDe(d / e.f)); // corte
  else h = Math.min(base, mezcla(PIE_M, base, suave((d - e.f) / 14))); // playa: el DEM ahí está contaminado
  return mezcla(base, h, e.peso);
}
// altura en unidades del dibujo, en coordenadas de la maqueta (a comprimido, y del marco)
const alt = (a, y) => (Math.max(0, altM(Winv(a), y)) * EXAG) / 10;
const ALT_MAX = (95 * EXAG) / 10;

// --- proyección isométrica ---
const OX = C * (AMAX + FONDO - costaY) + 12, OY = S * (FONDO - costaY) + 96;
const iso = (a, y, z = 0) => [OX - C * (a + y - costaY), OY + S * (a - y + costaY) - z];
const ANCHO = Math.ceil(OX + C * (costaY - FRENTE) + 12), ALTO = Math.ceil(OY + S * (AMAX + costaY - FRENTE) + ZOCALO + 14);
// un punto queda oculto si algo más cercano al que mira (a mayor, b menor) tapa su rayo
function oculto(a, y, z) {
  for (let t = 1.5; z + t < ALT_MAX; t += 1.5) if (alt(a + t, y - t) > z + t + 0.4) return true;
  return false;
}
const enBloque = (a, y) => a >= 0 && a <= AMAX && y >= FRENTE && y <= FONDO;

// --- caminos: leer los de mapa.json y escribir los proyectados ---
function leer(d) {
  const partes = [];
  let p = null, x = 0, y = 0;
  for (const [, c, args] of d.matchAll(/([MLlhZ])([^MLlhZ]*)/g)) {
    const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'M') (p = { pts: [[(x = n[0]), (y = n[1])]], cerrado: false }), partes.push(p);
    else if (c === 'L') p.pts.push([(x = n[0]), (y = n[1])]);
    else if (c === 'l') p.pts.push([(x += n[0]), (y += n[1])]);
    else if (c === 'h') p.pts.push([(x += n[0]), y]);
    else p.cerrado = true;
  }
  return partes;
}
const densificar = (pts, max) => {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / max));
    for (let j = 1; j <= n; j++) out.push([x0 + ((x1 - x0) * j) / n, y0 + ((y1 - y0) * j) / n]);
  }
  return out;
};
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = len ? Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len : Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]);
    if (d > max) (max = d), (idx = i);
  }
  if (max <= tol) return [a, b];
  return [...simplificar(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplificar(pts.slice(idx), tol)];
}
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const trazo = (pts, cerrar = false) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + (cerrar ? 'Z' : '');
// línea apoyada en el terreno: se densifica, se levanta, se corta donde sale del bloque o queda oculta
function apoyada(pts, { max = 2.5, tol = 0.2, sobre = 0, ocultar = true } = {}) {
  const ms = densificar(pts, max).map(([x, y]) => [W(x), y]);
  let d = '', tramo = [];
  const cerrar = () => {
    if (tramo.length > 1) d += trazo(simplificar(tramo, tol));
    tramo = [];
  };
  for (const [a, y] of ms) {
    if (!enBloque(a, y)) { cerrar(); continue; }
    const z = alt(a, y) + sobre;
    if (ocultar && oculto(a, y, z)) { cerrar(); continue; }
    tramo.push(iso(a, y, z));
  }
  cerrar();
  return d;
}
const lineas = (d, o) => leer(d).map((p) => apoyada(p.cerrado ? [...p.pts, p.pts[0]] : p.pts, o)).join('');
// polígono plano (playas, mallines, agua): proyectado entero, sin ocultamiento
const poligonos = (d) =>
  leer(d)
    .map((p) => {
      const ms = densificar([...p.pts, p.pts[0]], 6).map(([x, y]) => [Math.min(AMAX, Math.max(0, W(x))), Math.min(FONDO + 30, Math.max(FRENTE, y))]);
      return trazo(simplificar(ms.map(([a, y]) => iso(a, y, alt(a, y))), 0.25), true);
    })
    .join('');
// camino en planta comprimida (a, y), para las líneas de agua (ver Maqueta.astro)
const enPlanta = (d) => leer(d).map((p) => trazo(simplificar(densificar(p.pts, 8).map(([x, y]) => [W(x), y]), 0.3), p.cerrado)).join('');

// --- relieve: las rayitas del mapa en planta, levantadas ---
// en el cabo el DEM no manda: ni rayitas en el corte (se dibuja aparte) ni en la cima (va limpia)
const ZONA_CABO = (x, y) => x < 430 && y < 940; // alrededor, el relieve va más liviano para que mande el corte
const enElCabo = (x, y, adentro) => {
  if (x < CAJA[0] || x > CAJA[1] || y < CAJA[2] || y > CAJA[3]) return false;
  const { d, e } = alFilo(x, y);
  return e.peso > 0 && d > -adentro && d < e.f + 13;
};
// se ralean hacia el fondo y hacia el oeste, donde el bloque se funde con el papel
const queda = (a, y) => azar() > suave((y - (FONDO - FUNDE)) / FUNDE) && azar() > suave((45 - a) / 45);
let livianas = '';
const hachures = capas.hachures.map((g) => {
  let d = '';
  for (const p of leer(g.d)) {
    const [[x0, y0], [x1, y1]] = p.pts;
    if (enElCabo((x0 + x1) / 2, (y0 + y1) / 2, 40)) continue;
    const a0 = W(x0), a1 = W(x1);
    if (!enBloque(a0, y0) || !enBloque(a1, y1) || !queda(a0, y0)) continue;
    const z0 = alt(a0, y0), z1 = alt(a1, y1);
    if (oculto(a0, y0, z0) || oculto(a1, y1, z1)) continue;
    const [u0, v0] = iso(a0, y0, z0), [u1, v1] = iso(a1, y1, z1);
    const seg = `M${f1(u0)} ${f1(v0)}l${f1(u1 - u0)} ${f1(v1 - v0)}`;
    if (!g.suave && ZONA_CABO(x0, y0)) livianas += azar() < 0.4 ? seg : '';
    else d += seg;
  }
  return { w: g.w, suave: g.suave, d };
});
hachures.find((g) => g.suave).d += livianas;
// estepa: una mata parada en cada punto del mapa en planta
let estepa = '';
{
  const vistos = new Set();
  for (const p of leer(capas.estepa)) {
    const [x, y] = p.pts[0], k = `${x},${y}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    const a = W(x);
    if (!enBloque(a, y) || !queda(a, y) || enElCabo(x, y, 3)) continue;
    const z = alt(a, y);
    if (oculto(a, y, z)) continue;
    const [u, v] = iso(a, y, z), s = 0.75 + azar() * 0.5;
    estepa += `M${f1(u)} ${f1(v)}l${f1(-1.5 * s)} ${f1(-2.3 * s)}M${f1(u)} ${f1(v)}l${f1(0.2 * s)} ${f1(-3 * s)}M${f1(u)} ${f1(v)}l${f1(1.6 * s)} ${f1(-2.1 * s)}`;
  }
}

// --- el corte del cabo: banda de roca con capas, talud con cárcavas, playa al pie ---
// punto de la cara: estación i (puede ser fraccionaria), t de 0 (filo) a 1 (pie)
const enCara = (i, t) => {
  const i0 = Math.max(0, Math.min(estaciones.length - 2, Math.floor(i))), k = i - i0;
  const e0 = estaciones[i0], e1 = estaciones[i0 + 1];
  const m = (c) => e0[c] + (e1[c] - e0[c]) * k;
  const r = rDe(t) * m('f');
  return iso(W(m('x') + m('nx') * r), m('y') + m('ny') * r, ((m('zp') + (m('zt') - m('zp')) * (1 - t)) * EXAG) / 10);
};
// alturas reales del filo y del pie de cada estación (en las puntas el corte se achica hasta el DEM)
for (const e of estaciones) {
  e.zt = altM(e.x, e.y);
  e.zp = Math.min(e.zt, Math.max(0, altM(e.x + e.nx * e.f, e.y + e.ny * e.f)));
}
// la cara se ve donde mira hacia el observador (a mayor, b menor)
const visibles = estaciones.map((e, i) => i).filter((i) => estaciones[i].peso > 0.02 && estaciones[i].nx - estaciones[i].ny > 0.12);
const [V0, V1] = [visibles[0], visibles[visibles.length - 1]];
const rango = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const cabo = { cara: '', filo: '', capas: '', base: '', grietas: '', alero: '', sombra: '', carcavas: '', carcavasFinas: '', pie: '', playa: '' };
{
  const N = V1 - V0;
  const arriba = rango(V0, V1, N).map((i) => enCara(i, 0)), abajo = rango(V0, V1, N).map((i) => enCara(i, 1));
  cabo.cara = trazo([...arriba, ...abajo.reverse()], true);
  cabo.filo = trazo(simplificar(arriba, 0.15));
  cabo.pie = trazo(simplificar(rango(V0, V1, N).map((i) => enCara(i, 1)), 0.15));
  // banda de roca: clara, con pocas capas finas y alguna grieta; abajo, la línea del alero
  for (const [n, t0] of [0.1, 0.19, 0.28].entries()) {
    const fase = azar() * 6;
    let tramo = [], hueco = 0;
    for (let i = V0; i <= V1; i++) {
      if (hueco > 0) { hueco--; continue; }
      tramo.push(enCara(i, (t0 + 0.012 * Math.sin(i * 0.11 + fase) + 0.006 * Math.sin(i * 0.37 + n)) * (0.4 + 0.6 * estaciones[i].peso)));
      if (azar() < 0.03 || i === V1) {
        if (tramo.length > 3) cabo.capas += trazo(simplificar(tramo, 0.12));
        tramo = [];
        hueco = 1 + Math.floor(azar() * 3);
      }
    }
  }
  cabo.base = trazo(simplificar(rango(V0, V1, N).map((i) => enCara(i, BANDA + 0.01 * Math.sin(i * 0.23))), 0.12));
  for (let i = V0 + 3; i < V1; i += 4 + azar() * 9) {
    const t0 = azar() * 0.12;
    cabo.grietas += trazo([enCara(i, t0), enCara(i + (azar() - 0.5) * 0.8, Math.min(BANDA, t0 + 0.1 + azar() * 0.2))]);
  }
  // cárcavas: surcos que bajan torcidos desde la banda y se abren hacia el pie
  const surcos = [];
  for (let c = V0 + 4 + azar() * 5; c < V1 - 3; c += 6 + azar() * 17) surcos.push({ c, dir: azar() < 0.5 ? -1 : 1, torcer: (azar() - 0.5) * 3 });
  const eje = (g, t) => g.c + g.torcer * Math.sin((t - BANDA) * 5) + g.dir * 1.2 * (t - BANDA);
  for (const g of surcos) {
    cabo.carcavas += trazo(rango(BANDA, 1, 8).map((t) => enCara(eje(g, t), t)));
    for (let j = 1; j <= 4; j++) {
      const t0 = BANDA + 0.08 + j * 0.12;
      if (t0 < 0.95) cabo.sombra += trazo(rango(t0, 1, 4).map((t) => enCara(eje(g, t) + j * 1.1 * ((t - BANDA) / (1 - BANDA)), t)));
    }
  }
  // talud: bajo el alero va en sombra (rayado apretado y corto); más abajo, rayitas finas
  // cuesta abajo que se van perdiendo hacia el pie
  for (let i = V0 + 0.4; i < V1; i += 0.9) cabo.alero += trazo([enCara(i, BANDA), enCara(i, BANDA + 0.07 + azar() * 0.07)]);
  for (let i = V0 + 0.7; i < V1; i += 1.7) {
    const t0 = BANDA + 0.12 + azar() * 0.06, t1 = 0.55 + azar() * 0.3;
    cabo.carcavasFinas += trazo([enCara(i, t0), enCara(i + (azar() - 0.5) * 0.6, t1)]);
    if (azar() < 0.35) cabo.carcavasFinas += trazo([enCara(i, t1 + 0.05), enCara(i, Math.min(0.98, t1 + 0.12 + azar() * 0.1))]);
  }
  // playa de canto rodado al pie: puntos sueltos
  for (let i = V0; i < V1; i += 0.7) {
    const e = estaciones[Math.floor(i)], r = e.f + 0.6 + azar() * 4.5, x = e.x + e.nx * r + (azar() - 0.5), y = e.y + e.ny * r + (azar() - 0.5);
    if (altM(x, y) > 0.2) cabo.playa += `M${iso(W(x), y, 0.3).map(f1).join(' ')}h0`;
  }
}

// --- los dos cortes del bloque que dan al frente (el este y el del mar), con sus estratos ---
const bloque = { corte: '', perfil: '', estratos: '', frente: '', estratosFrente: '', borde: '' };
{
  const ys = rango(FRENTE, FONDO, Math.round((FONDO - FRENTE) / 1.5));
  const zs = ys.map((y) => alt(AMAX, y));
  const tope = ys.map((y, i) => iso(AMAX, y, zs[i]));
  bloque.corte = trazo([...tope, iso(AMAX, FONDO, -ZOCALO), iso(AMAX, FRENTE, -ZOCALO)], true);
  bloque.perfil = trazo(simplificar(tope, 0.12));
  // estratos horizontales: bajo el nivel del mar corren de punta a punta; arriba, solo donde hay tierra
  for (let L = -ZOCALO + 3; L < ALT_MAX; L += L < 0 ? 4 : 3.2) {
    let tramo = [];
    ys.forEach((y, i) => {
      if (zs[i] > L + 0.9 || L < 0) tramo.push(iso(AMAX, y, L));
      else {
        if (tramo.length > 1) bloque.estratos += trazo([tramo[0], tramo[tramo.length - 1]]);
        tramo = [];
      }
    });
    if (tramo.length > 1) bloque.estratos += trazo([tramo[0], tramo[tramo.length - 1]]);
  }
  bloque.frente = trazo([iso(0, FRENTE, 0), iso(AMAX, FRENTE, 0), iso(AMAX, FRENTE, -ZOCALO), iso(0, FRENTE, -ZOCALO)], true);
  for (let L = -ZOCALO + 3; L < 0; L += 4) bloque.estratosFrente += trazo([iso(0, FRENTE, L), iso(AMAX, FRENTE, L)]);
  bloque.borde = trazo([iso(0, FRENTE, 0), iso(AMAX, FRENTE, 0), iso(AMAX, FRENTE, -ZOCALO), iso(0, FRENTE, -ZOCALO)]) + trazo([iso(AMAX, FRENTE, -ZOCALO), iso(AMAX, FONDO, -ZOCALO)]);
}

// --- fundidos (degradés de opacidad en pantalla, perpendiculares a los ejes) ---
// tierra adentro: de opaco en FONDO-FUNDE a nada en FONDO; al oeste: de a=45 a a=0
const degrade = ([x, y], [nx_, ny_], largo) => ({ x1: +f1(x), y1: +f1(y), x2: +f1(x + nx_ * largo * 2 * C * S), y2: +f1(y + ny_ * largo * 2 * C * S) });
// detrás del cabo no hace falta tanta tierra (la ruta pasa a 600 m): ahí el fondo se acerca en
// diagonal, de 3,4 km a la altura del aeropuerto a 2,1 km en el extremo oeste
const sesgo = (() => {
  const A = iso(W(1300), FONDO), B = iso(0, costaY + 215), l = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const n = [(B[1] - A[1]) / l, -(B[0] - A[0]) / l]; // normal hacia tierra adentro
  return { x1: +f1(A[0] - n[0] * 75), y1: +f1(A[1] - n[1] * 75), x2: +f1(A[0]), y2: +f1(A[1]) };
})();
const fundidos = {
  fondo: degrade(iso(0, FONDO - FUNDE), [-S, -C], FUNDE),
  sesgo,
  oeste: degrade(iso(45, costaY), [S, -C], 45),
};

// --- lugares, ya proyectados (pie de cada viñeta) ---
const pie = ([x, y]) => iso(W(x), y, alt(W(x), y)).map((v) => +f1(v));
const salida = {
  fuente: mapa.fuente,
  ancho: ANCHO,
  alto: ALTO,
  exageracion: EXAG,
  // matriz que lleva la planta comprimida (a, y) a la pantalla: solo para las líneas de agua
  matriz: `matrix(${-C} ${S} ${-C} ${-S} ${f1(OX + C * costaY)} ${f1(OY + S * costaY)})`,
  franja: { x: 0, y: FRENTE, w: +f1(AMAX), h: FONDO - FRENTE },
  fundidos,
  agua: { mar: enPlanta(capas.mar), costa: enPlanta(capas.lineaCosta), estuario: enPlanta(capas.estuario) },
  capas: {
    costa: lineas(capas.lineaCosta, { ocultar: false }),
    estuario: lineas(capas.estuario),
    rio: lineas(capas.rioLinea),
    arroyos: lineas(capas.arroyos),
    lagunas: lineas(capas.lagunas.join('')),
    playa: poligonos(capas.playa + capas.arenas),
    humedal: poligonos(capas.humedal),
    ruta: lineas(capas.ruta, { sobre: 0.2 }),
    trama: lineas(capas.trama, { max: 4, tol: 0.25 }),
    avenidas: lineas(capas.avenidas, { max: 4, tol: 0.25 }),
    pista: lineas(capas.pista, { max: 6, tol: 0.5 }),
    rodajes: lineas(capas.rodajes),
    plataformas: poligonos(capas.plataformas),
    hachures,
    estepa,
  },
  cabo,
  bloque,
  lugares: Object.fromEntries(Object.entries(lugares).map(([k, p]) => [k, pie(p)])),
};

// --- comprobaciones: si la geografía se rompe, que falle acá y no en el dibujo ---
const rutaPts = leer(capas.ruta).flatMap((p) => p.pts);
const rutaCerca = (p) => rutaPts.reduce((m, q) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(m[0] - p[0], m[1] - p[1]) ? q : m));
assert(Math.abs(altM(...lugares.baliza) - 91) < 4, 'la baliza tiene que quedar arriba, a ~91 m');
assert(alFilo(...lugares.baliza).d < 0 && alFilo(...lugares.baliza).d > -4, 'la baliza va al filo, del lado de tierra');
assert(rutaCerca(lugares.baliza)[1] > lugares.baliza[1] + 30, 'la Ruta 3 pasa por detrás de la baliza');
assert(rutaCerca(lugares.mision)[1] < lugares.mision[1], 'la misión queda del lado de tierra de la ruta');
assert(W(lugares.baliza[0]) < W(lugares.mision[0]) && W(lugares.mision[0]) < W(lugares.aeropuerto[0]) && W(lugares.aeropuerto[0]) < W(lugares.torre[0]), 'el orden a lo largo de la costa no cambia');
for (const x of [100, 300, 1400, 1800]) assert(Math.abs(escala(x) - 1) < 1e-9, `escala real en x=${x}`);

const json = JSON.stringify(salida);
writeFileSync(new URL('../src/data/maqueta.json', import.meta.url), json);
console.log('maqueta', ANCHO, 'x', ALTO, 'bytes', json.length, 'lugares', salida.lugares);
console.log(Object.entries(salida.capas).map(([k, v]) => `${k}:${JSON.stringify(v).length}`).join(' '));
