// Construye src/data/mapa.json desde los datos OSM de docs/lugar/.
// Proyecta, gira el mapa para que la costa quede horizontal (mar arriba) y simplifica.
// Uso: node scripts/mapa.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const L = new URL('../docs/lugar/', import.meta.url);
const leer = (f) => JSON.parse(readFileSync(new URL(f, L), 'utf8'));

// --- proyección: km locales, y hacia abajo; después giro ---
const LAT0 = -53.75, LON0 = -67.77;
const KX = 111.32 * Math.cos((LAT0 * Math.PI) / 180), KY = 110.57;
const plano = ([lon, lat]) => [(lon - LON0) * KX, -(lat - LAT0) * KY];

const BALIZA = [-67.84759, -53.68729];
const BOCA = [-67.68794, -53.78563];
const [bx, by] = plano(BALIZA), [ex, ey] = plano(BOCA);
const ANG = -Math.atan2(ey - by, ex - bx); // la recta baliza→boca queda horizontal
const cos = Math.cos(ANG), sin = Math.sin(ANG);
const U = 100; // unidades del SVG por km
const girar = ([x, y]) => [(x * cos - y * sin) * U, (x * sin + y * cos) * U];
const P = (c) => girar(plano(c));

// --- marco: 3 km al oeste de la baliza hasta 3 km al este de la boca ---
const [gbx, gby] = P(BALIZA), [gex] = P(BOCA);
const X0 = gbx - 3 * U, X1 = gex + 3 * U;
const ANCHO = X1 - X0;
const ALTO = ANCHO * 9 / 16;
const COSTA_Y = 0.62; // la costa a esta fracción del alto
const Y0 = gby - ALTO * COSTA_Y;
const marco = { x: 0, y: 0, w: Math.round(ANCHO), h: Math.round(ALTO) };
const enMarco = ([x, y]) => [x - X0, y - Y0];
const T = (c) => enMarco(P(c));

// --- Douglas-Peucker ---
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  for (let i = 1; i < pts.length - 1; i++) {
    // anillo cerrado (a == b): distancia al punto, no a la recta
    const d = len ? Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len : Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]);
    if (d > max) (max = d), (idx = i);
  }
  if (max <= tol) return [a, b];
  return [...simplificar(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplificar(pts.slice(idx), tol)];
}
const MARGEN = 400;
// el hero corta el mapa unos 5 km tierra adentro: lo de más abajo no se ve y no se exporta
const FONDO = ALTO * COSTA_Y + 520;
const dentro = ([x, y]) => x > -MARGEN && x < marco.w + MARGEN && y > -MARGEN && y < FONDO;
const camino = (coords, cerrar = false, tol = 0.8) => {
  const pts = simplificar(coords.map(T), tol);
  if (!pts.some(dentro)) return null;
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + (cerrar ? 'Z' : '');
};

// --- encadenar ways por sus extremos (costa, anillos de multipolígonos) ---
const k = (c) => `${c[0].toFixed(7)},${c[1].toFixed(7)}`;
function encadenar(lineas) {
  const resto = lineas.map((l) => [...l]);
  const cadenas = [];
  while (resto.length) {
    let c = resto.shift();
    let creció = true;
    while (creció) {
      creció = false;
      for (let i = 0; i < resto.length; i++) {
        const l = resto[i];
        if (k(l[0]) === k(c[c.length - 1])) c = [...c, ...l.slice(1)];
        else if (k(l[l.length - 1]) === k(c[0])) c = [...l, ...c.slice(1)];
        else if (k(l[l.length - 1]) === k(c[c.length - 1])) c = [...c, ...[...l].reverse().slice(1)];
        else if (k(l[0]) === k(c[0])) c = [...[...l].reverse(), ...c.slice(1)];
        else continue;
        resto.splice(i, 1);
        creció = true;
        break;
      }
    }
    cadenas.push(c);
  }
  return cadenas;
}

