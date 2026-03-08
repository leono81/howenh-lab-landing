# Kenos URL Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Agregar la URL https://www.kenos.app/ en 3 ubicaciones de la landing page para generar tráfico, credibilidad y captación de leads.

**Architecture:** Modificaciones puramente HTML/CSS en `index.html`. Se agregan 2 botones CTA con estilos Tailwind existentes y se actualiza 1 link en el footer.

**Tech Stack:** HTML5, Tailwind CSS, Material Symbols Icons

---

## Task 1: CTA Principal bajo el título de Kenos

**Files:**
- Modify: `index.html:1645` (después del subtítulo)

**Step 1: Agregar el botón CTA**

Insertar después de la línea 1645 (después del `</p>` del subtítulo "Plataforma integral..."):

```html
          <a href="https://www.kenos.app/" target="_blank" rel="noopener"
             class="group inline-flex items-center gap-2 bg-primary text-black font-semibold px-6 py-3 rounded-full
                    hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 mt-6">
            Explorar Plataforma
            <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
          </a>
```

**Step 2: Verificar visualmente**

Run: `python -m http.server 8080`
Expected: Botón dorado visible bajo el subtítulo de la sección Kenos, con hover animado.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(kenos): add primary CTA button under section title"
```

---

## Task 2: CTA al final de la sección Kenos

**Files:**
- Modify: `index.html:1860` (después de cerrar el `.kenos-stack`)

**Step 1: Agregar el botón CTA**

Insertar después de la línea 1860 (después de `</div>` que cierra `.kenos-stack-container`), antes del comentario `<!-- Mobile scroll indicator -->`:

```html
        <!-- CTA Button -->
        <div class="flex justify-center mt-8 md:mt-12">
          <a href="https://www.kenos.app/" target="_blank" rel="noopener"
             class="group inline-flex items-center gap-2 bg-primary text-black font-semibold px-8 py-4 rounded-full
                    hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            Explorar Kenos
            <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
          </a>
        </div>
```

**Step 2: Verificar visualmente**

Run: `python -m http.server 8080`
Expected: Botón dorado centrado después del stack de tarjetas.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(kenos): add CTA button after card stack"
```

---

## Task 3: Fix del link en el Footer

**Files:**
- Modify: `index.html:2249`

**Step 1: Actualizar el link**

Cambiar línea 2249:

```html
<!-- Antes -->
<li><a class="hover:text-white transition-colors" href="#">Kenos SaaS</a></li>

<!-- Después -->
<li><a class="hover:text-white transition-colors" href="https://www.kenos.app/" target="_blank" rel="noopener">Kenos SaaS</a></li>
```

**Step 2: Verificar**

Run: `python -m http.server 8080`
Expected: El link "Kenos SaaS" en el footer abre https://www.kenos.app/ en nueva pestaña.

**Step 3: Commit**

```bash
git add index.html
git commit -m "fix(footer): link Kenos SaaS to kenos.app"
```

---

## Task 4: Verificación final

**Step 1: Verificar todos los links**

1. Abrir http://localhost:8080
2. Scroll a sección Kenos
3. Verificar que el CTA bajo el título funciona
4. Verificar que el CTA después de las tarjetas funciona
5. Scroll al footer
6. Verificar que "Kenos SaaS" abre la URL correcta

**Step 2: Verificar responsive**

1. Abrir DevTools (F12)
2. Probar en móvil (375px)
3. Probar en tablet (768px)
4. Verificar que los botones se ven bien en todos los tamaños

**Step 3: Commit final (si hay ajustes)**

```bash
git add index.html
git commit -m "style(kenos): responsive adjustments for CTA buttons"
```
