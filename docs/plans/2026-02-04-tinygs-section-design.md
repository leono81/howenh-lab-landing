# Diseño: Sección "Escuchando el Espacio" - TinyGS

**Fecha**: 2026-02-04
**Estado**: Aprobado para implementación

## Resumen

Nueva sección para la landing page de Howenh Labs que presenta la estación terrestre TinyGS operada desde Tierra del Fuego. Combina valor científico, expertise técnica y el factor "wow" de escuchar satélites desde el fin del mundo.

## Especificaciones

### Ubicación
- Última sección antes del footer
- Clase `section-fullscreen` para ocupar pantalla completa
- ID: `#space-station`

### Estructura Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   "Escuchando el Espacio"          [Stats Panel]        │
│   Subtítulo descriptivo            ┌──────────────┐     │
│                                    │ 14+ sats     │     │
│        ┌─────────────────┐         │ 1400+ est    │     │
│        │                 │         │ 400+ pkts    │     │
│        │   GLOBO 3D      │         └──────────────┘     │
│        │   (hemisferio   │                              │
│        │    sur)         │         [Tech Stack]         │
│        │                 │         ┌──────────────┐     │
│        │  ★ Estación     │         │ LilyGO T3    │     │
│        │                 │         │ LoRa 433MHz  │     │
│        └─────────────────┘         │ Antena QFH   │     │
│                                    └──────────────┘     │
│   Tagline + CTA                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Globo 3D (CSS + SVG)

#### Características
- Hemisferio sur en perspectiva isométrica (rotado ~20°)
- Continentes simplificados: Sudamérica, Antártida, parte de África/Oceanía
- Color continentes: `#1a1a1a` con borde `rgba(255,178,0,0.1)`
- Grilla de meridianos/paralelos: `rgba(255,255,255,0.05)`
- Glow atmosférico: gradiente radial dorado sutil

#### Estación TinyGS
- Punto dorado brillante (#ffb200)
- Animación de pulso/ondas expansivas (ondas de radio)
- Posición: Tierra del Fuego (-54.8°S)

#### Satélites
- 3-4 puntos pequeños orbitando en elipses
- Trails sutiles detrás de cada satélite
- Nombres: FossaSat-2, Norbi, FEES, SDSat

#### Animaciones
- Rotación automática: ~60 segundos por vuelta
- Pausa en hover sobre el globo
- Ondas de la estación: pulso continuo cada 2s

#### Interactividad (Hover)
- Estación → Tooltip: "Estación TinyGS · Tierra del Fuego · -54.8°S"
- Satélites → Tooltip: nombre del satélite

### Panel 1: Estadísticas de la Red

```html
<div class="glass-panel">
  <h3>Red Global TinyGS</h3>
  <div class="stats-grid">
    <div>14+ <span>Satélites activos</span></div>
    <div>1,400+ <span>Estaciones online</span></div>
    <div>400+ <span>Paquetes/mes</span></div>
  </div>
</div>
```

- Números animados con conteo al entrar en viewport
- Íconos en color primario (#ffb200)

### Panel 2: Tech Stack / Hardware

```html
<div class="glass-panel">
  <h3>Hardware</h3>
  <div class="tech-cards">
    <div>LilyGO T3 v1.6.1</div>
    <div>LoRa 433MHz</div>
    <div>Antena QFH</div>
  </div>
</div>
```

- Mini-cards con íconos estilizados
- Hover revela descripción breve

### Textos

**Título**: "Escuchando el Espacio"

**Subtítulo**: "Recibiendo telemetría satelital desde el fin del mundo"

**Tagline**: "Una de las estaciones terrestres más australes de la red global TinyGS, contribuyendo datos desde la latitud 54°S donde pocos pueden escuchar."

**CTA**: "Ver estación en vivo →" → https://tinygs.com/station/Howenh@f6jHgPJphLY_hUgj

### Navegación

Agregar link en el nav:
```html
<a href="#space-station">Space</a>
```

## Consideraciones Técnicas

### CSS Requerido
- Transformaciones 3D: `perspective`, `rotateX`, `rotateY`, `rotateZ`
- Animaciones: `@keyframes` para rotación, pulso, órbitas
- Nuevos estilos para tooltips hover

### SVG
- Paths simplificados de continentes (hemisferio sur)
- Elipses para órbitas de satélites
- Círculos animados para ondas de radio

### JavaScript
- Intersection Observer para animación de conteo
- Event listeners para hover en satélites/estación
- Pausar rotación en hover

### Responsive
- Mobile: Globo arriba, paneles abajo en stack vertical
- Reducir complejidad de animaciones en mobile

## Archivos a Modificar

1. `index.html` - Agregar sección y estilos CSS
2. Actualizar nav con nuevo link

## Link de Referencia

Estación TinyGS: https://tinygs.com/station/Howenh@f6jHgPJphLY_hUgj