// --- costa → polígono del mar ---
const costa = leer('costa.geojson').features.map((f) => f.geometry.coordinates);
const cadenas = encadenar(costa).sort((a, b) => b.length - a.length);
// la cadena que cruza el marco de punta a punta
const cruza = (c) => {
  const xs = c.map(T).map((p) => p[0]);
  return Math.min(...xs) < 0 && Math.max(...xs) > marco.w;
};
const principal = cadenas.find(cruza);
if (!principal) throw new Error('No hay una costa continua que cruce el marco');
let ptsCosta = principal.map(T);
if (ptsCosta[0][0] > ptsCosta[ptsCosta.length - 1][0]) ptsCosta.reverse();
ptsCosta = simplificar(ptsCosta, 0.8);
const f1 = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lineaCosta = 'M' + ptsCosta.map(f1).join('L');
const [pi, pf] = [ptsCosta[0], ptsCosta[ptsCosta.length - 1]];
const mar = lineaCosta + `L${f1([pf[0], -2000])}L${f1([pi[0], -2000])}Z`;

// --- multipolígonos de Overpass (relaciones con geometría) ---
const agua = leer('osm/agua.json').elements;
function anillos(rel, rol = 'outer') {
  const ways = rel.members.filter((m) => m.type === 'way' && m.role === rol && m.geometry).map((m) => m.geometry.map((g) => [g.lon, g.lat]));
  return encadenar(ways).filter((c) => k(c[0]) === k(c[c.length - 1]));
}
const area = (rel) => [...anillos(rel, 'outer'), ...anillos(rel, 'inner')].map((r) => camino(r, true)).filter(Boolean).join('');
const rel = (id) => agua.find((e) => e.id === id);
const estuario = area(rel(2146734));
const humedal = area(rel(12238641));
const playa = area(rel(11347534));
const arenas = agua.filter((e) => e.type === 'way' && e.tags?.natural === 'sand').map((e) => camino(e.geometry.map((g) => [g.lon, g.lat]), true)).filter(Boolean).join('');

// --- ríos, lagunas ---
const rio = leer('rio.geojson').features;
const lagunas = rio
  .filter((f) => f.geometry.type === 'Polygon')
  .map((f) => camino(f.geometry.coordinates[0], true, 0.6))
  .filter(Boolean);
const cauce = rio.find((f) => f.properties.osm === 'way/147153507');
const rioLinea = camino(cauce.geometry.coordinates, false, 0.6);
const arroyos = rio
  .filter((f) => f.geometry.type === 'LineString' && f.properties.waterway && f.properties.osm !== 'way/147153507')
  .map((f) => camino(f.geometry.coordinates, false, 0.6))
  .filter(Boolean)
  .join('');

// --- ruta 3 ---
const ruta = leer('ruta3.geojson').features.map((f) => camino(f.geometry.coordinates)).filter(Boolean).join('');

// --- calles de la ciudad ---
const calles = leer('osm/calles.json').elements.filter((e) => e.type === 'way' && e.geometry);
const tipo = (e) => e.tags.highway;
const trama = calles
  .filter((e) => !['trunk', 'service'].includes(tipo(e)))
  .map((e) => camino(e.geometry.map((g) => [g.lon, g.lat]), false, 0.5))
  .filter(Boolean)
  .join('');
const avenidas = calles
  .filter((e) => ['primary', 'secondary'].includes(tipo(e)))
  .map((e) => camino(e.geometry.map((g) => [g.lon, g.lat]), false, 0.5))
  .filter(Boolean)
  .join('');

// --- aeropuerto ---
const aero = leer('aeropuerto.geojson').features;
const pista = aero.filter((f) => f.properties.aeroway === 'runway' && f.properties.ref === '08/26').map((f) => camino(f.geometry.coordinates, false, 0.3)).join('');
const rodajes = aero.filter((f) => f.properties.aeroway === 'taxiway').map((f) => camino(f.geometry.coordinates, false, 0.3)).filter(Boolean).join('');
const plataformas = aero.filter((f) => ['apron', 'terminal', 'hangar'].includes(f.properties.aeroway)).map((f) => camino(f.geometry.coordinates[0], true, 0.3)).filter(Boolean).join('');

