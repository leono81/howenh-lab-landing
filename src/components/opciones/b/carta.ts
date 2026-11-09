// Aparato cartográfico de la lámina (opción B): lleva latitud/longitud ↔ unidades de la
// maqueta, al nivel del mar, para graduar el marco, orientar la rosa y medir la escala.
// Nada va a ojo: sale de la proyección de mapa.json y de la matriz de maqueta.json.
import mapa from '../../../data/mapa.json';
import maqueta from '../../../data/maqueta.json';

export type P = [number, number];
export type Ventana = { x: number; y: number; w: number; h: number };

const { LAT0, LON0, KX, KY, ANG, U, X0, Y0 } = mapa.proy;
const cY = mapa.costaY;
const C = Math.cos(Math.PI / 6), S = 0.5;

// ponytail: la compresión de la costa no viaja en maqueta.json; estas tres constantes son
// copia de scripts/maqueta.mjs (ZONAS, RAMPA, A0). Si allá cambian, falla la comprobación
// de abajo. Lo prolijo sería que el script las exporte en el JSON.
const ZONAS = [[480, 720, 0.3], [890, 1260, 0.45]], RAMPA = 50, A0 = 20;
const suave = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const escala = (x: number) => {
  let s = 1;
  for (const [a, b, k] of ZONAS) s = Math.min(s, 1 - (1 - k) * suave((x - a) / RAMPA + 0.5) * (1 - suave((x - b) / RAMPA + 0.5)));
  return s;
};
const TX0 = -1200, TX1 = 3200;
const tabla = new Float64Array(TX1 - TX0 + 1);
for (let i = 1; i < tabla.length; i++) tabla[i] = tabla[i - 1] + escala(TX0 + i - 0.5);
const Wc = (x: number) => {
  const f = Math.min(tabla.length - 1.001, Math.max(0, x - TX0)), i = Math.floor(f);
  return tabla[i] + (tabla[i + 1] - tabla[i]) * (f - i);
};
const W = (x: number) => Wc(x) - Wc(A0); // x del marco del mapa → a (costa comprimida)
const Winv = (a: number) => {
  let lo = TX0, hi = TX1;
  for (let n = 0; n < 32; n++) {
    const m = (lo + hi) / 2;
    if (W(m) < a) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
};

// la matriz de la maqueta: (a, y) de la planta → pantalla
const [, , , , E, F] = maqueta.matriz.match(/-?[\d.]+/g)!.map(Number);
const OX = E - C * cY, OY = F - S * cY;
const iso = (a: number, y: number): P => [OX - C * (a + y - cY), OY + S * (a - y + cY)];

const cos = Math.cos(ANG), sin = Math.sin(ANG);
/** un punto del marco de mapa.json (planta, 100 unidades = 1 km) → maqueta, al nivel del mar */
export const dePlanta = (x: number, y: number): P => iso(W(x), y);
/** maqueta (al nivel del mar) → [longitud, latitud] */
export const aGeo = (u: number, v: number): P => {
  const p = (OX - u) / C, q = (v - OY) / S;
  const xr = (Winv((p + q) / 2) + X0) / U, yr = (cY + (p - q) / 2 + Y0) / U;
  return [(xr * cos + yr * sin) / KX + LON0, -(-xr * sin + yr * cos) / KY + LAT0];
};

// Rumbos sobre el plano del mar, en pantalla, por unidad de planta (donde la escala es la
// real). El norte de la planta girada es (sen ANG, -cos ANG); el este, (cos ANG, sen ANG).
const lineal = (x: number, y: number): P => [-C * (x + y), S * (x - y)];
export const NORTE = lineal(sin, -cos);
export const ESTE = lineal(cos, sin);
/** un punto de la rosa: radio en unidades de planta, rumbo en grados desde el norte hacia el este */
export const rumbo = (centro: P, radio: number, grados: number): P => {
  const t = (grados * Math.PI) / 180;
  return [centro[0] + radio * (NORTE[0] * Math.cos(t) + ESTE[0] * Math.sin(t)), centro[1] + radio * (NORTE[1] * Math.cos(t) + ESTE[1] * Math.sin(t))];
};
/** los dos ejes de la maqueta en pantalla: a lo largo de la costa (hacia la ciudad) y hacia el mar */
export const EJE_COSTA: P = [-C, S];
export const EJE_MAR: P = [C, S];
export const KM = mapa.unidadesPorKm;
/** el centro de cada tramo de costa abreviado, en x del marco de mapa.json */
export const ABREVIADOS = ZONAS.map(([a, b]) => (a + b) / 2);

export type Marca = { t: number; seg: number };
// Graduación de un lado del marco: dónde cruza cada múltiplo de `paso` (segundos de arco) de
// la latitud (eje 1) o la longitud (eje 0). En los tramos abreviados las marcas se juntan.
function lado(p0: P, p1: P, eje: 0 | 1, paso: number): Marca[] {
  const N = 800, marcas = new Map<number, number>();
  const en = (i: number) => (aGeo(p0[0] + ((p1[0] - p0[0]) * i) / N, p0[1] + ((p1[1] - p0[1]) * i) / N)[eje] * 3600) / paso;
  let antes = en(0);
  for (let i = 1; i <= N; i++) {
    const ahora = en(i);
    for (let k = Math.ceil(Math.min(antes, ahora)); k <= Math.max(antes, ahora); k++) if (!marcas.has(k)) marcas.set(k, (i - 1 + (k - antes) / (ahora - antes)) / N);
    antes = ahora;
  }
  return [...marcas].map(([k, t]) => ({ t, seg: Math.abs(k * paso) })).sort((a, b) => a.t - b.t);
}
/** latitud en los lados de arriba y abajo (cada 10″), longitud en los costados (cada 30″) */
export const graduar = ({ x, y, w, h }: Ventana) => ({
  arriba: lado([x, y], [x + w, y], 1, 10),
  abajo: lado([x, y + h], [x + w, y + h], 1, 10),
  izquierda: lado([x, y], [x, y + h], 0, 30),
  derecha: lado([x + w, y], [x + w, y + h], 0, 30),
});
export const grados = (seg: number, letra: string) => `${Math.floor(seg / 3600)}°${String(Math.round((seg % 3600) / 60)).padStart(2, '0')}′ ${letra}`;

// --- comprobación: esta copia de la proyección tiene que caer donde cae la maqueta ---
// (la abscisa no depende de la altura; la ordenada se compara en la boca, que está a nivel del mar)
for (const k of Object.keys(mapa.lugares) as (keyof typeof mapa.lugares)[]) {
  const [u, v] = dePlanta(mapa.lugares[k][0], mapa.lugares[k][1]);
  const [mu, mv] = maqueta.lugares[k];
  if (Math.abs(u - mu) > 0.6 || (k === 'boca' && Math.abs(v - mv) > 0.6)) throw new Error(`carta.ts: la proyección no coincide con la maqueta en «${k}»`);
}
const [lonB, latB] = aGeo(...dePlanta(mapa.lugares.baliza[0], mapa.lugares.baliza[1]));
if (Math.abs(lonB + 67.8476) > 2e-4 || Math.abs(latB + 53.6873) > 2e-4) throw new Error('carta.ts: la baliza no cae en su latitud y longitud');
