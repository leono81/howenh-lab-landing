// Construye src/data/globo.json (la lámina de la estación terrena): la Tierra en proyección
// ortográfica con el norte arriba y Tierra del Fuego abajo, las costas de Natural Earth 1:110m
// (dominio público; docs/lugar/mundo/tierra-ne110m.geojson, sacado de naturalearth_lowres), la
// retícula, las estaciones de la red y la órbita polar de un satélite que pasa sobre Río Grande.
// Unidades: el radio de la Tierra mide R. Uso: node scripts/globo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const R = 100;
const rad = (g) => (g * Math.PI) / 180;
const f = (v) => +v.toFixed(1);
// la vista: desde arriba de 10° N y 40° O, así Sudamérica entra entera y Tierra del Fuego queda abajo
const [LAT0, LON0] = [rad(10), rad(-40)];
const unit = (lat, lon) => [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const centro = unit(LAT0, LON0);
const este = [-Math.sin(LON0), Math.cos(LON0), 0];
const norte = [-Math.sin(LAT0) * Math.cos(LON0), -Math.sin(LAT0) * Math.sin(LON0), Math.cos(LAT0)];
// un punto del espacio (en radios terrestres) → pantalla (y hacia abajo) y si lo tapa la Tierra
const ver = (q) => {
  const [x, y, z] = [dot(q, este) * R, -dot(q, norte) * R, dot(q, centro)];
  return { p: [x, y], adelante: z >= 0, tapado: z < 0 && x * x + y * y < R * R };
};
const geo = (lat, lon) => ver(unit(rad(lat), rad(lon)));

// Douglas-Peucker (el mismo de scripts/mapa.mjs)
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  for (let i = 1; i < pts.length - 1; i++) {
    const d = len ? Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len : Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]);
    if (d > max) (max = d), (idx = i);
  }
  if (max <= tol) return [a, b];
  return [...simplificar(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplificar(pts.slice(idx), tol)];
}
const camino = (pts, cerrar) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + (cerrar ? 'Z' : '');

// --- la tierra: lo de la cara oculta se apoya en el borde (el horizonte), así las costas no se cruzan ---
const mundo = JSON.parse(readFileSync(new URL('../docs/lugar/mundo/tierra-ne110m.geojson', import.meta.url), 'utf8'));
const anillos = mundo.features.flatMap((ft) => (ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates)).map((poly) => poly[0]);
const tierra = anillos
  .map((anillo) => {
    const vs = anillo.map(([lon, lat]) => geo(lat, lon));
    if (!vs.some((v) => v.adelante)) return null;
    const pts = vs.map((v) => {
      if (v.adelante) return v.p;
      const m = Math.hypot(...v.p) || 1;
      return [(v.p[0] / m) * R, (v.p[1] / m) * R];
    });
    return camino(simplificar(pts, 0.35), true);
  })
  .filter(Boolean)
  .join('');

// --- la retícula: cada 30°, solo lo de adelante ---
const tramos = (vs) => {
  let d = '', abierto = false;
  for (const v of vs) {
    if (!v.adelante) {
      abierto = false;
      continue;
    }
    d += `${abierto ? 'L' : 'M'}${f(v.p[0])} ${f(v.p[1])}`;
    abierto = true;
  }
  return d;
};
const reticula =
  Array.from({ length: 12 }, (_, i) => tramos(Array.from({ length: 37 }, (_, k) => geo(-90 + k * 5, -180 + i * 30)))).join('') +
  [-60, -30, 0, 30, 60].map((lat) => tramos(Array.from({ length: 73 }, (_, k) => geo(lat, -180 + k * 5)))).join('');

// --- Río Grande: el punto, y hacia dónde apunta la vertical del lugar en pantalla ---
const RG = [-53.79, -67.7];
const pRG = unit(rad(RG[0]), rad(RG[1]));
const rg = ver(pRG);
assert(rg.adelante && rg.p[1] > R * 0.75, 'Río Grande tiene que verse, abajo del globo');
const normal = [rg.p[0] / Math.hypot(...rg.p), rg.p[1] / Math.hypot(...rg.p)];

// --- otras estaciones de la red (ilustrativas: TinyGS tiene estaciones en todo el mundo) ---
const otras = [[-34.6, -58.4], [-33.4, -70.6], [-23.5, -46.6], [-12, -77], [4.7, -74], [19.4, -99.1], [40.7, -74], [38.7, -9.1], [14.7, -17.4], [-33.9, 18.4]]
  .map(([a, b]) => geo(a, b))
  .filter((v) => v.adelante)
  .map((v) => v.p.map(f));

// --- la órbita: polar, heliosincrónica (inclinación ~98°), de sur a norte sobre Río Grande ---
// Un círculo de radio ORBITA (en radios terrestres; el alto está exagerado para que se lea) en el
// plano que contiene a Río Grande y a su rumbo: unos 10° al oeste del norte.
const ORBITA = 1.6, RUMBO = rad(-10), MUESTRAS = 180;
const [la, lo] = [rad(RG[0]), rad(RG[1])];
const N = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];
const E = [-Math.sin(lo), Math.cos(lo), 0];
const V = N.map((n, i) => Math.cos(RUMBO) * n + Math.sin(RUMBO) * E[i]);
// la vuelta arranca un cuarto antes de Río Grande: así pasa por arriba de la isla a un cuarto del ciclo
const orbita = Array.from({ length: MUESTRAS + 1 }, (_, i) => {
  const t = -Math.PI / 2 + (i / MUESTRAS) * 2 * Math.PI;
  const q = pRG.map((p, k) => ORBITA * (Math.cos(t) * p + Math.sin(t) * V[k]));
  const v = ver(q);
  return { p: v.p.map(f), ve: !v.tapado, t };
});
const enRG = MUESTRAS / 4; // t = 0: arriba de Río Grande
assert(Math.abs(orbita[enRG].t) < 1e-9);
assert(orbita[enRG].ve, 'cuando pasa por Río Grande, el satélite tiene que verse');
// la órbita dibujada: solo lo que no tapa la Tierra
const trazoOrbita = tramos(orbita.map((o) => ({ p: o.p, adelante: o.ve })));

const salida = {
  fuente: 'Natural Earth 1:110m (dominio público), proyección ortográfica centrada en 10° N, 40° O',
  R,
  tierra,
  reticula,
  rg: rg.p.map(f),
  normal: normal.map((v) => +v.toFixed(3)),
  otras,
  orbita: orbita.map((o) => [...o.p, o.ve ? 1 : 0]),
  enRG,
  trazoOrbita,
};
writeFileSync(new URL('../src/data/globo.json', import.meta.url), JSON.stringify(salida));
console.log('Río Grande', salida.rg, 'normal', salida.normal, 'estaciones', otras.length, 'kB', (JSON.stringify(salida).length / 1024).toFixed(0), 'paso por RG en la muestra', enRG);
