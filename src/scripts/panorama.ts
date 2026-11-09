// Panorama grabado de la costa: el relieve real (modelo de elevación Copernicus)
// dibujado como líneas de grabado vistas desde el mar, de lejos hacia cerca,
// cada línea tapa lo que queda detrás. Encima: la baliza con su haz, la misión
// y la ciudad dibujadas más grandes que su escala, como en un mapa pictórico.

type XY = [number, number];
interface Meta {
  ancho: number;
  alto: number;
  metrosPorNivel: number;
  invalido: number;
  lugares: { faro: XY; mision: XY; ciudad: XY };
}

const TAU = Math.PI * 2;

export class Panorama {
  private ctx: CanvasRenderingContext2D;
  private tierra = document.createElement('canvas');
  private z!: Float32Array; // metros
  private ok!: Uint8Array;
  private W = 0;
  private H = 0;
  private x0 = 0;
  private x1 = 0;
  private filaMar = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private meta: Meta,
    alturas: ImageData,
    private tinta: string,
    private papel: string,
  ) {
    this.ctx = canvas.getContext('2d')!;
    const n = meta.ancho * meta.alto;
    this.z = new Float32Array(n);
    this.ok = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const v = alturas.data[i * 4];
      this.ok[i] = v === meta.invalido ? 0 : 1;
      this.z[i] = v === meta.invalido ? 0 : v * meta.metrosPorNivel;
    }
    // primera fila que ya es mar abierto en toda su extensión visible
    this.filaMar = Math.round(Math.max(...Object.values(meta.lugares).map((p) => p[1]))) + 6;
    // el mar fuera del recorte del modelo sigue siendo mar
    for (let f = this.filaMar - 20; f < meta.alto; f++) for (let x = 0; x < meta.ancho; x++) {
      const i = f * meta.ancho + x;
      if (!this.ok[i] && f >= this.filaMar) { this.ok[i] = 1; this.z[i] = 0; }
    }
    this.medir();
  }

  medir() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.W = this.canvas.clientWidth;
    this.H = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // en pantallas angostas se muestra el tramo entre la ciudad y el cabo
    const { ciudad, faro } = this.meta.lugares;
    const angosto = this.W < 820;
    this.x0 = angosto ? ciudad[0] - 40 : 0;
    this.x1 = angosto ? faro[0] + 40 : this.meta.ancho - 1;
    this.tierra.width = this.canvas.width;
    this.tierra.height = this.canvas.height;
    this.grabarTierra();
  }

  /** Proyección: columna, fila y altura del relieve a pixeles de pantalla. */
  proyectar(x: number, fila: number, metros = 0): XY {
    const t = fila / (this.meta.alto - 1);
    const base = this.H * (0.02 + 0.98 * Math.pow(t, 1.45));
    const cerca = 0.45 + 0.55 * t;
    return [((x - this.x0) / (this.x1 - this.x0)) * this.W, base - metros * 0.55 * cerca];
  }

  alturaEn(x: number, fila: number) {
    const i = Math.round(fila) * this.meta.ancho + Math.round(x);
    return this.z[i] ?? 0;
  }

  private fila(c: CanvasRenderingContext2D, f: number, ola = 0) {
    const { ancho } = this.meta;
    const t = f / (this.meta.alto - 1);
    const paso = Math.max(1, Math.floor((this.x1 - this.x0) / this.W * 2));
    let tramo: XY[] = [];
    const cerrar = () => {
      if (tramo.length > 1) {
        // tapa lo de atrás con papel y después traza la línea
        c.beginPath();
        c.moveTo(tramo[0][0], this.H);
        for (const p of tramo) c.lineTo(p[0], p[1]);
        c.lineTo(tramo[tramo.length - 1][0], this.H);
        c.closePath();
        c.fillStyle = this.papel;
        c.fill();
        c.beginPath();
        c.moveTo(tramo[0][0], tramo[0][1]);
        for (const p of tramo) c.lineTo(p[0], p[1]);
        c.stroke();
      }
      tramo = [];
    };
    c.globalAlpha = 0.25 + 0.75 * Math.pow(t, 0.6);
    c.lineWidth = 0.55 + 0.8 * t;
    for (let x = Math.max(0, Math.floor(this.x0) - 2); x <= Math.min(ancho - 1, Math.ceil(this.x1) + 2); x += paso) {
      const i = f * ancho + x;
      if (!this.ok[i]) {
        cerrar();
        continue;
      }
      const [px, py] = this.proyectar(x, f, this.z[i]);
      tramo.push([px, py + (ola ? Math.sin(x * 0.045 + ola + Math.sin(f * 1.7) * 2) * (0.4 + 1.1 * t) : 0)]);
    }
    cerrar();
    c.globalAlpha = 1;
  }

  private grabarTierra() {
    const c = this.tierra.getContext('2d')!;
    const dpr = this.canvas.width / this.W;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    c.strokeStyle = this.tinta;
    c.lineJoin = 'round';
    for (let f = 0; f < this.filaMar; f += 2) this.fila(c, f);
  }

  /** Dibuja un cuadro. revelado: 0..1 de lejos a cerca. t: segundos. */
  dibujar(revelado: number, t: number, haz: number) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    // tierra impresa de lejos hacia cerca
    const hasta = H * Math.min(1, revelado * 1.15);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, hasta);
    ctx.clip();
    ctx.drawImage(this.tierra, 0, 0, W, H);
    ctx.restore();
    if (revelado < 0.75) return;
    // mar con oleaje lento
    ctx.strokeStyle = this.tinta;
    for (let f = this.filaMar; f < this.meta.alto; f += 2) this.fila(ctx, f, t * 0.8);
    if (haz > 0) this.haz(t, haz);
  }

  /** El haz de la baliza: barre el mar aclarando las líneas, como luz en un grabado. */
  private haz(t: number, k: number) {
    const { ctx } = this;
    const [fx, ff] = this.meta.lugares.faro;
    const [bx, by] = this.proyectar(fx, ff, this.alturaEn(fx, ff) + 34);
    const giro = -Math.PI / 2 + Math.sin(t * 0.55) * 1.25; // hacia el mar, de un lado al otro
    const largo = this.W * 0.75;
    const ancho = 0.09;
    const g = ctx.createRadialGradient(bx, by, 4, bx, by, largo);
    g.addColorStop(0, `rgba(246,247,251,${k})`);
    g.addColorStop(0.55, `rgba(246,247,251,${0.8 * k})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    // el haz se aplana hacia el observador: elipse en perspectiva
    const a1 = giro - ancho;
    const a2 = giro + ancho;
    ctx.lineTo(bx + Math.cos(a1) * largo, by - Math.sin(a1) * largo * 0.42);
    ctx.lineTo(bx + Math.cos(a2) * largo, by - Math.sin(a2) * largo * 0.42);
    ctx.closePath();
    ctx.fill();
    // destello en la linterna
    ctx.fillStyle = `rgba(255,255,255,${k})`;
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}
