// Construye src/data/isla.json (la lámina de Penon) desde las capas oficiales de docs/lugar/isla/,
// copiadas de penonInsight/data el 2026-11-10: límite provincial y aguas (IGN), incendios
// históricos y bosque nativo (IDE Tierra del Fuego), zonas del índice de peligro (Penon) y la
// tierra regional que usa Penon (para el lado chileno, solo como contexto).
// Planta en km, norte arriba, 1 unidad = 1 km. Uso: node scripts/isla.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const D = new URL('../docs/lugar/isla/', import.meta.url);
const leer = (f) => JSON.parse(readFileSync(new URL(f, D), 'utf8')).features;

// --- marco: la Isla Grande entera y la Isla de los Estados ---
const LON0 = -69.9, LON1 = -63.55, LAT0 = -52.42, LAT1 = -55.4;
const KX = 111.32 * Math.cos((-54 * Math.PI) / 180), KY = 110.57;
const P = ([lon, lat]) => [(lon - LON0) * KX, (LAT0 - lat) * KY];
const marco = { w: +((LON1 - LON0) * KX).toFixed(1), h: +((LAT0 - LAT1) * KY).toFixed(1) };

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
const f = (v) => +v.toFixed(1);
const d = (pts, cerrar) => (pts.length < 2 ? '' : 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + (cerrar ? 'Z' : ''));
const anillo = (r, tol) => simplificar(r.map(P), tol);
const anillos = (g) => (g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : []);
const caja = (pts) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};
const enMarco = (pts) => {
  const c = caja(pts);
  return c.x1 > -20 && c.x0 < marco.w + 20 && c.y1 > -20 && c.y0 < marco.h + 20;
};
const area = (pts) => Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0) / 2);

// --- la provincia: Isla Grande, Isla de los Estados e islotes del marco (sin Malvinas) ---
const provincia = anillos(leer('tdf_provincia.geojson')[0].geometry)
  .map((r) => anillo(r, 0.25))
  .filter((r) => r.length > 3 && enMarco(r) && caja(r).x0 > -5);
const tierra = provincia.map((r) => d(r, true)).join('');
const frontera = Math.min(...provincia.flatMap((r) => r.map((p) => p[0]))); // el meridiano del límite

// --- el lado chileno: la tierra regional recortada al oeste del límite (Sutherland-Hodgman) ---
const alOeste = (pts, x0) => {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ai = a[0] <= x0, bi = b[0] <= x0;
    if (ai) out.push(a);
    if (ai !== bi) out.push([x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]);
  }
  return out;
};
const chile = leer('region_land.geojson')
  .flatMap((ft) => anillos(ft.geometry))
  .map((r) => anillo(r, 0.35))
  .filter((r) => caja(r).y0 > -5) // sin el continente: recortado al límite deja rectas por el mar
  .map((r) => alOeste(r, frontera + 0.05))
  .filter((r) => r.length > 3 && enMarco(r) && area(r) > 4)
  .map((r) => d(r, true))
  .join('');

// la parte chilena de la Isla Grande sola (el anillo que toca el límite): completa la forma de la isla
const chileIsla = leer('region_land.geojson')
  .flatMap((ft) => anillos(ft.geometry))
  .map((r) => anillo(r, 0.35))
  .filter((r) => caja(r).y0 > -5)
  .map((r) => alOeste(r, frontera + 0.05))
  .filter((r) => r.length > 3 && r.some((p) => Math.abs(p[0] - (frontera + 0.05)) < 0.01) && area(r) > 500)
  // también toca el límite una isla al sur del canal: la Isla Grande es la que llega más al norte
  .sort((a, b) => caja(a).y0 - caja(b).y0)
  .map((r) => d(simplificar(r, 2.2), true));
assert(chileIsla.length >= 1 && chileIsla[0].length > 300, 'falta la parte chilena de la Isla Grande');

// --- aguas: lagos y lagunas grandes, y los ríos con nombre ---
const aguas = leer('tdf_aguas.geojson');
const lagos = aguas
  .filter((ft) => ft.geometry.type !== 'LineString')
  .flatMap((ft) => anillos(ft.geometry).slice(0, 1))
  .map((r) => anillo(r, 0.2))
  .filter((r) => r.length > 3 && area(r) > 3)
  .map((r) => d(r, true))
  .join('');
const largo = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const rios = aguas
  .filter((ft) => ft.geometry.type === 'LineString' && ft.properties.tipo === 'Río')
  .map((ft) => simplificar(ft.geometry.coordinates.map(P), 0.3))
  .filter((pts) => largo(pts) > 6)
  .map((pts) => d(pts))
  .join('');

// --- bosque nativo (OTBN 2019, las tres categorías juntas) ---
const bosque = leer('tdf_otbn.geojson')
  .flatMap((ft) => anillos(ft.geometry))
  .map((r) => anillo(r, 0.7))
  .filter((r) => r.length > 3 && area(r) > 6)
  .map((r) => d(r, true))
  .join('');

