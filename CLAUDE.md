# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page para Howenh Labs - una startup de IA aplicada ubicada en Tierra del Fuego, Argentina. La página presenta la empresa y sus productos: Kenos Medical SaaS y Hown Facturador.

## Development Commands

```bash
# Iniciar servidor local (Python)
python -m http.server 8080

# Alternativa con Node.js
npx serve
```

No hay sistema de build - es un sitio estático puro.

## Architecture

**Aplicación single-page HTML5** con todo el código en `index.html`:

- **Líneas 1-178**: Head, meta tags, Tailwind config, CSS custom
- **Líneas 180-280**: Hero section con video de fondo
- **Líneas 285-444**: Secciones de contenido (Tech Stack, Kenos SaaS, AI Agents)
- **Líneas 446-529**: Footer
- **Líneas 532-559**: JavaScript (Intersection Observer para animaciones)

### Tailwind Configuration

Configuración embebida en `<script>` con tema personalizado:
- **Primary color**: `#ffb200` (dorado)
- **Background-dark**: `#231d0f`
- **Fuentes**: Space Grotesk (títulos), Noto Sans (cuerpo)
- **Dark mode**: habilitado via clase

### Assets

```
assets/
├── hero-video.mp4      # Video de fondo del hero (17.4 MB)
├── logo-icon-clean.png # Logo sin fondo
├── logo-icon.png       # Logo con fondo
├── logo-white.png      # Logo blanco
└── logo.jpg            # Logo principal
```

## Key Patterns

- **Glassmorphism**: Usa `backdrop-blur` y `bg-opacity` para paneles translúcidos
- **Animaciones scroll**: Intersection Observer activa clases `animate-fadeSlideUp` y `animate-fadeIn`
- **Grid responsivo**: Bento grid de 4 columnas para features de Kenos
- **Hown FAQ accordion**: Sección side-by-side (video Remotion + FAQ interactiva). Staggered reveal on scroll + accordion click. CSS custom en `.hown-faq-*`, JS en script dedicado
- **Idioma**: Contenido en español

## Deployment

Deploy a hosting estático. El README menciona Coolify como plataforma de deployment.
