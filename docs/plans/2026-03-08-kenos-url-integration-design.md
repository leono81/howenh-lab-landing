# Diseño: Integración de URL de Kenos SaaS

**Fecha:** 2026-03-08
**Objetivo:** Agregar la URL https://www.kenos.app/ en múltiples puntos de la landing page para generar tráfico, dar credibilidad y captar leads interesados.

---

## Resumen

Se implementarán 3 puntos de integración de la URL de Kenos:

1. CTA principal bajo el título de la sección Kenos
2. CTA al final de la sección Kenos (después del stack de tarjetas)
3. Fix del link existente en el footer

---

## Componente 1: CTA Principal bajo el título

**Ubicación:** Después del subtítulo "Plataforma integral para el futuro de la salud digital" (~línea 1644)

**Diseño:**
- Botón con texto "Explorar Plataforma →"
- Fondo: `#ffb200` (primary)
- Texto: negro
- Bordes: `rounded-full`
- Hover: escala sutil (1.05) + sombra dorada
- Icono flecha con animación translate-x al hover
- Atributos: `target="_blank"` y `rel="noopener"`

**HTML aproximado:**
```html
<a href="https://www.kenos.app/" target="_blank" rel="noopener"
   class="inline-flex items-center gap-2 bg-primary text-black font-semibold px-6 py-3 rounded-full
          hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 mt-6">
  Explorar Plataforma
  <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
</a>
```

---

## Componente 2: CTA al final de la sección

**Ubicación:** Después del stack de tarjetas, antes de los dots indicadores (~línea 1863)

**Diseño:**
- Botón único "Explorar Kenos →"
- Mismo estilo que el CTA principal (consistencia)
- Centrado horizontalmente
- Margen superior para separación del stack

**HTML aproximado:**
```html
<div class="flex justify-center mt-12">
  <a href="https://www.kenos.app/" target="_blank" rel="noopener"
     class="inline-flex items-center gap-2 bg-primary text-black font-semibold px-8 py-4 rounded-full
            hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
    Explorar Kenos
    <span class="material-symbols-outlined">arrow_forward</span>
  </a>
</div>
```

---

## Componente 3: Fix del link en Footer

**Ubicación:** Sección "Productos" del footer (~línea 2249)

**Cambio:**
```html
<!-- Antes -->
<a class="hover:text-white transition-colors" href="#">Kenos SaaS</a>

<!-- Después -->
<a class="hover:text-white transition-colors" href="https://www.kenos.app/" target="_blank" rel="noopener">Kenos SaaS</a>
```

---

## Consideraciones técnicas

- No se requieren dependencias adicionales
- Los estilos usan Tailwind CSS existente
- Los iconos usan Material Symbols (ya cargado)
- Todos los links externos incluyen `rel="noopener"` por seguridad
