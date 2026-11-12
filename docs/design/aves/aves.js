// Prototipo: aves grabadas sobre el mar de la página, en los ejes isométricos de la maqueta.
// ?ave=playeros | albatros. ?grabar: sin rAF, el tiempo lo pone window.__demo(t).
// Mundo: U a lo largo de la costa (en pantalla, arriba a la derecha), V mar adentro (abajo a la
// derecha), Z arriba; en metros. Quien mira está del lado del mar, arriba: (-1, 1, 1).
// Volumen: los cuerpos son sólidos (anillos a lo largo del eje) y se ven con su silueta real desde
// cualquier ángulo; la luz viene de arriba a la izquierda y sombrea con rayas de contorno, como un
// grabado. Las alas tienen comba y espesor en el borde de ataque, y su tono cambia con la luz.
(() => {
  const q = new URLSearchParams(location.search);
  const AVE = q.get('ave') === 'albatros' ? 'albatros' : 'playeros';
  const svg = document.querySelector('.escena svg');
  const NS = 'http://www.w3.org/2000/svg';
  const W = svg.clientWidth, H = svg.clientHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const movil = W < 600;
  const P = { papel: '#f6f7fb', tinta: '#1f3a8f', suave: '#5b6fae', mar: '#d6e4f1', tierra: '#e9eaee' };
  const C = Math.cos(Math.PI / 6), S = 0.5;

  const ESC = AVE === 'playeros'
    ? { k: movil ? 26 : 40, O: [W * (movil ? 0.3 : 0.36), H * 0.78] }
    : { k: movil ? 50 : 80, O: [W * 0.5, H * 0.8] };
  const k = ESC.k, O = ESC.O;
  const pr = ([u, v, z]) => [O[0] + k * C * (u + v), O[1] + k * (S * (v - u) - z)];
  const f1 = (n) => Math.round(n * 10) / 10;
  const camino = (pts, cerrar) => (pts.length ? 'M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + (cerrar ? 'Z' : '') : '');
  const el = (tag, at, padre = svg) => { const e = document.createElementNS(NS, tag); for (const a in at) e.setAttribute(a, at[a]); padre.append(e); return e; };
  const pone = (e, at) => { for (const a in at) e.setAttribute(a, at[a]); };
  let semilla = 11;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const suave = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const mezcla = (a, b, x) => a.map((ai, i) => ai + (b[i] - ai) * x);
  const lerp = (a, b, x) => a + (b - a) * x;
  const dentro = ([x, y], m = 12) => x > -m && x < W + m && y > -m && y < H + m;

  // ---------- vectores ----------
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norma = (a) => mul(a, 1 / Math.hypot(...a));
  const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const VISTA = norma([-1, 1, 1]); // hacia quien mira
  const SOL = norma([-0.25, -0.45, 1]); // hacia el sol: arriba, a la izquierda
  const hondo = (p) => p[0] - p[1] - p[2]; // más grande = más lejos de quien mira
  const desenrollar = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  // ejes del cuerpo: rumbo psi (desde +U hacia +V), cabeceo th, alabeo ph (positivo: ala derecha abajo)
  function ejes(psi, th, ph) {
    const F = [Math.cos(th) * Math.cos(psi), Math.cos(th) * Math.sin(psi), Math.sin(th)];
    const L0 = [-Math.sin(psi), Math.cos(psi), 0];
    const U0 = [-Math.sin(th) * Math.cos(psi), -Math.sin(th) * Math.sin(psi), Math.cos(th)];
    return { F, L: add(mul(L0, Math.cos(ph)), mul(U0, Math.sin(ph))), Up: add(mul(U0, Math.cos(ph)), mul(L0, -Math.sin(ph))) };
  }
  const amundo = (P0, E, f, l, u) => add(add(add(P0, mul(E.F, f)), mul(E.L, l)), mul(E.Up, u));

  // ---------- cuerpos sólidos ----------
  // estaciones [f, medio ancho, medio alto, altura del centro]; giro opcional de la cabeza desde fp
  function cuerpo(P0, E, est, { cabeza = 0, cabeceo = 0, fp = 0 } = {}) {
    const anillos = est.map(([f, w, h, zc]) => {
      // la cabeza gira (rumbo y cabeceo) alrededor de un pivote en el cuello
      let F = E.F, L = E.L, U = E.Up, c;
      if (f > fp && (cabeza || cabeceo)) {
        const a = cabeza, b = cabeceo;
        const Fy = add(mul(E.F, Math.cos(a)), mul(E.L, Math.sin(a)));
        L = add(mul(E.L, Math.cos(a)), mul(E.F, -Math.sin(a)));
        F = add(mul(Fy, Math.cos(b)), mul(E.Up, Math.sin(b)));
        U = add(mul(E.Up, Math.cos(b)), mul(Fy, -Math.sin(b)));
        c = add(add(amundo(P0, E, fp, 0, 0), mul(F, f - fp)), mul(U, zc));
      } else c = amundo(P0, E, f, 0, zc);
      const x = punto(L, VISTA) / w, y = punto(U, VISTA) / h;
      const a1 = Math.atan2(x, -y);
      const en = (a) => add(add(c, mul(L, w * Math.cos(a))), mul(U, h * Math.sin(a)));
      const n = (a) => norma(add(mul(L, Math.cos(a) / w), mul(U, Math.sin(a) / h)));
      // de las dos soluciones, la "de arriba" es la que queda más alta en pantalla
      const sa = en(a1), sb = en(a1 + Math.PI);
      const arriba = pr(sa)[1] < pr(sb)[1];
      return { f, w, h, c, L, U, F, en, n, sup: arriba ? a1 : a1 + Math.PI, inf: arriba ? a1 + Math.PI : a1 };
    });
    const sup = anillos.map((r) => pr(r.en(r.sup)));
    const inf = anillos.map((r) => pr(r.en(r.inf)));
    const contorno = [...sup, ...inf.reverse()];
    return { anillos, contorno, hondo: anillos.reduce((m, r) => m + hondo(r.c), 0) / anillos.length };
  }
  // rayas de contorno en la cara a la sombra: arcos de cada anillo donde se ve y no le da el sol
  function sombreado(anillos, umbral, cada = 1) {
    const arcos = [];
    anillos.forEach((r, i) => {
      if (i % cada) return;
      let tramo = [];
      for (let j = 0; j <= 28; j++) {
        const a = (j / 28) * Math.PI * 2;
        const n = r.n(a);
        if (punto(n, VISTA) > 0.05 && punto(n, SOL) < umbral) tramo.push(pr(r.en(a)));
        else { if (tramo.length > 1) arcos.push(camino(tramo)); tramo = []; }
      }
      if (tramo.length > 1) arcos.push(camino(tramo));
    });
    return arcos.join('');
  }

  // ---------- capas ----------
  const defs = el('defs', {});
  const gAgua = el('g', {});
  const gTierra = el('g', {});
  const gMar = el('g', { fill: 'none', 'stroke-linecap': 'round' });
  const gOlas = el('g', { fill: 'none', stroke: P.suave, 'stroke-linecap': 'round' });
  const gSombras = el('g', { fill: P.suave, stroke: 'none' });
  const gAves = el('g', { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });

  // =====================================================================
  // EL MAR
  // =====================================================================
  const LOOP_A = 16; // la vuelta del albatros: todo lo que se mueve en esa escena vuelve a su lugar
  const LINEAS = AVE === 'playeros'
    ? [0.45, 1.1, 1.95, 3, 4.3, 5.9, 7.9, 10.4, 13.4, 17, 21.5]
    : Array.from({ length: 32 }, (_, i) => -16 + i * 1.05);
  const lineasMar = LINEAS.map((v, i) => {
    const lejos = AVE === 'playeros' ? i / (LINEAS.length - 1) : 0.25 + azar() * 0.35;
    return { v, fase: azar() * 6, e: el('path', { stroke: P.suave, 'stroke-width': f1(1.15 - lejos * 0.6), 'stroke-opacity': f1(0.9 - lejos * 0.6) }, gMar) };
  });
  const costa = AVE === 'playeros' ? el('path', { stroke: P.tinta, 'stroke-width': movil ? '1.3' : '1.7', fill: 'none' }, gMar) : null;
  const olas = Array.from({ length: AVE === 'playeros' ? 30 : 46 }, () => ({
    u: -30 + azar() * 60, v: AVE === 'playeros' ? 0.7 + azar() * 15 : -16 + azar() * 32,
    largo: 0.35 + azar() * 0.9, fase: azar(), dur: AVE === 'albatros' ? LOOP_A / (2 + Math.floor(azar() * 3)) : 4 + azar() * 4,
    e: el('path', { 'stroke-width': '0.9' }, gOlas),
  }));
  // el albatros vuela en diagonal, como en las fotos (el ala entera a la vista, sin acortarse), y
  // la cámara lo sigue: el agua pasa por debajo. En una vuelta de 16 s el agua corre un número entero
  // de líneas, así el video no salta
  const PSI0 = Math.PI / 2 + 0.35; // hacia abajo a la derecha, un poco hacia quien mira
  const AVANCE = (16 * 1.05) / Math.sin(PSI0); // metros por vuelta en la dirección de vuelo
  const corre = (t) => (AVE === 'albatros' ? ((AVANCE * t) / LOOP_A) * Math.sin(PSI0) : 0); // lo que corre el agua en V
  const VEL = AVANCE / LOOP_A;

  function mar(t) {
    const d = corre(t);
    const w = (2 * Math.PI) / LOOP_A;
    for (const L of lineasMar) {
      let v = L.v;
      if (AVE === 'albatros') v = ((L.v - d + 16.8) % 33.6 + 33.6) % 33.6 - 16.8;
      const pts = [];
      for (let u = -40; u <= 40; u += 1.1) {
        const z = AVE === 'albatros'
          ? 0.05 * Math.sin(u * 0.55 + w * 3 * t + L.fase) + 0.035 * Math.sin(u * 1.3 - w * 2 * t + L.fase * 2)
          : 0.05 * Math.sin(u * 0.55 + t * 0.9 + L.fase) + 0.035 * Math.sin(u * 1.3 - t * 0.6 + L.fase * 2);
        pts.push(pr([u, v, z]));
      }
      L.e.setAttribute('d', camino(pts));
    }
    if (costa) {
      const pts = [];
      for (let u = -60; u <= 60; u += 0.7) pts.push(pr([u, 0.12 * Math.sin(u * 0.7) + 0.05 * Math.sin(u * 2.3), 0]));
      costa.setAttribute('d', camino(pts));
    }
    for (const o of olas) {
      const x = (t / o.dur + o.fase) % 1;
      let u = o.u, v;
      if (AVE === 'playeros') v = o.v * (1 - 0.22 * x);
      else v = ((o.v - d + 16) % 32 + 32) % 32 - 16 - x * 0.5;
      pone(o.e, { d: camino([pr([u, v, 0]), pr([u + o.largo, v, 0])]), 'stroke-opacity': f1(Math.sin(Math.PI * x) * 0.75) });
    }
  }

  // =====================================================================
  // PLAYEROS: la costa y la playa
  // =====================================================================
  function escenaPlayeros() {
    const g = el('linearGradient', { id: 'agua', gradientUnits: 'userSpaceOnUse', x1: f1(pr([0, 0, 0])[0]), y1: f1(pr([0, 0, 0])[1]), x2: f1(pr([0, 18, 0])[0]), y2: f1(pr([0, 18, 0])[1]) }, defs);
    el('stop', { offset: '0', 'stop-color': P.mar, 'stop-opacity': '0.95' }, g);
    el('stop', { offset: '1', 'stop-color': P.mar, 'stop-opacity': '0' }, g);
    el('path', { d: camino([pr([-80, -0.2, 0]), pr([80, -0.2, 0]), pr([80, 40, 0]), pr([-80, 40, 0])], true), fill: 'url(#agua)' }, gAgua);
    const arena = [];
    for (let i = 0; i < 2600; i++) {
      const u = -60 + azar() * 120, v = -Math.pow(azar(), 1.7) * 8.5;
      const p = pr([u, v, 0]);
      if (dentro(p)) arena.push(`M${f1(p[0])} ${f1(p[1])}h0.01`);
    }
    el('path', { d: arena.join(''), stroke: P.suave, 'stroke-width': movil ? '1.1' : '1.35', 'stroke-linecap': 'round', 'stroke-opacity': '0.5' }, gTierra);
    const mojada = [-0.22, -0.45, -0.72].map((v, i) => {
      const pts = [];
      for (let u = -60; u <= 60; u += 0.8) pts.push(pr([u, v + 0.05 * Math.sin(u * 1.7 + i), 0]));
      return camino(pts);
    });
    el('path', { d: mojada.join(''), stroke: P.suave, 'stroke-width': '0.6', 'stroke-opacity': '0.45', fill: 'none' }, gTierra);
    const matas = [];
    for (let i = 0; i < 160; i++) {
      const u = -60 + azar() * 120, v = -8 - azar() * 18;
      const [x, y] = pr([u, v, 0]);
      if (!dentro([x, y])) continue;
      const s = (movil ? 2 : 2.8) * (0.7 + azar() * 0.6);
      matas.push(`M${f1(x - s)} ${f1(y - s * 1.2)}L${f1(x)} ${f1(y)}L${f1(x + s * 0.3)} ${f1(y - s * 1.6)}M${f1(x)} ${f1(y)}L${f1(x + s)} ${f1(y - s)}`);
    }
    el('path', { d: matas.join(''), stroke: P.suave, 'stroke-width': '0.7', fill: 'none', 'stroke-opacity': '0.7' }, gTierra);
  }

  // =====================================================================
  // PLAYEROS ROJIZOS
  // =====================================================================
  const N = 48;
  // largo ~0,25 m, envergadura ~0,55 m; alas finas y en punta. Borde [s, f], muñeca en sM
  const ALA_P = { borde: [[0.02, 0.035], [0.08, 0.042], [0.15, 0.03], [0.21, -0.005], [0.275, -0.065], [0.2, -0.05], [0.13, -0.045], [0.06, -0.045], [0.02, -0.04]], sM: 0.12, punta: 0.275 };
  const BARRA = [[0.04, -0.012], [0.11, -0.016], [0.18, -0.022]];
  const CUERPO_P = [[0.118, 0.006, 0.006, 0.012], [0.1, 0.017, 0.018, 0.014], [0.075, 0.021, 0.023, 0.012], [0.04, 0.031, 0.032, 0.003], [0, 0.035, 0.034, 0], [-0.045, 0.031, 0.029, 0.002], [-0.085, 0.02, 0.016, 0.006], [-0.115, 0.009, 0.006, 0.008]];
  const CUERPO_PARADO = [[0.105, 0.008, 0.009, 0.045], [0.09, 0.016, 0.018, 0.045], [0.07, 0.019, 0.02, 0.042], [0.05, 0.015, 0.017, 0.03], [0.025, 0.03, 0.032, 0.008], [-0.01, 0.036, 0.036, 0], [-0.05, 0.032, 0.03, 0.002], [-0.09, 0.02, 0.016, 0.008], [-0.12, 0.008, 0.006, 0.012]];
  // la parte de arriba que se ve (el lomo gris): de cada anillo, el arco visible de la mitad superior
  function lomoVisible(cu) {
    const a = [], b = [];
    for (const r of cu.anillos) {
      const vis = [];
      for (let j = 0; j <= 12; j++) { const ang = (j / 12) * Math.PI; if (punto(r.n(ang), VISTA) > 0) vis.push(pr(r.en(ang))); }
      if (vis.length) { a.push(vis[0]); b.push(vis[vis.length - 1]); }
    }
    return a.length > 1 ? camino([...a, ...b.reverse()], true) : 'M0 0';
  }
  const RUTA = [
    [0.3, [21, 23.5, 3.4]], [2.1, [12, 14.5, 3.6]], [3.7, [6, 10.2, 3.8]], [5.0, [1.5, 7.6, 3.9]],
    [6.2, [-2.5, 4.2, 4.0]], [7.3, [-1.6, 2.5, 2.8]], [8.3, [1.4, 0.3, 1.6]], [9.2, [2, -1.4, 0.5]],
  ];
  function ruta(t) {
    const R = RUTA;
    if (t <= R[0][0]) { const a = R[0][1], b = R[1][1], x = (t - R[0][0]) / (R[1][0] - R[0][0]); return mezcla(a, b, x); }
    if (t >= R[R.length - 1][0]) return R[R.length - 1][1];
    let i = 0;
    while (t > R[i + 1][0]) i++;
    const p0 = R[Math.max(0, i - 1)][1], p1 = R[i][1], p2 = R[i + 1][1], p3 = R[Math.min(R.length - 1, i + 2)][1];
    const x = (t - R[i][0]) / (R[i + 1][0] - R[i][0]), x2 = x * x, x3 = x2 * x;
    return [0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * x + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * x2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * x3));
  }
  const rumbo = (t) => { const a = ruta(t - 0.05), b = ruta(t + 0.05); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const giroDe = (t) => desenrollar(rumbo(t + 0.15) - rumbo(t - 0.15)) / 0.3;

  const posadero = [];
  for (let intento = 0; posadero.length < N && intento < 20000; intento++) {
    const u = -0.6 + azar() * 4.6, v = -1.15 - azar() * 1.7;
    if (Math.hypot((u - 1.7) / 2.4, (v + 2) / 0.95) > 1) continue;
    if (posadero.every((p) => Math.hypot(p[0] - u, p[1] - v) > 0.21)) posadero.push([u, v]);
  }
  const VIENTO = Math.PI * 1.06;
  const bandada = posadero.map((suelo) => ({
    a: (azar() - 0.5) * 4.4, c: (azar() - 0.5) * 5, h: (azar() - 0.5) * 0.9,
    fase: azar(), frec: 4.6 + azar() * 0.8, ruido: azar() * 10,
    baja: 7.5 + azar() * 1.1, suelo, gesto: azar() * 10, planeo: azar() * 10,
  })).map((b) => { b.g = el('g', {}, gAves); b.partes = Array.from({ length: 7 }, () => el('path', {}, b.g)); return b; });

  // aleteo: bajada rápida y potente, subida con la mano plegada hacia atrás
  function aleteo(tau) {
    if (tau < 0.45) return { d: lerp(0.95, -0.55, suave(tau / 0.45)), pliegue: 0 };
    const x = (tau - 0.45) / 0.55;
    return { d: lerp(-0.55, 0.95, suave(x)), pliegue: Math.sin(Math.PI * x) };
  }

  function vueloPlayero(b, t) {
    // la ola de giro: cada pájaro sigue el rumbo de la bandada con un retraso según su lugar en ella
    const retraso = clamp(0.16 + 0.11 * b.c + 0.05 * Math.sin(b.ruido), 0, 0.45);
    const tr = t - retraso;
    const c0 = ruta(t), psi = rumbo(tr), giro = giroDe(tr);
    const ph = clamp(-giro * 0.45, -1.1, 1.1);
    // la forma de la bandada: respira, se estira en lo recto y se ensancha en las curvas
    const estira = 1 + 0.18 * Math.sin(t * 0.7 + 0.5) - 0.12 * Math.min(1, Math.abs(giro));
    const ancha = 1 + 0.16 * Math.sin(t * 0.55 + 1.3) + 0.25 * Math.min(1, Math.abs(giro));
    const a = b.a * estira, c = b.c * ancha;
    const h = b.h + 0.28 * Math.sin(t * 1.4 + b.a * 0.9) + c * Math.sin(ph) * 0.45;
    const psiF = rumbo(t - retraso * 0.5);
    const Fh = [Math.cos(psiF), Math.sin(psiF), 0], Lh = [-Math.sin(psiF), Math.cos(psiF), 0];
    let p = add(add(add(c0, mul(Fh, a)), mul(Lh, c)), [0, 0, h]);
    p = add(p, [0.09 * Math.sin(t * 2.1 + b.ruido), 0.09 * Math.cos(t * 1.7 + b.ruido), 0.05 * Math.sin(t * 2.9 + b.ruido)]);
    // en las curvas fuertes algunos planean un instante
    const planea = suave((Math.abs(giro) - 0.55) * 3) * suave(Math.sin(t * 1.9 + b.planeo) * 2 + 0.5);
    return { p, psi: psi + 0.06 * Math.sin(t * 1.3 + b.ruido), ph: ph + 0.1 * Math.sin(t * 1.9 + b.ruido), planea };
  }

  // ala del playero: diedro d hasta la muñeca; en la subida la mano se pliega hacia atrás
  function alaPlayero(P0, E, lado, d, pliegue, escalaAla = 1) {
    const sM = ALA_P.sM, d2 = -0.25 - 0.55 * pliegue;
    return (s, f) => {
      let ss = s * escalaAla, ff = f;
      if (s > sM) {
        const x = (s - sM) / (ALA_P.punta - sM);
        ss = (sM + (s - sM) * (1 - 0.45 * pliegue)) * escalaAla;
        ff = f - 0.075 * pliegue * x;
      }
      const s1 = Math.min(ss, sM), s2 = Math.max(0, ss - sM);
      return amundo(P0, E, ff, lado * (s1 * Math.cos(d) + s2 * Math.cos(d + d2)), s1 * Math.sin(d) + s2 * Math.sin(d + d2));
    };
  }
  const normalPlano = (a, b, c) => norma(cruz([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]));

  function playeroVolando(b, p, psi, ph, d, pliegue, { escalaAla = 1, th = 0.05 } = {}) {
    const E = ejes(psi, th, ph);
    const lados = [1, -1].map((lado) => {
      const pos = alaPlayero(p, E, lado, d, pliegue, escalaAla);
      const borde = ALA_P.borde.map(([s, f]) => pos(s, f));
      // normal de la cara de arriba de la parte interna del ala
      let n = normalPlano(pos(0.02, 0.035), pos(0.02, -0.04), pos(0.11, 0.04));
      if (punto(n, E.Up) < 0) n = mul(n, -1);
      const arriba = punto(n, VISTA) > 0;
      const luz = clamp(punto(arriba ? n : mul(n, -1), SOL), 0, 1);
      return { tipo: 'ala', pts: borde.map(pr), barra: BARRA.map(([s, f]) => pr(pos(s, f))), arriba, luz, hondo: borde.reduce((m, x) => m + hondo(x), 0) / borde.length };
    });
    const cu = cuerpo(p, E, CUERPO_P);
    const piezas = [...lados, { tipo: 'cuerpo', cu, hondo: cu.hondo }];
    piezas.sort((x, y) => y.hondo - x.hondo);
    piezas.forEach((pz, i) => {
      const e = b.partes[i];
      if (pz.tipo === 'cuerpo') pone(e, { d: camino(pz.cu.contorno, true), fill: P.tierra, stroke: P.tinta, 'stroke-width': '0.55', opacity: '1' });
      else pone(e, { d: camino(pz.pts, true), fill: pz.arriba ? P.suave : P.papel, 'fill-opacity': pz.arriba ? f1(0.7 + 0.3 * (1 - pz.luz)) : '1', stroke: P.tinta, 'stroke-width': '0.5', opacity: '1' });
      b.g.append(e);
      if (pz.tipo === 'cuerpo') b.g.append(b.partes[3]); // el lomo va pegado al cuerpo
    });
    // lomo gris (la cara de arriba del cuerpo, si se ve)
    pone(b.partes[3], { d: lomoVisible(cu), fill: P.suave, 'fill-opacity': '0.6', stroke: 'none', opacity: '1' });
    const barras = lados.filter((l) => l.arriba).map((l) => camino(l.barra)).join('');
    pone(b.partes[4], { d: barras || 'M0 0', stroke: P.papel, 'stroke-width': '0.7', fill: 'none', opacity: barras ? '1' : '0' });
    pone(b.partes[5], { d: camino([pr(amundo(p, E, 0.118, 0, 0.012)), pr(amundo(p, E, 0.16, 0, 0.006))]), stroke: P.tinta, 'stroke-width': '0.7', fill: 'none', opacity: '1' });
    pone(b.partes[6], { d: 'M0 0', opacity: '0' });
    b.g.append(b.partes[4], b.partes[5]);
  }

  function playeroParado(b, t, alfa, paso = 1) {
    const [u0, v0] = b.suelo;
    const psi = VIENTO + 0.2 * Math.sin(b.gesto);
    const F = [Math.cos(psi), Math.sin(psi), 0];
    // tras posarse corre unos pasos hasta su lugar
    const atras = 0.14 * (1 - suave(paso));
    const base = [u0 - F[0] * atras, v0 - F[1] * atras, 0.075 + 0.006 * Math.sin(paso * Math.PI * 8) * (1 - paso)];
    const E = ejes(psi, 0.08, 0);
    // la cabeza: mira a los costados, a veces baja a comer y a veces se acicala
    const gira = 0.45 * Math.sin(t * 0.7 + b.gesto * 2) * suave(Math.sin(t * 0.3 + b.gesto) * 3);
    const come = Math.pow(Math.max(0, Math.sin(t * 0.9 + b.gesto * 3)), 10);
    const cu = cuerpo(base, E, CUERPO_PARADO, { cabeza: gira, cabeceo: -come * 1.2, fp: 0.05 });
    const r0 = cu.anillos[0];
    const pico = [pr(r0.c), pr(add(add(r0.c, mul(r0.F, 0.036)), mul(r0.U, -0.006)))];
    pone(b.partes[1], { d: camino(cu.contorno, true), fill: P.papel, stroke: P.tinta, 'stroke-width': '0.55' });
    pone(b.partes[2], { d: lomoVisible(cu), fill: P.suave, 'fill-opacity': '0.65', stroke: 'none' });
    pone(b.partes[3], { d: sombreado(cu.anillos, 0.15, 2), stroke: P.tinta, 'stroke-width': '0.4', 'stroke-opacity': '0.6', fill: 'none' });
    pone(b.partes[4], { d: camino(pico), stroke: P.tinta, 'stroke-width': '0.7', fill: 'none' });
    // patas: en la carrera se alternan
    const pas = Math.sin(paso * Math.PI * 7) * 0.025 * (1 - paso);
    const cad = (lado, dx) => [pr(amundo(base, E, 0.0, lado * 0.012, -0.025)), pr([base[0] + F[0] * dx - lado * 0.01 * F[1], base[1] + F[1] * dx + lado * 0.01 * F[0], 0])];
    pone(b.partes[5], { d: camino(cad(1, pas)) + camino(cad(-1, -pas)), stroke: P.tinta, 'stroke-width': '0.6', fill: 'none' });
    pone(b.partes[0], { d: 'M0 0' });
    pone(b.partes[6], { d: 'M0 0' });
    for (const e of b.partes) e.setAttribute('opacity', f1(alfa));
    b.g.append(b.partes[5], b.partes[1], b.partes[2], b.partes[3], b.partes[4], b.partes[6]); // patas detrás del cuerpo
  }

  function playeros(t) {
    const orden = [];
    for (const b of bandada) {
      const x = (t - b.baja) / 1.3;
      if (t < 0.2 || t > 13.6) { b.partes.forEach((e) => pone(e, { d: 'M0 0', opacity: '0' })); continue; }
      if (x >= 1) {
        const paso = clamp((t - b.baja - 1.3) / 0.5, 0, 1);
        const alfa = 1 - suave((t - 12.6) / 0.9);
        if (paso < 1) {
          // recién posado: las alas todavía arriba, se van cerrando mientras corre
          orden.push([hondo([...b.suelo, 0]), () => {
            playeroParado(b, t, alfa, paso);
            const E = ejes(VIENTO + 0.2 * Math.sin(b.gesto), 0.12, 0);
            const centro = [b.suelo[0] - Math.cos(VIENTO) * 0.14 * (1 - suave(paso)), b.suelo[1] - Math.sin(VIENTO) * 0.14 * (1 - suave(paso)), 0.1];
            const alas = [1, -1].map((lado) => { const pos = alaPlayero(centro, E, lado, 1.25 - 0.4 * paso, 0.6, 1 - 0.85 * suave(paso)); return camino(ALA_P.borde.map(([s, f]) => pr(pos(s, f))), true); }).join('');
            pone(b.partes[6], { d: alas, fill: P.papel, stroke: P.tinta, 'stroke-width': '0.5', opacity: f1(alfa * (1 - suave(paso))) });
          }, b]);
        } else orden.push([hondo([...b.suelo, 0]), () => playeroParado(b, t, alfa, 1), b]);
        continue;
      }
      const vu = vueloPlayero(b, Math.min(t, b.baja));
      let p = vu.p, psi = vu.psi, ph = vu.ph, d, pliegue;
      const ciclo = aleteo((t * b.frec + b.fase) % 1);
      if (x <= 0) {
        d = lerp(ciclo.d, -0.1, vu.planea);
        pliegue = lerp(ciclo.pliegue, 0, vu.planea);
      } else {
        // la llegada: frena, alas en V bien arriba con aleteo corto, y baja a su lugar
        const sx = suave(x);
        const F = [Math.cos(VIENTO), Math.sin(VIENTO)];
        const destino = [b.suelo[0] - F[0] * 0.14, b.suelo[1] - F[1] * 0.14, 0.1];
        p = mezcla(vu.p, destino, sx);
        p[2] += Math.sin(Math.PI * x) * 0.25 * (1 - x);
        psi = vu.psi + desenrollar(VIENTO - vu.psi) * suave(x * 1.3);
        ph = vu.ph * (1 - sx);
        d = lerp(ciclo.d, 1.15 + 0.18 * Math.sin(t * 16 + b.fase * 6), suave(x * 2));
        pliegue = lerp(ciclo.pliegue, 0.25, suave(x * 2));
      }
      orden.push([hondo(p), () => playeroVolando(b, p, psi, ph, d, pliegue, { th: x > 0 ? 0.05 + 0.45 * suave(x) : 0.05 }), b]);
    }
    orden.sort((a, b) => b[0] - a[0]);
    for (const [, fn, b] of orden) { fn(); gAves.append(b.g); }
  }

  // =====================================================================
  // ALBATROS DE CEJA NEGRA
  // =====================================================================
  // en metros (envergadura ~2,2 m). Ala: borde de ataque y de fuga [s, f]; muñeca en SM
  // la planta del ala de las fotos (de abajo, la de ceja negra): no es recta. El brazo sale un poco
  // hacia adelante hasta la muñeca, que es lo más adelantado del ala, y la mano larga se va bien
  // hacia atrás hasta una punta fina, casi a la altura de la cola. El borde de fuga sigue ese quiebre
  const AT = [[0.08, 0.07], [0.2, 0.1], [0.35, 0.135], [0.48, 0.165], [0.55, 0.162], [0.68, 0.11], [0.84, 0.01], [0.98, -0.11], [1.08, -0.21], [1.13, -0.27]];
  const FU = [[1.13, -0.27], [1.06, -0.27], [0.94, -0.21], [0.8, -0.13], [0.66, -0.07], [0.52, -0.04], [0.4, -0.05], [0.25, -0.08], [0.08, -0.12]];
  const SM = 0.5; // la muñeca
  const PUNTA = 1.13;
  const fugaOrden = [...FU].reverse();
  const enBorde = (B, s) => {
    for (let i = 0; i < B.length - 1; i++) {
      const [s0, a] = B[i], [s1, b] = B[i + 1];
      if ((s - s0) * (s - s1) <= 0) return s1 === s0 ? a : a + (b - a) * (s - s0) / (s1 - s0);
    }
    return B[B.length - 1][1];
  };
  // el cuerpo: cabeza redonda, cuello, pecho lleno y una cola corta
  const CUERPO_A = [[0.405, 0.018, 0.02, 0.035], [0.385, 0.042, 0.044, 0.035], [0.35, 0.052, 0.054, 0.03], [0.3, 0.05, 0.05, 0.024], [0.22, 0.072, 0.066, 0.012], [0.12, 0.106, 0.09, 0.0], [0.02, 0.12, 0.098, -0.006], [-0.1, 0.115, 0.09, -0.006], [-0.21, 0.096, 0.07, 0.0], [-0.3, 0.072, 0.048, 0.01], [-0.37, 0.05, 0.03, 0.016], [-0.41, 0.032, 0.016, 0.018]];
  const alb = AVE === 'albatros' ? { sombra: el('path', { 'fill-opacity': '0.15' }, gSombras), sombra2: el('path', { 'fill-opacity': '0.07' }, gSombras), piezas: Array.from({ length: 3 }, () => el('g', {}, gAves)) } : null;
  const ola = (t, f, fase = 0) => Math.sin((2 * Math.PI * f * t) / LOOP_A + fase); // periódica en la vuelta

  function estadoAlbatros(t) {
    // vuelo dinámico: dos eses por vuelta, desparejas; sube al girar contra el viento y baja rasante
    const fi = (2 * Math.PI * 2 * t) / LOOP_A + 0.38 * ola(t, 1, 0.4) + 0.16 * ola(t, 3, 1.1);
    const A = 1.05 + 0.22 * ola(t, 1, 2.0);
    const lat = A * Math.sin(fi) + 0.32 * ola(t, 1, 0.2);
    const z = 1.12 + 0.52 * Math.sin(fi - 1.0) + 0.07 * ola(t, 5, 0.3);
    return { lat, z, fi };
  }

  function albatros(t) {
    const e0 = estadoAlbatros(t), dt = 0.04;
    const eA = estadoAlbatros(t - dt), eB = estadoAlbatros(t + dt);
    const eL = estadoAlbatros(t + 0.25 - dt), eL2 = estadoAlbatros(t + 0.25 + dt), eL0 = estadoAlbatros(t + 0.25);
    const dLat = (eB.lat - eA.lat) / (2 * dt), dz = (eB.z - eA.z) / (2 * dt);
    const ddLat = (eL2.lat - 2 * eL0.lat + eL.lat) / (dt * dt); // la inclinación se adelanta al giro
    const vel = VEL * (1 + 0.28 * (1.12 - e0.z)); // más rápido abajo, más lento arriba
    const der = [Math.sin(PSI0), -Math.cos(PSI0)]; // a la derecha del rumbo
    const P0 = [e0.lat * der[0], e0.lat * der[1], e0.z];
    const psi = PSI0 - Math.atan2(dLat, vel);
    const ph = clamp((ddLat / vel) * 0.8, -0.62, 0.62) + 0.05 * ola(t, 7, 0.5) + 0.03 * ola(t, 11, 1.7);
    const th = 0.55 * Math.atan2(dz, vel) - 0.02;
    const E = ejes(psi, th, ph);
    // las alas: un poco hacia arriba con la carga de la curva; la de adentro más flexionada;
    // una vez por vuelta, dos aletazos lentos y cortos
    const carga = Math.abs(ddLat) / (vel * 2);
    const aletazo = suave((t - 9.6) / 0.25) * (1 - suave((t - 11.2) / 0.3)) * Math.sin(((t - 9.6) / 0.8) * Math.PI * 2);
    // planeando, las alas van en arco: el brazo apenas sube y desde ahí el ala se curva hacia abajo
    // hasta la punta (fotos 10 y 11). Con la carga de la curva el arco se abre un poco
    const d1Base = 0.06 + 0.06 * clamp(carga, 0, 1) + 0.02 * ola(t, 6, 0.2) + 0.2 * aletazo;
    const arco = 0.5 - 0.18 * clamp(carga, 0, 1) + 0.05 * ola(t, 3, 1) - 0.25 * aletazo;
    const cabeza = clamp(0.4 * ph + 0.15 * ola(t, 2, 0.8), -0.5, 0.5);

    const lados = [1, -1].map((lado) => {
      const adentro = Math.sign(ph) === -lado ? 1 : 0; // el ala del lado bajo
      const d1 = d1Base + 0.04 * adentro * Math.abs(ph);
      // el arco a lo largo del ala: el ángulo baja de a poco desde el brazo hasta la punta
      const paso = 0.02, tabla = [[0, 0]];
      for (let i = 1; i * paso <= PUNTA + paso; i++) {
        const sm = (i - 0.5) * paso;
        const ang = d1 - arco * Math.pow(Math.max(0, sm - 0.25) / (PUNTA - 0.25), 1.5);
        const [l0, u0] = tabla[i - 1];
        tabla.push([l0 + paso * Math.cos(ang), u0 + paso * Math.sin(ang)]);
      }
      const enArco = (s) => { const x = s / paso, i = Math.min(Math.floor(x), tabla.length - 2), r = x - i; return [lerp(tabla[i][0], tabla[i + 1][0], r), lerp(tabla[i][1], tabla[i + 1][1], r)]; };
      // comba: la superficie se arquea a lo largo de la cuerda
      const pos = (s, f) => {
        const fa = enBorde(AT, s), ff = enBorde(fugaOrden, s);
        const qq = clamp((fa - f) / (fa - ff || 1), 0, 1);
        const comba = 0.03 * (1 - s / 1.2) * 4 * qq * (1 - qq);
        const [lat, up] = enArco(s);
        return amundo(P0, E, f, lado * lat, up + comba);
      };
      const borde = [...AT, ...FU].map(([s, f]) => pos(s, f));
      let n = normalPlano(pos(0.15, 0.08), pos(0.15, -0.1), pos(0.45, 0.15));
      if (punto(n, E.Up) < 0) n = mul(n, -1);
      const arriba = punto(n, VISTA) > 0;
      const luz = clamp(punto(arriba ? n : mul(n, -1), SOL), 0, 1);
      // grabado como en las fotos: arriba, las cubiertas en rayas a lo largo del ala y las plumas de
      // vuelo en trazos que van hacia atrás (primarias abiertas en abanico en la mano), más apretado
      // y oscuro cuanto menos luz; abajo, blanca con el margen de ataque ancho, la punta y un margen
      // de fuga fino, oscuros
      const enQ = (s, qq) => { const fa = enBorde(AT, s), ff = enBorde(fugaOrden, s); return pos(s, fa + (ff - fa) * qq); };
      const tira = (qq, s0 = 0.09, s1 = PUNTA) => { const pts = []; for (let s = s0; s <= s1 + 1e-6; s += 0.03) pts.push(pr(enQ(Math.min(s, PUNTA - 0.002), qq))); return camino(pts); };
      const rayas = [];
      if (arriba) {
        const nC = Math.round(5 + 3 * (1 - luz));
        for (let i = 1; i <= nC; i++) rayas.push(tira((i / (nC + 1)) * 0.5));
        // secundarias: trazos cortos a lo largo de la cuerda en el brazo
        for (let s = 0.12; s < SM; s += 0.028 - 0.006 * (1 - luz)) rayas.push(camino([pr(enQ(s, 0.48)), pr(enQ(s + 0.006, 0.99))]));
        // primarias: en abanico hacia la punta
        for (let i = 0; i < 12; i++) {
          const s = SM + 0.03 + i * 0.05;
          rayas.push(camino([pr(enQ(Math.min(s, PUNTA - 0.03), 0.4)), pr(enQ(Math.min(s + 0.03 + i * 0.006, PUNTA - 0.005), 0.995))]));
        }
      } else {
        for (const qq of [0.03, 0.07, 0.11, 0.15, 0.19, 0.23]) rayas.push(tira(qq));
        for (const qq of [0.3, 0.45, 0.6, 0.75, 0.9]) rayas.push(tira(qq, 0.9)); // la punta oscura
        rayas.push(tira(0.94, 0.09, 0.9));
      }
      // espesor del borde de ataque: una lonja que se ve cuando el ala se inclina
      const lonja = [];
      for (let s = 0.08; s <= PUNTA; s += 0.05) lonja.push(pr(pos(s, enBorde(AT, s))));
      for (let s = PUNTA; s >= 0.08; s -= 0.05) {
        const th2 = 0.035 * (1 - s / 1.15);
        const p = pos(s, enBorde(AT, s) - 0.012);
        lonja.push(pr(add(p, mul(E.Up, -th2))));
      }
      return { borde, rayas, lonja, arriba, luz, hondo: borde.reduce((m, x) => m + hondo(x), 0) / borde.length };
    });

    const cu = cuerpo(P0, E, CUERPO_A, { cabeza, fp: 0.3 });
    const r0 = cu.anillos[0], r1 = cu.anillos[1];
    // pico: un cono desde la cara, con su gancho
    const pico = [];
    for (let j = 0; j < 10; j++) { const a = (j / 10) * Math.PI * 2; pico.push(add(add(r0.c, mul(r0.L, 0.017 * Math.cos(a))), mul(r0.U, 0.021 * Math.sin(a)))); }
    const puntaPico = add(add(r0.c, mul(r0.F, 0.14)), mul(r0.U, -0.014)); // pico grueso, con el gancho abajo
    const picoPts = [...pico.map(pr), pr(puntaPico)];
    const cascara = (pts) => { // envolvente convexa
      const ps = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      for (const p of ps) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (const p of ps.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    };
    const culmen = camino([pr(r0.en(Math.PI / 2)), pr(add(add(r0.c, mul(r0.F, 0.14)), mul(r0.U, -0.004)))]);
    // la ceja: una pincelada oscura sobre el ojo, a cada lado de la cabeza
    const ceja = (lado) => {
      const a = lado > 0 ? 0.35 : Math.PI - 0.35;
      return camino([pr(r1.en(a)), pr(add(r1.en(a), mul(r1.F, -0.04)))]);
    };
    const cejasVistas = [1, -1].filter((lado) => punto(r1.n(lado > 0 ? 0.35 : Math.PI - 0.35), VISTA) > 0).map(ceja).join('');
    // el manto oscuro entre las alas y la cola oscura
    const manto = mantoPoligono(cu.anillos);
    const colaW = 0.045 + 0.025 * Math.abs(ph);
    const cola = [[-0.34, colaW * 0.85], [-0.44, colaW], [-0.47, colaW * 0.45], [-0.475, 0], [-0.47, -colaW * 0.45], [-0.44, -colaW], [-0.34, -colaW * 0.85]].map(([f, l]) => pr(amundo(P0, E, f, l, 0.02)));

    const piezas = [
      ...lados.map((L) => ({ hondo: L.hondo, dibujar: (g) => {
        g.replaceChildren();
        el('path', { d: camino(L.lonja, true), fill: P.suave, stroke: P.tinta, 'stroke-width': '0.5' }, g);
        el('path', { d: camino(L.borde.map(pr), true), fill: L.arriba ? P.suave : P.papel, 'fill-opacity': L.arriba ? f1(0.42 + 0.28 * (1 - L.luz)) : '1', stroke: P.tinta, 'stroke-width': '0.9' }, g);
        el('path', { d: L.rayas.join(''), fill: 'none', stroke: P.tinta, 'stroke-width': L.arriba ? f1(0.55 + 0.4 * (1 - L.luz)) : '1.1', 'stroke-opacity': L.arriba ? f1(0.55 + 0.35 * (1 - L.luz)) : '0.85' }, g);
      } })),
      { hondo: cu.hondo, dibujar: (g) => {
        g.replaceChildren();
        el('path', { d: camino(cola, true), fill: P.suave, 'fill-opacity': '0.75', stroke: P.tinta, 'stroke-width': '0.7' }, g);
        el('path', { d: camino(cu.contorno, true), fill: P.papel, stroke: P.tinta, 'stroke-width': '0.9' }, g);
        el('path', { d: sombreado(cu.anillos, 0.25), fill: 'none', stroke: P.tinta, 'stroke-width': '0.45', 'stroke-opacity': '0.55' }, g);
        el('path', { d: manto, fill: P.suave, 'fill-opacity': '0.62', stroke: 'none' }, g);
        el('path', { d: cejasVistas, stroke: P.tinta, 'stroke-width': '1.6', fill: 'none' }, g);
        el('path', { d: camino(cascara(picoPts), true), fill: P.tierra, stroke: P.tinta, 'stroke-width': '0.8' }, g);
        el('path', { d: culmen, stroke: P.tinta, 'stroke-width': '0.5', fill: 'none' }, g);
      } },
    ];
    piezas.sort((a, b) => b.hondo - a.hondo);
    piezas.forEach((pz, i) => pz.dibujar(alb.piezas[i]));
    // la sombra en el agua: más nítida cuanto más bajo vuela
    const RAYO = mul(SOL, -1);
    const alMar = (x) => { const s = x[2] / -RAYO[2]; return pr([x[0] + RAYO[0] * s, x[1] + RAYO[1] * s, 0]); };
    const silueta = [...cu.anillos.map((r) => r.en(r.sup)), ...cu.anillos.map((r) => r.en(r.inf)).reverse()];
    const sombra = lados.map((L) => camino(L.borde.map(alMar), true)).join('') + camino(silueta.map(alMar), true);
    pone(alb.sombra, { d: sombra, 'fill-opacity': f1(0.2 - 0.06 * (e0.z - 0.6)) });
    pone(alb.sombra2, { d: sombra, transform: 'translate(1.5 1)' });
  }
  // el manto gris entre las alas, liso y continuo con ellas, como en las fotos: la parte visible
  // de arriba del cuerpo entre la nuca y la rabadilla
  function mantoPoligono(anillos) {
    const a = [], b = [];
    for (const r of anillos) {
      if (r.f > 0.2 || r.f < -0.25) continue;
      const ancho = r.f > 0.12 ? 0.55 + (0.2 - r.f) * 5 : 0.95; // se angosta hacia la nuca
      const vis = [];
      for (let j = 0; j <= 12; j++) { const ang = Math.PI / 2 - ancho + (j / 12) * 2 * ancho; if (punto(r.n(ang), VISTA) > 0) vis.push(pr(r.en(ang))); }
      if (vis.length) { a.push(vis[0]); b.push(vis[vis.length - 1]); }
    }
    return a.length > 1 ? camino([...a, ...b.reverse()], true) : '';
  }
  // (antes: arcos apretados sobre el lomo)
  function sombreadoManto(anillos) {
    const arcos = [];
    for (const r of anillos) {
      if (r.f > 0.16 || r.f < -0.24) continue;
      const pts = [];
      for (let j = 0; j <= 10; j++) {
        const a = Math.PI / 2 - 0.85 + (j / 10) * 1.7;
        if (punto(r.n(a), VISTA) > 0) pts.push(pr(r.en(a)));
      }
      if (pts.length > 1) arcos.push(camino(pts));
    }
    // y entre anillo y anillo, más rayas interpoladas para que el manto se lea oscuro
    for (let i = 0; i < anillos.length - 1; i++) {
      const r = anillos[i], s = anillos[i + 1];
      if (r.f > 0.16 || s.f < -0.24) continue;
      for (const x of [0.25, 0.5, 0.75]) {
        const pts = [];
        for (let j = 0; j <= 10; j++) {
          const a = Math.PI / 2 - 0.85 + (j / 10) * 1.7;
          if (punto(r.n(a), VISTA) > 0) pts.push(pr(mezcla(r.en(a), s.en(a), x)));
        }
        if (pts.length > 1) arcos.push(camino(pts));
      }
    }
    return arcos.join('');
  }

  if (AVE === 'playeros') escenaPlayeros();
  else el('rect', { x: 0, y: 0, width: W, height: H, fill: P.mar, 'fill-opacity': '0.55' }, gAgua);

  function cuadro(t) {
    mar(t);
    if (AVE === 'playeros') playeros(t % 14);
    else albatros(t % LOOP_A);
  }
  window.__demo = cuadro;
  if (!q.has('grabar')) {
    const t0 = performance.now();
    const loop = () => { cuadro((performance.now() - t0) / 1000); requestAnimationFrame(loop); };
    loop();
  }
})();
