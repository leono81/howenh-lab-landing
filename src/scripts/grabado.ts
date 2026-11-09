// Grabado en línea: dibuja una imagen como trama de líneas horizontales cuyo
// grosor sigue la oscuridad de cada punto, como una lámina grabada en tinta.
// Precalcula la luminancia una vez; cada cuadro solo recalcula grosores, así
// el atardecer y el haz del faro se animan sobre el mismo grabado.

export type Punto = { x: number; y: number }; // fracciones (0..1) del canvas

export interface Estado {
  revelado: number; // 0..1, cuánto del grabado ya se "imprimió" (de arriba hacia abajo)
  atardecer: number; // 0..1, oscurece el cielo
  haz: number; // 0..1, intensidad del haz
  angulo: number; // radianes, dirección del haz (0 = derecha, positivo = hacia abajo)
  barco: Punto | null; // centro del barco, para despejar las líneas detrás
}

interface Opciones {
  tinta: string;
  paso: number; // separación entre líneas en px
  contraste: number;
  gamma: number;
  enfoque: Punto; // qué parte de la imagen queda visible al recortar
  faro: Punto; // posición de la baliza en la imagen (fracciones de la imagen)
  aperturaHaz: number; // radianes
  cielo: (u: number, v: number) => number; // 0..1, cuánto es cielo ese punto de la imagen
  abierto: (u: number, v: number) => number; // 0..1, dónde se ve el haz (cielo y mar, no la roca)
}

export class Grabado {
  private ctx: CanvasRenderingContext2D;
  private lum = new Float32Array(0);
  private lw = 0;
  private lh = 0;
  private W = 0;
  private H = 0;
  private escala = 1;
  private dx = 0;
  private dy = 0;

  constructor(private canvas: HTMLCanvasElement, private img: HTMLImageElement, private o: Opciones) {
    this.ctx = canvas.getContext('2d')!;
    this.medir();
  }

  medir() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.W = this.canvas.clientWidth;
    this.H = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // encuadre "cover" de la imagen dentro del canvas
    const { width: iw, height: ih } = this.img;
    this.escala = Math.max(this.W / iw, this.H / ih);
    this.dx = (this.W - iw * this.escala) * this.o.enfoque.x;
    this.dy = (this.H - ih * this.escala) * this.o.enfoque.y;
    // luminancia a media resolución
    this.lw = Math.ceil(this.W / 2);
    this.lh = Math.ceil(this.H / 2);
    const off = document.createElement('canvas');
    off.width = this.lw;
    off.height = this.lh;
    const oc = off.getContext('2d')!;
    oc.fillStyle = '#fff';
    oc.fillRect(0, 0, this.lw, this.lh);
    oc.drawImage(this.img, this.dx / 2, this.dy / 2, (iw * this.escala) / 2, (ih * this.escala) / 2);
    const d = oc.getImageData(0, 0, this.lw, this.lh).data;
    this.lum = new Float32Array(this.lw * this.lh);
    for (let i = 0; i < this.lum.length; i++) this.lum[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
  }

  /** Posición en el canvas (px) de un punto dado en fracciones de la imagen. */
  enCanvas(p: Punto) {
    return { x: this.dx + p.x * this.img.width * this.escala, y: this.dy + p.y * this.img.height * this.escala };
  }

  private enImagen(x: number, y: number) {
    return { u: (x - this.dx) / (this.img.width * this.escala), v: (y - this.dy) / (this.img.height * this.escala) };
  }

  dibujar(e: Estado) {
    const { ctx, W, H, o } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = o.tinta;
    const faro = this.enCanvas(o.faro);
    const paso = o.paso;
    const salto = 3;
    const limite = H * e.revelado;
    const barco = e.barco ? { x: e.barco.x * W, y: e.barco.y * H } : null;
    for (let y = paso / 2; y < limite; y += paso) {
      const arriba: number[] = [];
      const abajo: number[] = [];
      for (let x = 0; x <= W; x += salto) {
        const li = Math.min(this.lh - 1, (y / 2) | 0) * this.lw + Math.min(this.lw - 1, (x / 2) | 0);
        let d = 1 - this.lum[li];
        d = Math.pow(Math.min(1, Math.max(0, (d - 0.5) * o.contraste + 0.5)), o.gamma);
        // atardecer: el cielo se carga de líneas
        if (e.atardecer > 0) {
          const { u, v } = this.enImagen(x, y);
          d = Math.min(1, d + e.atardecer * 0.22 * o.cielo(u, v));
        }
        // haz del faro: aclara las líneas dentro del cono
        if (e.haz > 0) {
          const { u, v } = this.enImagen(x, y);
          const zona = Math.max(0.12, o.abierto(u, v));
          const ax = x - faro.x;
          const ay = y - faro.y;
          const dist = Math.hypot(ax, ay);
          let a = Math.atan2(ay, ax) - e.angulo;
          a = Math.atan2(Math.sin(a), Math.cos(a));
          const borde = Math.max(0, 1 - Math.abs(a) / o.aperturaHaz);
          const caida = Math.max(0, 1 - dist / (W * 1.1));
          const nucleo = dist < 14 ? 1 : 0;
          d *= 1 - e.haz * Math.max(nucleo, Math.pow(borde, 0.7) * caida * 0.95 * zona);
        }
        // detrás del barco el agua queda limpia, para que se lea su silueta
        if (barco) {
          const bx = (x - barco.x) / 110;
          const by = (y - barco.y) / 95;
          const r = bx * bx + by * by;
          if (r < 1) d *= 0.15 + 0.85 * r;
        }
        const w = d < 0.04 ? 0 : (0.15 + d * 0.8) * paso;
        arriba.push(x, y - w / 2);
        abajo.push(x, y + w / 2);
      }
      ctx.beginPath();
      ctx.moveTo(arriba[0], arriba[1]);
      for (let i = 2; i < arriba.length; i += 2) ctx.lineTo(arriba[i], arriba[i + 1]);
      for (let i = abajo.length - 2; i >= 0; i -= 2) ctx.lineTo(abajo[i], abajo[i + 1]);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/** Convierte un grabado en negro sobre blanco en líneas de un color sobre fondo transparente. */
export function teñir(img: HTMLImageElement, recorte: [number, number, number, number], color: [number, number, number]) {
  const [sx, sy, sw, sh] = recorte.map((f, i) => f * (i % 2 ? img.height : img.width));
  const c = document.createElement('canvas');
  c.width = Math.round(sw);
  c.height = Math.round(sh);
  const x = c.getContext('2d')!;
  x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  const datos = x.getImageData(0, 0, c.width, c.height);
  const p = datos.data;
  for (let i = 0; i < p.length; i += 4) {
    const l = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) / 255;
    p[i] = color[0];
    p[i + 1] = color[1];
    p[i + 2] = color[2];
    p[i + 3] = Math.round(Math.max(0, Math.min(1, (0.85 - l) * 1.6)) * 255);
  }
  x.putImageData(datos, 0, 0);
  return c;
}
