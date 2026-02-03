# Final Landing Page Design - Howenh Labs

**Fecha**: 2026-02-02
**Estado**: Aprobado por usuario
**Objetivo**: Versión final combinando lo mejor de las 5 variantes exploratorias

---

## Estructura de Secciones

1. Hero (original)
2. Workflow/Procesos (híbrido creativo)
3. Kenos Showcase (browser windows con parallax)
4. Chatbot Comparison (nueva sección)
5. Footer (original)

**Eliminado**: Tech Stack section

---

## Paleta de Colores Global

- **Primary**: Dorado `#ffb200`
- **Background**: Negro absoluto `#0A0A0B`
- **Surface**: `#18181B`
- **Estados pre-IA**: Grises/azules apagados `#6B7280`, `#9CA3AF`
- **Estados post-IA**: Dorado brillante con glow effects

---

## Sección 1: Hero

**Estado**: Mantener original del master branch sin cambios

**Elementos**:
- Video de fondo (hero-video.mp4)
- Título: "Redefiniendo los límites con IA Aplicada"
- Navegación flotante con logo SVG
- Coordenadas geográficas: Cabo Domingo (-53.6884, -67.8457)
- Scroll indicator animado
- Descripción: "Howenh Labs transforma sistemas complejos..."

**Tipografía**: Space Grotesk (display) + Noto Sans (body)

---

## Sección 2: Workflow/Procesos

**Base técnica**: Código de variante 8082 (Glacial Tech) como punto de partida

### Concepto: Animación Híbrida en Fases

**Paleta de colores híbrida**:
- **Pre-IA**: Grises/azules apagados (`#6B7280`, `#9CA3AF`)
- **Post-IA**: Dorado brillante `#ffb200` con efectos glow

### Estructura de Nodos

**Flujo normal (5 nodos)**:
```
Input → Procesamiento → Validación → Staging → Output
```

**Nodo IA**: Aparece en el centro después de completar flujo normal

**Nodos potenciados (4 nuevos)**:
```
Analytics, Predicción, Optimización, Insights Avanzados
```

### Secuencia de Animación (Loop de 8 segundos)

| Tiempo | Fase | Descripción |
|--------|------|-------------|
| 0-3s | Flujo Normal | 5 nodos se completan secuencialmente (gris/azul) |
| 3-4s | Aparición IA | Nodo IA aparece en centro (fade in + scale up) |
| 4-5s | Conexión | Líneas conectan nodos normales → IA |
| 5-6s | Transformación | Todos los nodos brillan en dorado |
| 6-8s | Expansión | Aparecen 4 nodos nuevos conectados a IA |
| 8s+ | Loop | Reinicia desde el inicio |

### Implementación Técnica

- **Trigger**: Intersection Observer con `threshold: 0.8` (cuando sección está 80% en viewport)
- **Loop**: Automático continuo mientras la sección es visible
- **Tecnología**: SVG con animaciones CSS + JavaScript para orquestación
- **Efectos visuales**:
  - Partículas que fluyen por las conexiones
  - Glow effects en nodos post-IA
  - Transiciones smooth entre estados

---

## Sección 3: Kenos Showcase

**Concepto**: Browser windows con parallax mouse interaction

### Las 4 Ventanas

1. **Dashboard Principal**
   - Métricas generales
   - Gráficos de actividad
   - Resumen del día

2. **Gestión de Pacientes**
   - Lista de pacientes
   - Detalles médicos
   - Historial clínico

3. **Monitor de Vitales**
   - Telemetría en tiempo real
   - Gráficos ECG/presión arterial
   - Alertas de umbrales

4. **Predicciones IA**
   - Analytics predictivos
   - Insights automáticos
   - Alertas tempranas

### Diseño Visual

**Estilo de ventanas**:
- Chrome de navegador con barra superior
- Dots estilo macOS (rojo, amarillo, verde)
- Apiladas en diagonal (inspirado en variante 8083)
- Cada ventana en capa Z diferente

**Interacción Parallax**:
```javascript
data-depth values:
- Ventana 1 (Dashboard): 0.3
- Ventana 2 (Pacientes): 0.5
- Ventana 3 (Vitales): 0.7
- Ventana 4 (IA): 0.9
```

- `perspective: 1200px` en contenedor
- Movimiento proporcional al mouse
- Rotación sutil en X/Y
- Ventanas con mayor depth se mueven más

**Efectos adicionales**:
- Sombras pronunciadas para profundidad
- Glassmorphic effects sutiles
- Hover: ventana al frente (z-index + scale 1.02)
- Transiciones suaves (300ms ease-out)

### Mockups de UI

Cada ventana muestra mockup realista de interfaz médica:
- Headers con logo KENOS
- Datos ficticios pero realistas
- Gráficos y visualizaciones
- Estados interactivos (hover, active)

---

## Sección 4: Chatbot Comparison (NUEVA)

**Concepto**: Comparación lado a lado chatbot tradicional vs chatbot con IA

### Layout

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Chatbot Tradicional   │   Chatbot con IA         │
│   ───────────────────    │   ──────────────────     │
│   [Chat window]          │   [Chat window]          │
│   ❌ Respuestas rígidas  │   ✅ Comprensión natural │
│   ❌ Solo FAQs           │   ✅ Ejecuta acciones    │
│                                                      │
└──────────────────────────────────────────────────────┘
                 [● ○ ○] Navegación
```

### Los 3 Escenarios del Carrusel

#### Escenario 1: Agendar Cita

**Chatbot Tradicional**:
```
Usuario: Necesito agendar una cita
Bot: Por favor complete el formulario en este enlace: [link]
```

**Chatbot con IA**:
```
Usuario: Necesito agendar una cita
Bot IA: ¡Claro! Veo que prefieres las mañanas. ¿Te viene bien
        el miércoles a las 10am con la Dra. González?
