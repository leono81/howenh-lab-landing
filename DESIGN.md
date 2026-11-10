---
name: Howenh Labs
description: Un laboratorio en el borde del continente, contado como una lámina grabada en una sola tinta.
colors:
  papel-frio: "#f6f7fb"
  azul-de-grabado: "#1f3a8f"
  azul-lavado: "#5b6fae"
typography:
  display:
    fontFamily: "EB Garamond, serif"
    fontSize: "clamp(40px, 5vw, 96px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(15px, 1.4vw, 21px)"
    fontWeight: 400
    lineHeight: 1.45
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    letterSpacing: "0.1em"
    fontVariation: "'wdth' 125"
  label:
    fontFamily: "Martian Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.12em"
  label-nav:
    fontFamily: "Martian Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.08em"
  button:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(14px, 1.2vw, 17px)"
    fontWeight: 600
rounded:
  none: "0px"
spacing:
  margen: "48px"
  margen-telefono: "16px"
  acciones: "12px"
  nav: "30px"
components:
  button-primary:
    backgroundColor: "{colors.azul-de-grabado}"
    textColor: "{colors.papel-frio}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.9em 1.35em"
  button-secondary:
    backgroundColor: "{colors.papel-frio}"
    textColor: "{colors.azul-de-grabado}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.9em 1.35em"
  nav-cta:
    backgroundColor: "{colors.papel-frio}"
    textColor: "{colors.azul-de-grabado}"
    typography: "{typography.label-nav}"
    rounded: "{rounded.none}"
    padding: "9px 16px"
  nav-link:
    textColor: "{colors.azul-de-grabado}"
    typography: "{typography.label-nav}"
  coordenadas:
    textColor: "{colors.azul-lavado}"
    typography: "{typography.label}"
---

# Design System: Howenh Labs

## Overview

**Creative North Star: "La lámina grabada"**

Toda la página se lee como una lámina de atlas impresa en una sola tinta azul sobre papel frío. El dibujo es de línea: rayados, líneas de agua paralelas a la costa, volúmenes isométricos rayados según la luz. La imagen no es decorado; es el territorio de verdad (Río Grande, la Misión, el Cabo Domingo) dibujado a partir de datos reales y de fotografías, con la precisión de una carta y el oficio de un grabador. La letra se apoya sobre el papel limpio, con aire, y deja que la lámina haga el primer impacto.

La densidad está en el dibujo, no en la interfaz: la interfaz es escasa, rectangular y tipográfica. Donde el dibujo termina no hay un borde: se apaga en el papel con un contorno irregular, como una viñeta de grabado. La luz se dibuja quitando tinta, nunca agregando color. Lo que se mueve (la luz de la baliza, un barco, camiones, un avión, un satélite, olas) se mueve despacio y con propósito, como si la lámina estuviera viva.

Rechazos confirmados: el hero oscuro con brillo de "startup de IA", la grilla de tarjetas, las imágenes generadas con IA para la geografía, el bloque de tierra recortado como un cuadrado y cualquier borde geométrico donde el dibujo se termina.

**Key Characteristics:**
- Una sola tinta (azul de grabado) y su versión lavada, sobre papel frío. Nada más.
- Dibujo de línea en proyección isométrica, con los mismos ejes para todo volumen.
- Geometría real (OpenStreetMap, Copernicus DEM); hitos dibujados a partir de fotos.
- Sin nombres de lugares en el dibujo: solo coordenadas, en mono.
- Esquinas rectas, filetes de 1 px, sin sombras.
- Al cargar, primero se imprime el dibujo y después se asienta la letra.

## Colors

Una sola tinta y el papel: el color existe solo como tinta, más llena o más lavada.

