// Vista de costa del Cabo Domingo, como en las cartas náuticas: el relieve real (DEM)
// visto desde el mar, en perspectiva, con el relieve exagerado y dibujado en líneas.
// Algoritmo de horizonte flotante: cortes del terreno de cerca a lejos; de cada corte se
// dibuja solo lo que asoma por encima de lo ya dibujado. Donde un corte asoma mucho sobre
// el anterior hay una pared (la barranca): se raya en vertical, como las cárcavas.
// Uso: node scripts/vista.mjs  (necesita docs/lugar/dem-vista.bin, de scripts/relieve.py --vista)
import { readFileSync, writeFileSync } from 'node:fs';

const L = new URL('../docs/lugar/', import.meta.url);
const mapa = JSON.parse(readFileSync(new URL('../src/data/mapa.json', import.meta.url), 'utf8'));
const b = readFileSync(new URL('dem-vista.bin', L));
const [nx, ny, paso, OX, OY] = [0, 4, 8, 12, 16].map((o) => b.readInt32LE(o));
const z = new Float32Array(nx * ny);
for (let i = 0; i < nx * ny; i++) z[i] = b.readInt16LE(20 + i * 2) / 10;
if (false) {
  const s = new Float32Array(nx * ny);
  for (let r = 0; r < ny; r++)
    for (let q = 0; q < nx; q++) {
      let t = 0, m = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dq = -1; dq <= 1; dq++) {
          const rr = r + dr, qq = q + dq;
          if (rr >= 0 && qq >= 0 && rr < ny && qq < nx) (t += z[rr * nx + qq]), m++;
        }
      s[r * nx + q] = t / m;
    }
}
const alt = (x, y) => {
  const fq = (x - OX) / paso, fr = (y - OY) / paso;
  if (fq < 0 || fr < 0 || fq >= nx - 1 || fr >= ny - 1) return 0;
  const q = Math.floor(fq), r = Math.floor(fr), tq = fq - q, tr = fr - r, i = r * nx + q;
  return z[i] * (1 - tq) * (1 - tr) + z[i + 1] * tq * (1 - tr) + z[i + nx] * (1 - tq) * tr + z[i + nx + 1] * tq * tr;
};

// --- cámara (unidades del marco: 1 u = 10 m; alturas en metros) ---
const costa = mapa.costaY;
const [bx, by] = mapa.lugares.baliza;
const CAM = { x: bx + 210, y: costa - 32, h: 6 }; // 2,1 km al SE del cabo, 320 m mar adentro
const MIRA = { x: bx - 70, y: costa + 45 };
const EXAG = 2.0; // exageración vertical
const W = 960, H = 340, HORIZONTE = H * 0.74, FOV = (24 * Math.PI) / 180;
const F = W / 2 / Math.tan(FOV / 2);
let fx = MIRA.x - CAM.x, fy = MIRA.y - CAM.y;
const fn = Math.hypot(fx, fy);
(fx /= fn), (fy /= fn);
const rx = -fy, ry = fx; // derecha de la mirada
const proyectar = (x, y, zm) => {
  const dx = x - CAM.x, dy = y - CAM.y;
  const d = (dx * fx + dy * fy) * 10, l = (dx * rx + dy * ry) * 10;
  if (d < 1) return null;
  return [W / 2 + (F * l) / d, HORIZONTE - (F * (zm * EXAG - CAM.h)) / d, d];
};

// dirección de la luz en el marco (x, y, z): de arriba a la izquierda (noroeste) y bastante rasante
const LUZ = (() => { const v = [-0.75, -0.45, 0.5], n = Math.hypot(...v); return v.map((c) => c / n); })();
let semilla = 11;
const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;