Usuario: Perfecto
Bot IA: ✓ Cita agendada para 05/02 10:00
        ✓ Recordatorio enviado a tu email
        ✓ Preparación pre-consulta lista
```

#### Escenario 2: Consulta Médica

**Chatbot Tradicional**:
```
Usuario: Me duele la cabeza desde hace 3 días
Bot: Consulta nuestras FAQs sobre síntomas comunes:
     - Dolor de cabeza [link]
     - Migraña [link]
     - Fiebre [link]
```

**Chatbot con IA**:
```
Usuario: Me duele la cabeza desde hace 3 días
Bot IA: Entiendo tu preocupación. Veo en tu historial que
        tuviste migrañas en 2024. ¿Este dolor es similar?
        ¿Viene acompañado de sensibilidad a la luz?
Usuario: Sí, es similar
Bot IA: Basándome en tu historial y síntomas:
        • Recomiendo consulta con neurología
        • He enviado tus síntomas al Dr. Ramírez
        • Mientras tanto, evita pantallas brillantes
```

#### Escenario 3: Acción Compleja

**Chatbot Tradicional**:
```
Usuario: Necesito enviar mis últimos análisis al especialista
        y agendar seguimiento
Bot: Lo siento, no puedo ayudarte con eso.
     Por favor contacta a soporte en horario de oficina.
```

**Chatbot con IA**:
```
Usuario: Necesito enviar mis últimos análisis al especialista
        y agendar seguimiento
Bot IA: Perfecto, déjame ayudarte:
        ✓ Análisis de sangre (28/01) enviados al Dr. López
        ✓ Seguimiento agendado para 12/02 a las 15:00
        ✓ Recordatorio añadido a tu calendario
        ✓ Preparación para la consulta lista

        ¿Necesitas algo más?
```

### Carrusel Mejorado - Especificaciones

**Autoplay**:
- Cambia cada 6 segundos automáticamente
- Pausa en hover (usuario pone mouse encima)
- Smooth transitions entre escenarios

**Navegación**:
- 3 dots clickeables (● ○ ○)
- Click directo para saltar entre escenarios
- Indicador visual del escenario activo

**Preview sutil**:
- Fade del siguiente escenario en el borde derecho
- Opacidad 0.3, blur sutil
- Crea curiosidad para seguir viendo

**Typing Animation**:
- Mensajes se escriben letra por letra
- Velocidad: 30ms por carácter
- Ambos bots escriben simultáneamente
- Delay realista entre mensajes (800ms)

### Diseño Visual de los Chatbots

**Chatbot Tradicional** (izquierda):
- UI genérica, colores grises `#6B7280`
- Burbujas de mensaje rectangulares
- Sin avatars o con bot genérico
- Respuestas en texto plano
- Sin indicadores de acción

**Chatbot con IA** (derecha):
- UI moderna, acento dorado `#ffb200`
- Burbujas redondeadas con sombras
- Avatar personalizado
- Checkmarks ✓ para acciones completadas
- Iconos contextuales (📅 calendario, 📊 análisis, etc.)
- Animaciones sutiles de "typing..."

**Labels superiores**:
```
┌─────────────────────┐  ┌─────────────────────┐
│ ⚙️ Bot Tradicional  │  │ 🤖 Kenos AI Chat   │
│ Respuestas básicas  │  │ Inteligencia real  │
└─────────────────────┘  └─────────────────────┘
```

---

## Sección 5: Footer

**Estado**: Mantener original del master branch sin cambios

**Elementos**:
- Logo SVG (montaña + heartbeat)
- Tagline: "Engineering logic from the end of the world"
- Columnas de navegación:
  - Products (Kenos SaaS, Neural Engine, Edge Analytics)
  - Company (About Us, Manifesto, Careers)
  - Coordinates (LAT, LONG, LOC - Río Grande, TDF)
- Links sociales
- Copyright © 2025 Howenh Labs
- Privacy Policy, Terms of Service

---

## Elementos Eliminados

- ❌ **Tech Stack section** - Era genérica y no aportaba valor diferenciador

---

## Especificaciones Técnicas Generales

### Tipografía
- **Display**: Space Grotesk (original del hero)
- **Body**: Noto Sans
- **Code/Mono**: JetBrains Mono (para la sección chatbot si es necesario)

### Animaciones y Performance
- Usar Intersection Observer para lazy-load animations
- requestAnimationFrame para animaciones smooth
- CSS animations donde sea posible (mejor performance)
- JavaScript solo para orquestación compleja

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Animaciones simplificadas en mobile
- Parallax deshabilitado en mobile (usar stacking simple)

### Accesibilidad
- Contraste WCAG AA mínimo
- Animaciones respetan `prefers-reduced-motion`
- Keyboard navigation en carrusel
- Alt texts en mockups

---

## Notas de Implementación

1. **Orden de desarrollo sugerido**:
   - Mantener Hero y Footer del original
   - Eliminar Tech Stack
   - Implementar Workflow (más complejo)
   - Implementar Kenos Showcase
   - Implementar Chatbot Comparison (nuevo)

2. **Assets necesarios**:
   - Mockups de UI de Kenos (4 vistas)
   - Iconos para chatbot (checkmarks, calendario, etc.)
   - Avatar para chatbot IA

3. **Testing prioritario**:
   - Animación de Workflow en diferentes velocidades de conexión
   - Parallax en diferentes resoluciones
   - Carrusel en mobile (touch gestures)
   - Performance general (lighthouse score > 90)

---

## Próximos Pasos

1. ✅ Diseño validado y documentado
2. ⏳ Crear branch `design/final` con worktree
3. ⏳ Implementar según este documento
4. ⏳ Review y ajustes
5. ⏳ Merge a master
