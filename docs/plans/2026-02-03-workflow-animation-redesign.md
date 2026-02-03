# Workflow Animation Redesign

**Fecha:** 2026-02-03
**Estado:** Aprobado
**Archivo objetivo:** `index.html` (sección workflow, líneas 530-675)

## Resumen

Rediseño de la sección "Automatización Inteligente" para elevar el impacto visual inspirándose en tres referencias: offground.solutions, internationalstudentsuk.com, y somethingintheweb.fr.

## Decisiones de Diseño

| Aspecto | Decisión |
|---------|----------|
| Tecnología partículas | SVG Puro + GSAP (MotionPath) |
| Activación título | Por scroll (Intersection Observer) |
| Densidad background | Sutil y elegante (8% opacidad) |

## Arquitectura de Capas

```
┌─────────────────────────────────────────────┐
│  CAPA 4: Título con efecto outline→filled   │
├─────────────────────────────────────────────┤
│  CAPA 3: Nodos y conexiones (SVG existente) │
├─────────────────────────────────────────────┤
│  CAPA 2: Partículas de flujo de datos       │
├─────────────────────────────────────────────┤
│  CAPA 1: Grid de fondo + glow atmosférico   │
└─────────────────────────────────────────────┘
```

## Especificaciones Técnicas

### 1. Background Grid (Capa 1)

```svg
<g id="background-grid" opacity="0.08">
  <pattern id="dot-grid" width="50" height="50" patternUnits="userSpaceOnUse">
    <circle cx="25" cy="25" r="1.5" fill="#ffb200"/>
  </pattern>
  <rect width="100%" height="100%" fill="url(#dot-grid)"/>
</g>
```

- Puntos de 1.5px, separación 50px
- Opacidad 8%
- Estático, sin animación

### 2. Glow Atmosférico

```svg
<radialGradient id="atmospheric-glow" cx="50%" cy="55%">
  <stop offset="0%" stop-color="#ffb200" stop-opacity="0.15"/>
  <stop offset="50%" stop-color="#ffb200" stop-opacity="0.05"/>
  <stop offset="100%" stop-color="#ffb200" stop-opacity="0"/>
</radialGradient>

<ellipse id="ai-atmosphere" cx="450" cy="300" rx="200" ry="150"
         fill="url(#atmospheric-glow)" opacity="0"/>
```

- Elipse 400x300px centrada en nodo IA
- Aparece con fade junto al nodo IA

### 3. Partículas de Flujo (Capa 2)

**Estructura:**
- 3 partículas por conexión (12 total para conexiones IA→nodos)
- Tamaños: 2px, 3px, 4px (variedad visual)
- Colores: #ffb200, #ffc933, #ffe066

**Animación:**
```javascript
gsap.to('.particle', {
  motionPath: {
    path: '#ai-conn-[nombre]',
    align: '#ai-conn-[nombre]',
    alignOrigin: [0.5, 0.5]
  },
  duration: 1.5,
  repeat: -1,
  ease: 'none',
  stagger: 0.5
});
```

**Timing:**
- Inician después de que las líneas se dibujan
- Loop infinito mientras sección visible
- Se detienen al scrollear fuera

**Dependencia:** Plugin GSAP MotionPathPlugin (CDN gratuito)

### 4. Título Outline → Filled (Capa 4)

**HTML:**
```html
<h2 class="workflow-title">
  <span class="title-outline">Automatización</span>
  <span class="text-primary">Inteligente</span>
</h2>
```

**CSS:**
```css
.title-outline {
  color: transparent;
  -webkit-text-stroke: 2px #ffb200;
  background: linear-gradient(to right, #ffb200 50%, transparent 50%);
  background-clip: text;
  -webkit-background-clip: text;
  background-size: 200% 100%;
  background-position: 100% 0;
  transition: background-position 0.8s ease-out;
}

.title-outline.filled {
  background-position: 0% 0;
}
```

**Trigger:** Intersection Observer al 30% del viewport

## Plan de Implementación

### Fase 1: Preparación
- [ ] Agregar CDN de GSAP MotionPathPlugin
- [ ] Agregar nuevos estilos CSS

### Fase 2: Background y Atmósfera
- [ ] Agregar pattern de grid al SVG `<defs>`
- [ ] Agregar gradiente atmosférico al SVG `<defs>`
- [ ] Insertar grupo background-grid como primera capa
- [ ] Insertar elipse ai-atmosphere antes del nodo IA
- [ ] Animar atmósfera junto con aparición del nodo IA

### Fase 3: Partículas de Flujo
- [ ] Crear elementos SVG para partículas
- [ ] Implementar animación MotionPath para cada conexión
- [ ] Sincronizar inicio con fase de conexiones
- [ ] Implementar pausa/resume basado en visibilidad

### Fase 4: Título Cinematográfico
- [ ] Modificar HTML del título
- [ ] Agregar CSS para efecto outline
- [ ] Implementar Intersection Observer dedicado

### Fase 5: Testing y Ajustes
- [ ] Verificar rendimiento en móviles
- [ ] Ajustar opacidades si es necesario
- [ ] Verificar accesibilidad (prefers-reduced-motion)

## Referencias

- **offground.solutions**: Grid de partículas 3D, efectos glow
- **internationalstudentsuk.com**: Líneas SVG con stroke-dasharray
- **somethingintheweb.fr**: Scroll storytelling, texto outline