// --- puntos de los lugares (para viñetas y animación) ---
const lugares = {
  baliza: T(BALIZA),
  cabo: T([-67.84683, -53.68843]),
  mision: T([-67.79888, -53.72465]),
  torre: T([-67.69593, -53.78558]),
  boca: T(BOCA),
  aeropuerto: T([-67.7495, -53.7776]),
};
for (const n in lugares) lugares[n] = lugares[n].map((v) => +v.toFixed(1));

// --- relieve: hachures (rayitas en la dirección de la pendiente, más gruesas cuanto más empinado) ---
// Necesita docs/lugar/dem-marco.bin (scripts/relieve.py). Sin él, el mapa sale sin relieve.
let azarS = 7;
const azar = () => (azarS = (azarS * 16807) % 2147483647) / 2147483647;
let hachures = [], estepa = '';
const demUrl = new URL('dem-marco.bin', L);
if (existsSync(demUrl)) {
  const b = readFileSync(demUrl);
  const [nx, ny, paso] = [b.readInt32LE(0), b.readInt32LE(4), b.readInt32LE(8)];
  let z = new Float32Array(nx * ny);
  for (let i = 0; i < nx * ny; i++) z[i] = b.readInt16LE(12 + i * 2) / 10;
  // suavizado 3x3, dos pasadas: el DSM tiene ruido de ±1-2 m
  for (let n = 0; n < 2; n++) {
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
  const alt = (x, y) => {
    const fq = Math.min(nx - 1.001, Math.max(0, x / paso)), fr = Math.min(ny - 1.001, Math.max(0, y / paso));
    const q = Math.floor(fq), r = Math.floor(fr), tq = fq - q, tr = fr - r;
    const i = r * nx + q;
    return z[i] * (1 - tq) * (1 - tr) + z[i + 1] * tq * (1 - tr) + z[i + nx] * (1 - tq) * tr + z[i + nx + 1] * tq * tr;
  };
  const metros = 10; // 1 unidad = 10 m
  const grad = (x, y) => {
    const h = paso;
    return [(alt(x + h, y) - alt(x - h, y)) / (2 * h * metros), (alt(x, y + h) - alt(x, y - h)) / (2 * h * metros)];
  };

  // máscara de ciudad: celdas de 20 u con calles cerca (no se raya el relieve ni la estepa adentro)
  const CEL = 20, mw = Math.ceil(marco.w / CEL), mh = Math.ceil(marco.h / CEL);
  const urbano = new Uint8Array(mw * mh);
  for (const e of calles) {
    if (['trunk', 'service'].includes(tipo(e))) continue;
    for (const g of e.geometry) {
      const [x, y] = T([g.lon, g.lat]);
      const q = Math.floor(x / CEL), r = Math.floor(y / CEL);
      for (let dr = -1; dr <= 1; dr++) for (let dq = -1; dq <= 1; dq++) {
        const rr = r + dr, qq = q + dq;
        if (rr >= 0 && qq >= 0 && rr < mh && qq < mw) urbano[rr * mw + qq] = 1;
      }
    }
  }
  const enCiudad = (x, y) => urbano[Math.floor(y / CEL) * mw + Math.floor(x / CEL)] === 1;

  // agua: mar por encima de la costa + lagunas + estuario (punto en polígono)
  const poligonos = [
    ...rio.filter((f) => f.geometry.type === 'Polygon').map((f) => f.geometry.coordinates[0].map(T)),
    ...anillos(rel(2146734)).map((r) => r.map(T)),
  ];
  const enPoli = (x, y, pts) => {
    let a = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) a = !a;
    }
    return a;
  };
  // y de la costa para cada x (la costa ya está ordenada de izquierda a derecha)
  const costaEn = (x) => {
    for (let i = 1; i < ptsCosta.length; i++) {
      const [x1, y1] = ptsCosta[i - 1], [x2, y2] = ptsCosta[i];
      if ((x1 <= x && x <= x2) || (x2 <= x && x <= x1)) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1 || 1);
    }
    return 0;
  };
  const enAgua = (x, y) => y < costaEn(x) + 1.5 || alt(x, y) < 0.3 || poligonos.some((p) => enPoli(x, y, p));

  // hachures: barrancas (empinado) en tinta llena; laderas suaves, finas y ralas. Rayitas rectas
  // en la dirección de la caída, en grilla de ladrillo, como en las cartas grabadas.
  const H = 3.6; // separación entre rayitas
  const PROF = 420; // solo los primeros ~4 km tierra adentro
  const fuerte = new Map(), suave = [];
  let fila = 0;
  for (let y = H / 2; y < FONDO; y += H, fila++)
    for (let x = (fila % 2) * (H / 2); x < marco.w; x += H) {
      const sx = x + (azar() - 0.5) * H * 0.3, sy = y + (azar() - 0.5) * H * 0.3;
      const yc = costaEn(sx);
      if (sy > yc + PROF) continue;
      const [gx, gy] = grad(sx, sy);
      const pend = Math.hypot(gx, gy);
      const empinado = pend >= 0.1;
      if (pend < 0.035) continue;
      if (!empinado && (fila % 2 || pend < 0.05 || sy > yc + 220)) continue; // las suaves: ralas y solo cerca de la costa
      if (enCiudad(sx, sy) || enAgua(sx, sy)) continue;
      const ux = -gx / pend, uy = -gy / pend; // cuesta abajo
      const l = (empinado ? 1.25 : 0.9) * H;
      const seg = `M${(sx - (ux * l) / 2).toFixed(1)} ${(sy - (uy * l) / 2).toFixed(1)}l${(ux * l).toFixed(1)} ${(uy * l).toFixed(1)}`;
      if (empinado) {
        const w = pend > 0.3 ? 1.6 : pend > 0.2 ? 1.25 : pend > 0.14 ? 0.95 : 0.7;
        fuerte.set(w, (fuerte.get(w) || '') + seg);
      } else suave.push(seg);
    }
  hachures = [...[...fuerte].map(([w, d]) => ({ w, d, suave: false })), { w: 0.55, d: suave.join(''), suave: true }];

  // estepa: matas de coirón sueltas en lo llano, lejos de la ciudad, el agua y las barrancas
  const matas = [];
  for (let i = 0; i < 2600; i++) {
    const x = azar() * marco.w, y = costaEn(0) - 40 + azar() * (FONDO - costaEn(0) + 40);
    const [gx, gy] = grad(x, y);
    if (Math.hypot(gx, gy) > 0.02 || enCiudad(x, y) || enAgua(x, y) || y < costaEn(x) + 8) continue;
    const s = 0.8 + azar() * 0.6;
    const f = (v) => (v * s).toFixed(1);
    matas.push(`M${x.toFixed(1)} ${y.toFixed(1)}l${f(-1.6)} ${f(-2.6)}M${x.toFixed(1)} ${y.toFixed(1)}l${f(0.2)} ${f(-3.4)}M${x.toFixed(1)} ${y.toFixed(1)}l${f(1.7)} ${f(-2.4)}M${(x - 2.4 * s).toFixed(1)} ${y.toFixed(1)}h${f(4.8)}`);
  }
  estepa = matas.join('');
  console.log('hachures', hachures.map((g) => [g.w, g.d.length]), 'matas', matas.length);
}

// norte en el mapa girado (para la rosa)
const norte = +(((-ANG * 180) / Math.PI) - 0).toFixed(1);

const salida = {
  fuente: '© OpenStreetMap contributors (ODbL)',
  unidadesPorKm: U,
  marco,
  costaY: Math.round(ALTO * COSTA_Y),
  // para que scripts/relieve.py muestree el DEM en el mismo marco
  proy: { LAT0, LON0, KX, KY, ANG, U, X0, Y0 },
  giroGrados: +((ANG * 180) / Math.PI).toFixed(2),
  norte,
  capas: { mar, lineaCosta, estuario, humedal, playa, arenas, lagunas, rioLinea, arroyos, ruta, trama, avenidas, pista, rodajes, plataformas, hachures, estepa },
  lugares,
};
writeFileSync(new URL('../src/data/mapa.json', import.meta.url), JSON.stringify(salida));
console.log('marco', marco, 'giro', salida.giroGrados, 'lugares', lugares, 'bytes', JSON.stringify(salida).length);
