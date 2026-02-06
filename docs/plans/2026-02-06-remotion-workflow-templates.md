# Remotion Workflow Templates

**Fecha:** 2026-02-06
**Estado:** En progreso

## Objetivo

Crear 3 composiciones Remotion como templates visuales para evaluar las ideas 1, 4 y 5 del brainstorming de la sección "Automatización Inteligente".

## Plan

### Paso 1: Bootstrap Remotion project
- Crear subdirectorio `remotion/` en el repo
- Inicializar con `npx create-video@latest`
- Instalar dependencias adicionales (@remotion/paths, @remotion/transitions, @remotion/light-leaks, @remotion/google-fonts)

### Paso 2: Crear 3 composiciones en paralelo
- **Idea1-VideoLoop**: Recreación fiel de la animación SVG actual con spring() e interpolate()
- **Idea4-Storytelling**: Narrativa cinematográfica con TransitionSeries + LightLeak + text animations
- **Idea5-MultiFormat**: Composición parametrizable con múltiples aspect ratios

### Paso 3: Abrir en browser
- Iniciar Remotion Studio
- Abrir cada composición en tab separado del navegador

## Colores y fuentes (match con landing)
- Primary: #ffb200
- Background: #0A0A0B
- Surface: #18181B
- Text: white / #A1A1AA / #71717A
- Fuentes: Space Grotesk (títulos), Noto Sans (cuerpo)