// --- cortes de cerca a lejos con horizonte flotante ---
const horizonte = new Float32Array(W).fill(H);
const lineas = []; // { d, pts: [[u,v]...], agua }
const rayas = []; // paredes: segmentos verticales
const capasSed = []; // marcas de las capas en la barranca
const DMIN = 250, DMAX = 16000;
// columnas con cárcava: fijas, así los tramos de cortes sucesivos se apilan en surcos largos
const carcava = new Uint8Array(W);
for (let u = 0, sig = 0; u < W; u++) if (u >= sig) (carcava[u] = 1), (sig = u + 2 + Math.floor(azar() * 4));
let nCorte = 0;
for (let d = DMIN; d < DMAX; d *= 1.011, nCorte++) {
  // para cada columna de pantalla, el punto del terreno a esa distancia
  const corte = new Float32Array(W), agua = new Uint8Array(W), pend = new Float32Array(W), sombra = new Float32Array(W);
  for (let u = 0; u < W; u++) {
    const l = ((u - W / 2) * d) / F; // metros a la derecha
    const x = CAM.x + (fx * d + rx * l) / 10, y = CAM.y + (fy * d + ry * l) / 10;
    const zm = alt(x, y);
    const gx = (alt(x + 3, y) - alt(x - 3, y)) / 60, gy = (alt(x, y + 3) - alt(x, y - 3)) / 60; // m/m
    pend[u] = Math.hypot(gx, gy);
    // sombra: luz rasante del noroeste (el sol del sur viene del norte), con el relieve exagerado
    const nxl = -gx * EXAG, nyl = -gy * EXAG, nn = Math.hypot(nxl, nyl, 1);
    sombra[u] = 1 - Math.max(0, (nxl * LUZ[0] + nyl * LUZ[1] + LUZ[2]) / nn);
    agua[u] = zm < 0.4 ? 1 : 0;
    corte[u] = HORIZONTE - (F * (Math.max(0, zm) * EXAG - CAM.h)) / d;
  }
  let tramo = null;
  const cerrar = () => {
    if (tramo && tramo.pts.length > 1) lineas.push(tramo);
    tramo = null;
  };
  for (let u = 0; u < W; u++) {
    const v = corte[u];
    if (v < horizonte[u] - 0.25) {
      const salto = horizonte[u] - v;
      // pared: el corte asoma mucho sobre lo que estaba delante
      if (!agua[u] && horizonte[u] < H && pend[u] > 0.18) {
        // barranca: cárcavas (verticales, irregulares) y capas de sedimento (horizontales, cada 6 m)
        // cárcavas: más juntas y gruesas en la sombra, ralas en la cara al sol
        const sm = sombra[u];
        if (carcava[u] && azar() < 0.25 + sm) rayas.push([u + (azar() - 0.5) * 0.8, v, v + salto, sm]);
        for (let nivel = 6; nivel < 140; nivel += 6) {
          const vl = HORIZONTE - (F * (nivel * EXAG - CAM.h)) / d;
          if (vl > v && vl < horizonte[u] && azar() < 0.8) capasSed.push([u, vl]);
        }
      }
      // en la barranca no van los cortes (cruzarían las capas): ahí mandan cárcavas y sedimento
      if (!agua[u] && pend[u] > 0.18) cerrar();
      else {
        if (!tramo || tramo.agua !== agua[u]) {
          cerrar();
          tramo = { d, corte: nCorte, agua: agua[u], pts: [] };
        }
        tramo.pts.push([u, v]);
      }
      horizonte[u] = v;
    } else cerrar();
  }
  cerrar();
}

// --- simplificar y agrupar por grosor (cerca más grueso) ---
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, c] = [pts[0], pts[pts.length - 1]];
  const dx = c[0] - a[0], dy = c[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const dd = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len;
    if (dd > max) (max = dd), (idx = i);
  }
  if (max <= tol) return [a, c];
  return [...simplificar(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplificar(pts.slice(idx), tol)];
}
const f1 = (n) => n.toFixed(1);
const grupos = {};
let n = 0;
for (const t of lineas) {
  n++;
  if (t.agua) continue; // el mar se dibuja aparte
  if (t.corte % 4) continue; // de la tierra, un corte de cada cuatro
  const w = t.agua ? 0.5 : t.d < 2500 ? 1.1 : t.d < 5000 ? 0.85 : t.d < 9000 ? 0.6 : 0.45;
  const clave = `${t.agua ? 'a' : 't'}${w}`;
  const pts = simplificar(t.pts, 0.35);
  (grupos[clave] ||= []).push('M' + pts.map(([u, v]) => `${f1(u)} ${f1(v)}`).join('L'));
}
const capas = Object.entries(grupos).map(([k, ds]) => ({ agua: k[0] === 'a', w: +k.slice(1), d: ds.join('') }));
// silueta: el horizonte final, en tinta llena
const silueta = [];
let tramoS = [];
for (let u = 0; u < W; u++) {
  if (horizonte[u] < HORIZONTE - 0.5) tramoS.push([u, horizonte[u]]);
  else if (tramoS.length) silueta.push(tramoS), (tramoS = []);
}
if (tramoS.length) silueta.push(tramoS);
const perfil = silueta.map((t) => 'M' + simplificar(t, 0.3).map(([u, v]) => `${f1(u)} ${f1(v)}`).join('L')).join('');
// mar: líneas horizontales cada vez más separadas hacia el frente
const mar = [];
for (let k = 0, v = HORIZONTE + 1.5; v < H; k++, v += 1.6 + k * 0.55) mar.push(`M0 ${f1(v)}H${W}`);
const sedimento = capasSed.map(([u, v]) => `M${u - 0.6} ${f1(v)}h1.8`).join('');
// cárcavas en tres grosores según la sombra
const paredes = [0.45, 0.75, 1.1].map((w, i) => ({
  w,
  d: rayas.filter(([, , , sm]) => (sm < 0.45 ? 0 : sm < 0.7 ? 1 : 2) === i).map(([u, v1, v2]) => `M${f1(u)} ${f1(v1)}V${f1(v2)}`).join(''),
}));

// baliza: en su lugar real, sobre la meseta
const zb = alt(bx, by);
const pb = proyectar(bx, by, zb);
const salida = {
  ancho: W,
  alto: H,
  horizonte: HORIZONTE,
  capas,
  paredes,
  sedimento,
  perfil,
  mar: mar.join(''),
  baliza: pb && [+f1(pb[0]), +f1(horizonte[Math.round(pb[0])] ?? pb[1])],
  camara: { x: CAM.x, y: CAM.y, mira: MIRA },
  fuente: 'Copernicus DEM GLO-30 © DLR e.V. 2010-2014 y © Airbus Defence and Space GmbH 2014-2018, provisto bajo COPERNICUS por la Unión Europea y la ESA',
};
writeFileSync(new URL('../src/data/vista.json', import.meta.url), JSON.stringify(salida));
console.log('lineas', lineas.length, 'paredes', rayas.length, 'baliza', salida.baliza, 'alt baliza', zb.toFixed(1), 'bytes', JSON.stringify(salida).length);
