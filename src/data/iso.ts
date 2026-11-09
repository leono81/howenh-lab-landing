// Ejes de la maqueta isométrica (los mismos de scripts/maqueta.mjs): x a lo largo de la costa
// hacia la ciudad (en pantalla, abajo a la izquierda), y tierra adentro (arriba a la izquierda),
// z hacia arriba. Se mira desde el mar, al este: de cada volumen se ven la cara que da a la
// ciudad (+x), la que da al mar (-y) y los techos.
export type P = [number, number];
const C = Math.cos(Math.PI / 6), S = 0.5;
export const iso = (x: number, y: number, z = 0): P => [-C * (x + y), S * (x - y) - z];
const f = (v: number) => (Math.round(v * 10) / 10).toString();
export const pol = (...pts: P[]) => 'M' + pts.map(([a, b]) => `${f(a)} ${f(b)}`).join('L') + 'Z';
export const lin = (...pts: P[]) => 'M' + pts.map(([a, b]) => `${f(a)} ${f(b)}`).join('L');
// rayado entre dos bordes: n-1 líneas repartidas entre a1→a2 y b1→b2 (chapas, tablas, sombras)
export const rayas = (a1: P, a2: P, b1: P, b2: P, n: number) => {
  let d = '';
  for (let i = 1; i < n; i++) {
    const t = i / n;
    d += lin([a1[0] + (b1[0] - a1[0]) * t, a1[1] + (b1[1] - a1[1]) * t], [a2[0] + (b2[0] - a2[0]) * t, a2[1] + (b2[1] - a2[1]) * t]);
  }
  return d;
};