### Primary
- **Azul de grabado** (#1f3a8f): la tinta. Toda línea principal del dibujo (costa, contornos, viñetas, rayados), la letra, el botón primario lleno y los filetes de la barra.

### Secondary
- **Azul lavado** (#5b6fae): la tinta diluida. Lo secundario y lejano: estepa, rayados suaves, olas, órbitas, el borde del botón secundario y los rótulos de coordenadas.

### Neutral
- **Papel frío** (#f6f7fb): el fondo y la luz. El fondo de la página, el relleno de los volúmenes (paredes blancas de la capilla, el cuerpo del satélite), el texto sobre el botón primario y la niebla donde el dibujo se apaga.

### Named Rules
**The One Ink Rule.** No hay otro color que el azul de grabado, su versión lavada y el papel. Los gradientes solo existen como opacidad de esas mismas tintas o del papel (para apagar y para dar luz), nunca como mezcla de colores.

**The Paper-Is-Light Rule.** La luz se dibuja con papel: el haz de la baliza aclara el mar que pisa, los destellos son estrellas de rayitas, los halos son papel. Nunca un color claro, un brillo o un glow.

## Typography

**Display Font:** EB Garamond (con serif del sistema)
**Body Font:** Archivo (con sans-serif)
**Label/Mono Font:** Martian Mono (con monospace)

**Character:** una serif clásica de libro para la voz, una grotesca firme y ancha para la interfaz y una mono de instrumento para los rótulos, como las anotaciones de una carta.

### Hierarchy
- **Display** (EB Garamond 400, ~5% del ancho del dibujo, de 40 px en teléfono a unos 70 px en 1440, 1, −0.01em): el titular del hero; máximo 14em de ancho, partido parejo (`text-wrap: balance`).
- **Body** (Archivo 400, 15 px mínimo, ~20 px en 1440 y 17 px en teléfono, 1.45): bajadas y texto corrido; máximo 46ch.
- **Title** (Archivo 800, 15 px, ancho 125 %, 0.1em, mayúsculas): la marca HOWENH LABS junto al logo.
- **Label** (Martian Mono 400, 11 px, 0.12em): coordenadas y rótulos, en azul lavado.
- **Label nav** (Martian Mono 500, 12 px, 0.08em, mayúsculas): los enlaces de la barra y su botón.
- **Button** (Archivo 600, 14 px mínimo, ~17 px en 1440): las acciones.

### Named Rules
**The Coordinates Not Names Rule.** En el dibujo no hay nombres de lugares; donde haría falta ubicar algo van coordenadas en Martian Mono, en azul lavado. Los nombres viven en el texto alternativo y en la prosa.

**The Scale-With-The-Plate Rule.** En el hero la letra se mide con la misma unidad que el dibujo (`--w`), así titular, bajada y botones guardan su proporción con la lámina en cualquier pantalla.

## Layout

El hero ocupa la pantalla entera (mínimo 680 px de alto). El texto vive arriba a la izquierda sobre papel limpio, a 48 px del borde (16 px en teléfono); el dibujo va a sangre por la derecha y por abajo y se apaga en el papel con un contorno irregular. Un claro ovalado de papel protege el texto sin dibujar una recta.

La escala del dibujo es una sola unidad, `--u` (px por unidad de la maqueta; 100 unidades = 1 km): la da el ancho de la pantalla hasta donde deja el alto. Todo lo que se superpone al dibujo se ubica en esas mismas unidades, dentro del mismo plano.

Cortes: a 900 px el hero se apila (texto arriba y, abajo, una ventana de la maqueta sobre el cabo); a 820 px la barra deja solo la marca y el botón de reunión, y el margen baja a 16 px. Ritmo: 12 px entre acciones, 30 px entre enlaces de la barra.

## Elevation & Depth

Plano: sin sombras. La profundidad la da el dibujo (la proyección isométrica, los rayados según la luz, las líneas de agua que se separan mar adentro) y el apagado en el papel. La única excepción es de legibilidad: los enlaces de la barra llevan un halo de papel (`text-shadow` del color papel) para leerse cuando el dibujo pasa por detrás; no es una sombra.

### Named Rules
**The Flat Paper Rule.** Ninguna superficie se levanta del papel con sombras, brillos ni desenfoques. Lo que está adelante lo dice el dibujo.

## Shapes

Esquinas rectas en todo (0 px). Bordes de 1 px: en tinta llena para el botón de la barra, en azul lavado para el botón secundario. La forma propia del sistema es el dibujo de grabado:

- **Ejes isométricos comunes** (`src/data/iso.ts`): x a lo largo de la costa hacia la ciudad (en pantalla, abajo a la izquierda), y tierra adentro (arriba a la izquierda), z arriba. De cada volumen se ven el techo, la cara que da al mar (−y) y la que da a la ciudad (+x).
- **Escala de trazos** (en unidades de la maqueta): costa 1.9; silueta y contornos 0.6–1; rayados 0.35–0.55; detalles finos 0.25–0.4.
- **Rayados con significado:** manzanas de la ciudad a 30° cada 2.5; plataformas a −30° cada 3.6 en azul lavado; agua quieta (lagunas) a −30° cada 3; el signo de mallín para humedales; puntos para playas; aislante y sombra de los volúmenes con rayas apretadas en la cara a la sombra.
- **Apagado irregular:** el dibujo termina con capas de un mismo contorno ondulado, cada una más adentro y con menos niebla de papel.

### Named Rules
**The Real Ground Rule.** La costa, la ruta, el río, las calles, la pista y el relieve salen de datos reales (OpenStreetMap y Copernicus DEM, procesados por `scripts/`). Los hitos (cabo, capilla, torre, baliza) se dibujan a partir de fotografías. Nada se inventa ni se mueve de lugar.

**The Same Axes Rule.** Todo lo que tiene volumen (viñetas, vehículos, satélite) se dibuja en los ejes isométricos comunes, nunca de frente ni en otra perspectiva.

## Components

### Buttons
Tipográficos y rectos, como una etiqueta impresa.
- **Shape:** esquinas rectas (0 px).
- **Primary:** tinta llena con letra papel (padding 0.9em × 1.35em). Es la acción principal: agendar una reunión.
- **Secondary:** papel con letra en tinta y borde de 1 px en azul lavado; misma medida.
- **Focus:** contorno de 2 px en tinta, separado 3 px.

### Navigation
- **Barra:** arriba, sin fondo, con margen de 48 px; a la izquierda el logo (la montaña con la señal, en tinta) y la marca HOWENH LABS; a la derecha los enlaces en mono mayúscula y el botón "Agendar reunión" con borde de 1 px en tinta sobre papel.
- **Teléfono:** quedan la marca, más chica, y el botón, sin enlaces.

### Coordenadas
- Rótulo en Martian Mono 11 px, azul lavado, espaciado 0.12em: la volanta del titular y la forma de ubicar sin nombrar.

### La maqueta grabada (componente firma)
La costa norte de Río Grande en isométrica, vista desde el mar: mar abierto con líneas de agua, ciudad de manzanas rayadas con calles en blanco, Ruta 3 en doble línea, relieve levantado (×7) y el Cabo Domingo como sólido con banda de roca y cárcavas. Se apaga en el papel con contorno irregular. Se regenera con `npm run mapa`.

### Viñetas isométricas
Capilla de la Misión, Torre de Agua, baliza, barco, camiones, avión y satélite: dibujos de línea en los ejes comunes, más grandes que su escala real para leerse, con papel de relleno, tinta llena en techos rojos o caras a la sombra y rayado para la luz.

### Movimiento
- **Impresión al cargar** (una vez, ~3.5 s): la costa se traza, aparece el mar, se levanta el cabo con su relieve, se traza la ruta, la ciudad crece desde la plaza de la torre y al final aparecen las viñetas.
- **Entrada de la letra** (después del dibujo): cada pieza baja 7 px y se asienta en 1.8 s, con una curva lenta y sin rebote; primero la barra, después coordenadas, titular, bajada y botones. Si la persona hace scroll, toca o aprieta una tecla, todo aparece enseguida.
- **Vida de la lámina:** la baliza gira su haz cada 12 s y destella cuando mira hacia quien mira; un barco cruza el cuadro y sale; dos camiones a lo sumo en la ruta; un avión aterriza y despega hacia el oeste; un satélite cruza en arco; olas sueltas van hacia la orilla.
- **Movimiento reducido:** todo quieto desde el primer cuadro, en un buen momento (el avión en la pista, el haz sobre el mar).

### Named Rules
**The No-Mask Rule.** Sobre el dibujo grande no se usan máscaras (ni SVG ni CSS) ni animaciones CSS de elementos encima: el navegador las pinta como capas enteras fuera de pantalla y en pantallas de 2x y 3x la lámina desaparece. Los apagados son papel pintado encima, los recortes son `clipPath`, y todo lo que se mueve va con SMIL en un svg propio, en su capa.

**The Print-First Rule.** El primer impacto es el dibujo. La letra llega después, despacio, y nunca hace esperar a quien ya está leyendo.

## Do's and Don'ts

### Do:
- **Do** usar solo papel frío (#f6f7fb), azul de grabado (#1f3a8f) y azul lavado (#5b6fae).
- **Do** dibujar todo volumen en los ejes isométricos de `src/data/iso.ts`.
- **Do** sacar la geometría de datos reales y los hitos de fotografías, con su fuente.
- **Do** ubicar con coordenadas en mono, no con nombres.
- **Do** apagar el dibujo en el papel con un contorno irregular.
- **Do** dibujar la luz con papel (aclarando el grabado), los destellos con rayitas.
- **Do** mover las cosas despacio y con SMIL, en un svg aparte, y dejarlas quietas con movimiento reducido.
- **Do** mantener esquinas rectas y filetes de 1 px.

### Don't:
- **Don't** usar otro color, gradientes de color, sombras, brillos ni desenfoques.
- **Don't** cortar el dibujo con un borde recto o un bloque de tierra recortado.
- **Don't** usar imágenes generadas con IA para la geografía ni mover un lugar de donde está.
- **Don't** poner nombres de lugares dentro del dibujo.
- **Don't** usar máscaras SVG o CSS sobre la lámina ni animar con CSS elementos encima de ella.
- **Don't** armar grillas de tarjetas genéricas ni el hero oscuro con brillo de "startup de IA".
- **Don't** usar material ceremonial selk'nam (fotos del Hain, cuerpos pintados, espíritus) como decoración.
