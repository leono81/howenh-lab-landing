// Cómo se dibuja el plano del mapa en pantalla. El mapa está en coordenadas de planta
// (x a lo largo de la costa, y hacia tierra adentro; ver scripts/mapa.mjs). Una proyección
// paralela de un plano es una transformación afín: u = a·x + c·y, v = b·x + d·y.
// (La isométrica con relieve levantado no sale de acá: es la maqueta de scripts/maqueta.mjs.)
import mapa from './mapa.json';

export type Proyeccion = 'plano' | 'caballera';

export const MATRICES: Record<Proyeccion, [number, number, number, number]> = {
  plano: [1, 0, 0, 1],
  // perspectiva caballera (oblicua): la costa sigue horizontal; la profundidad se acorta
  // y se corre en diagonal, como mirar la mesa desde el sur, levantado.
  caballera: [1, 0, -0.42, 0.52],
};

// lo que hay con datos: todo el ancho, del mar hasta ~5 km tierra adentro
const FONDO = mapa.costaY + 520;

export function encuadre(p: Proyeccion) {
  const [a, b, c, d] = MATRICES[p];
  const m = (x: number, y: number): [number, number] => [a * x + c * y, b * x + d * y];
  const esquinas = [m(0, 0), m(mapa.marco.w, 0), m(0, FONDO), m(mapa.marco.w, FONDO)];
  const x0 = Math.min(...esquinas.map((e) => e[0])), x1 = Math.max(...esquinas.map((e) => e[0]));
  const y0 = Math.min(...esquinas.map((e) => e[1])), y1 = Math.max(...esquinas.map((e) => e[1]));
  const proyectar = (x: number, y: number): [number, number] => {
    const [u, v] = m(x, y);
    return [u - x0, v - y0];
  };
  return {
    ancho: x1 - x0,
    alto: y1 - y0,
    matriz: `matrix(${a} ${b} ${c} ${d} ${-x0} ${-y0})`,
    proyectar,
    // altura de la costa (en el centro del mapa) dentro del encuadre, para ubicarlo en el hero
    costaY: proyectar(mapa.marco.w / 2, mapa.costaY)[1],
  };
}