// --- zonas del índice de peligro: solo los límites internos (los vértices que comparten) ---
const zonas = leer('tdf_fwi_zones.geojson');
const zona = (j) => anillos(zonas.find((z) => z.properties.jurisdiction === j).geometry)[0];
const clave = (p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
function limite(a, b) {
  const enB = new Set(b.map(clave));
  // la corrida más larga de vértices de a que también están en b (el anillo es circular)
  let mejor = [], actual = [];
  for (const p of [...a, ...a]) {
    if (enB.has(clave(p))) actual.push(p);
    else (actual.length > mejor.length && (mejor = actual)), (actual = []);
  }
  if (actual.length > mejor.length) mejor = actual;
  return mejor.slice(0, a.length).map(P);
}
const limNC = limite(zona('norte'), zona('centro'));
const limCS = limite(zona('centro'), zona('sur'));
assert(limNC.length > 5 && limCS.length > 5, 'los límites entre zonas tienen que salir de vértices compartidos');
const centroZona = (j) => {
  const c = caja(zona(j).map(P));
  return [f((c.x0 + c.x1) / 2), f((c.y0 + c.y1) / 2)];
};

// --- incendios registrados (los que tienen año) ---
const incendios = leer('tdf_incendios_historicos.geojson')
  .filter((ft) => +ft.properties.anio > 0)
  .map((ft) => {
    const rs = anillos(ft.geometry).map((r) => anillo(r, 0.08)).filter((r) => r.length > 2);
    const mayor = rs.reduce((a, b) => (area(b) > area(a) ? b : a));
    const c = caja(mayor);
    return { anio: +ft.properties.anio, d: rs.map((r) => d(r, true)).join(''), centro: [f((c.x0 + c.x1) / 2), f((c.y0 + c.y1) / 2)] };
  })
  .sort((a, b) => a.anio - b.anio);
assert.deepEqual([...new Set(incendios.map((i) => i.anio))], [1978, 2008, 2012, 2013, 2019, 2022]);

// --- lugares ---
const RIO_GRANDE = [-67.70186, -53.78583]; // las coordenadas del hero
const lugares = { rioGrande: P(RIO_GRANDE).map(f) };
const i2022 = incendios.find((i) => i.anio === 2022);
// el incendio de 2022 empezó a 12 km de Tolhuin (-54.51, -67.19), al oeste: el perímetro tiene que quedar ahí
const tolhuin = P([-67.19, -54.51]);
assert(i2022.centro[0] < tolhuin[0] - 10 && Math.abs(i2022.centro[1] - tolhuin[1]) < 25, 'el perímetro de 2022 queda al oeste de Tolhuin');
assert(lugares.rioGrande[0] > frontera && lugares.rioGrande[1] > 0, 'Río Grande cae dentro de la provincia');

// --- las capas de Penon, para la lámina en perspectiva ---
// el contorno liviano que repite cada capa; las zonas del índice enteras (se recortan con la isla)
const contorno = provincia.map((r) => d(simplificar(r, 0.9), true)).join('');
const zonasD = Object.fromEntries(['norte', 'centro', 'sur'].map((j) => [j, d(anillo(zona(j), 0.4), true)]));
// zonas industriales (parques y la fuente térmica conocida) y yacimientos en tierra; plataformas
// costa afuera, antorchas y plantas como puntos
const petroleo = leer('tdf_oil_gas.geojson');
const industria = [...leer('tdf_industrial.geojson'), ...petroleo.filter((ft) => !ft.properties.subtype)]
  .flatMap((ft) => anillos(ft.geometry))
  .map((r) => d(anillo(r, 0.15), true))
  .join('');
const centro = (r) => {
  const c = caja(r.map(P));
  return [f((c.x0 + c.x1) / 2), f((c.y0 + c.y1) / 2)];
};
const instalaciones = petroleo.filter((ft) => ft.properties.subtype).map((ft) => centro(anillos(ft.geometry)[0]));
const protegidas = leer('tdf_protected_areas.geojson')
  .flatMap((ft) => anillos(ft.geometry))
  .map((r) => anillo(r, 0.3))
  .filter((r) => r.length > 3 && enMarco(r))
  .map((r) => d(r, true))
  .join('');
const poblados = leer('tdf_settlements.geojson').map((ft) => P(ft.geometry.coordinates).map(f));
assert(instalaciones.length >= 10 && poblados.length === 4, 'faltan instalaciones o poblados');

const salida = {
  fuente: 'IGN (límite provincial, aguas, localidades); IDE Tierra del Fuego (incendios forestales, OTBN 2019); Penon (zonas FWI, zonas industriales y petroleras, áreas protegidas, tierra regional)',
  marco,
  proy: { LON0, LAT0, KX, KY },
  frontera: f(frontera),
  capas: { tierra, chile, chileIsla: chileIsla[0], lagos, rios, bosque, limites: d(limNC) + d(limCS), contorno, industria, protegidas },
  zonasD,
  instalaciones,
  poblados,
  zonas: { norte: centroZona('norte'), centro: centroZona('centro'), sur: centroZona('sur') },
  incendios,
  lugares,
};
writeFileSync(new URL('../src/data/isla.json', import.meta.url), JSON.stringify(salida));
console.log('marco', marco, 'frontera', salida.frontera, 'kB', (JSON.stringify(salida).length / 1024).toFixed(0), Object.fromEntries(Object.entries(salida.capas).map(([k, v]) => [k, v.length])));
