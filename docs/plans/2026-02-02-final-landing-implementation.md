# Final Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement final landing page combining best elements from 5 exploratory variants with hybrid workflow animation, parallax Kenos showcase, and new chatbot comparison section.

**Architecture:** Single-page HTML with embedded CSS/JS. Maintain hero and footer from original, eliminate Tech Stack section, implement 3 new/modified sections: Workflow (hybrid animation), Kenos (parallax), Chatbot (new comparison).

**Tech Stack:**
- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6+)
- SVG for workflow animations
- Intersection Observer API
- CSS transforms for parallax

---

## Task 1: Setup Base Structure

**Files:**
- Modify: `index.html` (entire file)

**Step 1: Copy original index.html as baseline**

Use the current master branch `index.html` as starting point. We'll modify it section by section.

**Step 2: Remove Tech Stack section**

Locate and remove the entire section between lines ~285-317 (the tech stack ticker).

Find:
```html
<!-- Tech Stack Ticker -->
<section id="solutions" class="border-y border-white/5...">
  ...
</section>
```

Delete this entire `<section>` block.

**Step 3: Verify structure**

After removal, verify the structure is:
1. Navigation
2. Hero
3. (empty space where we'll add Workflow)
4. Kenos section
5. (empty space where we'll add Chatbot)
6. Footer

**Step 4: Test baseline**

Run: `python -m http.server 8090` in the worktree
Open: http://localhost:8090
Expected: Page loads with hero, original Kenos, footer. No tech stack section.

**Step 5: Commit baseline**

```bash
cd .worktrees/final
git add index.html
git commit -m "refactor: remove tech stack section

Prepare for final landing implementation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Implement Workflow Section - Structure

**Files:**
- Modify: `index.html` (add new section after hero, before Kenos)

**Step 1: Add section container**

Insert after hero section (`</section>` that closes hero), before Kenos:

```html
<!-- Workflow Section -->
<section id="workflow" class="relative z-10 py-24 px-6 md:px-12 bg-void">
  <div class="max-w-7xl mx-auto">
    <!-- Title -->
    <div class="text-center mb-16">
      <h2 class="text-white text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Automatización <span class="text-primary">Inteligente</span>
      </h2>
      <p class="text-gray-400 text-lg max-w-2xl mx-auto">
        Observa cómo la IA transforma flujos complejos en procesos optimizados
      </p>
    </div>

    <!-- Workflow Animation Container -->
    <div id="workflow-animation" class="relative w-full h-[500px] flex items-center justify-center">
      <svg id="workflow-svg" class="w-full h-full" viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg">
        <!-- Nodes and connections will be added in next task -->
      </svg>
    </div>
  </div>
</section>
```

**Step 2: Add CSS for workflow**

Insert in `<style>` section:

```css
/* Workflow animation states */
.workflow-node {
  transition: all 0.4s ease;
}

.workflow-node.completed {
  fill: #9CA3AF;
}

.workflow-node.powered {
  fill: #ffb200;
  filter: drop-shadow(0 0 8px rgba(255, 178, 0, 0.6));
}

.workflow-connection {
  stroke-dasharray: 5, 5;
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}

.workflow-particle {
  r: 3;
  fill: #9CA3AF;
  opacity: 0.8;
}

.workflow-particle.fast {
  fill: #ffb200;
  filter: drop-shadow(0 0 4px rgba(255, 178, 0, 0.8));
}
```

**Step 3: Verify structure**

Reload page. Expected: New empty section with title appears between hero and Kenos.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(workflow): add section structure and base styles

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Implement Workflow Section - SVG Nodes

**Files:**
- Modify: `index.html` (add SVG nodes inside workflow-svg)

**Step 1: Add normal flow nodes (5 nodes)**

Inside `<svg id="workflow-svg">`:

```html
<!-- Normal Flow Nodes (5) -->
<g id="normal-flow">
  <!-- Input -->
  <circle class="workflow-node" id="node-input" cx="100" cy="250" r="25" fill="#6B7280" />
  <text x="100" y="290" text-anchor="middle" fill="#9CA3AF" font-size="12">Input</text>

  <!-- Procesamiento -->
  <circle class="workflow-node" id="node-process" cx="300" cy="250" r="25" fill="#6B7280" />
  <text x="300" y="290" text-anchor="middle" fill="#9CA3AF" font-size="12">Proceso</text>

  <!-- Validación -->
  <circle class="workflow-node" id="node-validate" cx="500" cy="250" r="25" fill="#6B7280" />
  <text x="500" y="290" text-anchor="middle" fill="#9CA3AF" font-size="12">Validación</text>

  <!-- Staging -->
  <circle class="workflow-node" id="node-staging" cx="700" cy="250" r="25" fill="#6B7280" />
  <text x="700" y="290" text-anchor="middle" fill="#9CA3AF" font-size="12">Staging</text>

  <!-- Output -->
  <circle class="workflow-node" id="node-output" cx="900" cy="250" r="25" fill="#6B7280" />
  <text x="900" y="290" text-anchor="middle" fill="#9CA3AF" font-size="12">Output</text>
</g>

<!-- Connections between normal nodes -->
<g id="normal-connections" stroke="#6B7280" stroke-width="2" fill="none">
  <line class="workflow-connection" x1="125" y1="250" x2="275" y2="250" />
  <line class="workflow-connection" x1="325" y1="250" x2="475" y2="250" />
  <line class="workflow-connection" x1="525" y1="250" x2="675" y2="250" />
  <line class="workflow-connection" x1="725" y1="250" x2="875" y2="250" />
</g>
```

**Step 2: Add AI node (initially hidden)**

```html
<!-- AI Node (appears at 3s) -->
<g id="ai-node" opacity="0">
  <circle id="node-ai" cx="600" cy="120" r="40" fill="#ffb200"
    filter="drop-shadow(0 0 12px rgba(255, 178, 0, 0.8))" />
  <text x="600" y="130" text-anchor="middle" fill="#0A0A0B" font-size="16" font-weight="bold">IA</text>
  <text x="600" y="80" text-anchor="middle" fill="#ffb200" font-size="12">AI Core</text>
</g>
```

**Step 3: Add new powered nodes (initially hidden)**

```html
<!-- Powered Nodes (appear at 6s) -->
<g id="powered-nodes" opacity="0">
  <!-- Analytics -->
  <circle class="workflow-node" id="node-analytics" cx="450" cy="400" r="20" fill="#ffb200" />
  <text x="450" y="435" text-anchor="middle" fill="#ffb200" font-size="11">Analytics</text>

  <!-- Predicción -->
  <circle class="workflow-node" id="node-prediction" cx="600" cy="400" r="20" fill="#ffb200" />
  <text x="600" y="435" text-anchor="middle" fill="#ffb200" font-size="11">Predicción</text>

  <!-- Optimización -->
  <circle class="workflow-node" id="node-optimize" cx="750" cy="400" r="20" fill="#ffb200" />
  <text x="750" y="435" text-anchor="middle" fill="#ffb200" font-size="11">Optimización</text>

  <!-- Insights -->
  <circle class="workflow-node" id="node-insights" cx="900" cy="400" r="20" fill="#ffb200" />
  <text x="900" y="435" text-anchor="middle" fill="#ffb200" font-size="11">Insights</text>
</g>
```

**Step 4: Verify nodes render**

Reload page. Expected: See 5 gray nodes in a line (normal flow). AI node and powered nodes not visible yet (opacity 0).

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat(workflow): add SVG nodes for workflow animation

Normal flow, AI node, and powered nodes structure.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Implement Workflow Section - Animation Logic

**Files:**
- Modify: `index.html` (add JavaScript for animation orchestration)

**Step 1: Add animation controller**

Insert in `<script>` section at bottom:

```javascript
// Workflow Animation Controller
class WorkflowAnimation {
  constructor() {
    this.phase = 0;
    this.isRunning = false;
    this.observer = null;
  }

  init() {
    // Setup Intersection Observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.8 });

    const workflowSection = document.getElementById('workflow-animation');
    if (workflowSection) {
      this.observer.observe(workflowSection);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runLoop();
  }

  stop() {
    this.isRunning = false;
    this.phase = 0;
    this.reset();
  }

  reset() {
    // Reset all nodes to initial state
    document.querySelectorAll('.workflow-node').forEach(node => {
      node.classList.remove('completed', 'powered');
    });
    document.getElementById('ai-node').style.opacity = '0';
    document.getElementById('powered-nodes').style.opacity = '0';
  }

  async runLoop() {
    while (this.isRunning) {
      await this.animatePhase1(); // 0-3s: Complete normal nodes
      if (!this.isRunning) break;

      await this.animatePhase2(); // 3-4s: AI appears
      if (!this.isRunning) break;

      await this.animatePhase3(); // 4-5s: Connect to AI
      if (!this.isRunning) break;

      await this.animatePhase4(); // 5-6s: Transform to gold
      if (!this.isRunning) break;

      await this.animatePhase5(); // 6-8s: Show powered nodes
      if (!this.isRunning) break;

      await this.wait(2000); // Pause before restart
      this.reset();
    }
  }

  async animatePhase1() {
    // Complete nodes sequentially (600ms each)
    const nodes = ['node-input', 'node-process', 'node-validate', 'node-staging', 'node-output'];
    for (const nodeId of nodes) {
      document.getElementById(nodeId).classList.add('completed');
      await this.wait(600);
    }
  }

  async animatePhase2() {
    // AI node appears
    const aiNode = document.getElementById('ai-node');
    aiNode.style.transition = 'opacity 1s ease, transform 1s ease';
    aiNode.style.opacity = '1';
    aiNode.style.transform = 'scale(1)';
    await this.wait(1000);
  }

  async animatePhase3() {
    // Connections appear (visual only, no actual lines for simplicity)
    await this.wait(1000);
  }

  async animatePhase4() {
    // Transform all nodes to gold
    document.querySelectorAll('#normal-flow .workflow-node').forEach(node => {
      node.classList.remove('completed');
      node.classList.add('powered');
    });
    await this.wait(1000);
  }

  async animatePhase5() {
    // Show powered nodes
    const poweredNodes = document.getElementById('powered-nodes');
    poweredNodes.style.transition = 'opacity 2s ease';
    poweredNodes.style.opacity = '1';
    await this.wait(2000);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize on page load
const workflowAnim = new WorkflowAnimation();
workflowAnim.init();
```

**Step 2: Verify animation**

Reload page and scroll to workflow section. Expected: Animation starts when section is 80% visible, loops continuously.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(workflow): add animation orchestration logic

8-second loop with 5 phases, Intersection Observer trigger.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Implement Kenos Section - Parallax Structure

**Files:**
- Modify: `index.html` (replace current Kenos bento grid with parallax windows)

**Step 1: Replace Kenos section**

Find the current Kenos section (starts with `<section class="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="kenos">`).

Replace entire section with:

```html
<!-- Kenos Section with Parallax -->
<section id="kenos" class="py-24 px-6 md:px-12 bg-void relative overflow-hidden">
  <div class="max-w-7xl mx-auto">
    <!-- Title -->
    <div class="text-center mb-16">
      <h2 class="text-white text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Kenos Medical SaaS
      </h2>
      <p class="text-gray-400 text-lg max-w-2xl mx-auto">
        Plataforma integral para el futuro de la salud digital
      </p>
    </div>

    <!-- Parallax Container -->
    <div id="kenos-parallax" class="relative h-[600px] md:h-[700px]"
         style="perspective: 1200px; perspective-origin: center;">
      <!-- Windows will be added in next step -->
    </div>
  </div>
</section>
```

**Step 2: Add CSS for windows**

Insert in `<style>`:

```css
/* Kenos Parallax Windows */
.kenos-window {
  position: absolute;
  background: #18181B;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease, z-index 0s;
  transform-style: preserve-3d;
}

.kenos-window:hover {
  transform: scale(1.02) !important;
  z-index: 100 !important;
  box-shadow: 0 30px 80px rgba(255, 178, 0, 0.3);
}

.window-chrome {
  background: #0A0A0B;
  border-radius: 12px 12px 0 0;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #2A2A2E;
}

.window-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.window-content {
  padding: 20px;
  background: #18181B;
  border-radius: 0 0 12px 12px;
  min-height: 300px;
}

.kenos-window[data-depth="0.3"] {
  z-index: 10;
}

.kenos-window[data-depth="0.5"] {
  z-index: 20;
}

.kenos-window[data-depth="0.7"] {
  z-index: 30;
}

.kenos-window[data-depth="0.9"] {
  z-index: 40;
}
```

**Step 3: Verify structure**

Reload page. Expected: Kenos section shows title but empty parallax container.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(kenos): add parallax container structure

Replace bento grid with parallax-ready container.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Implement Kenos Section - Window Mockups

**Files:**
- Modify: `index.html` (add 4 browser windows with mockup content)

**Step 1: Add Window 1 - Dashboard**

Inside `#kenos-parallax`:

```html
<!-- Window 1: Dashboard (depth 0.3) -->
<div class="kenos-window" data-depth="0.3" style="width: 500px; top: 50px; left: 50px;">
  <!-- Chrome -->
  <div class="window-chrome">
    <div class="window-dot" style="background: #FF5F57;"></div>
    <div class="window-dot" style="background: #FFBD2E;"></div>
    <div class="window-dot" style="background: #28CA42;"></div>
    <span class="text-gray-500 text-xs ml-4">kenos.app/dashboard</span>
  </div>

  <!-- Content -->
  <div class="window-content">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
        <span class="text-primary font-bold text-sm">K</span>
      </div>
      <span class="text-white font-semibold">Dashboard Principal</span>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-void p-4 rounded-lg">
        <div class="text-gray-500 text-xs mb-1">Pacientes Activos</div>
        <div class="text-white text-2xl font-bold">247</div>
        <div class="text-green-500 text-xs">+12% vs ayer</div>
      </div>
      <div class="bg-void p-4 rounded-lg">
        <div class="text-gray-500 text-xs mb-1">Citas Hoy</div>
        <div class="text-white text-2xl font-bold">18</div>
        <div class="text-gray-500 text-xs">6 completadas</div>
      </div>
      <div class="bg-void p-4 rounded-lg">
        <div class="text-gray-500 text-xs mb-1">Alertas</div>
        <div class="text-white text-2xl font-bold">3</div>
        <div class="text-yellow-500 text-xs">Revisar</div>
      </div>
    </div>

    <!-- Simple chart placeholder -->
    <div class="bg-void p-4 rounded-lg">
      <div class="text-gray-400 text-xs mb-2">Actividad Semanal</div>
      <div class="flex items-end gap-2 h-20">
        <div class="bg-primary/30 w-full rounded-t" style="height: 40%;"></div>
        <div class="bg-primary/50 w-full rounded-t" style="height: 65%;"></div>
        <div class="bg-primary/40 w-full rounded-t" style="height: 50%;"></div>
        <div class="bg-primary/70 w-full rounded-t" style="height: 85%;"></div>
        <div class="bg-primary w-full rounded-t" style="height: 100%;"></div>
      </div>
    </div>
  </div>
</div>
```

**Step 2: Add Window 2 - Pacientes**

```html
<!-- Window 2: Pacientes (depth 0.5) -->
<div class="kenos-window" data-depth="0.5" style="width: 480px; top: 120px; left: 600px;">
  <div class="window-chrome">
    <div class="window-dot" style="background: #FF5F57;"></div>
    <div class="window-dot" style="background: #FFBD2E;"></div>
    <div class="window-dot" style="background: #28CA42;"></div>
    <span class="text-gray-500 text-xs ml-4">kenos.app/pacientes</span>
  </div>

  <div class="window-content">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
        <span class="text-primary font-bold text-sm">K</span>
      </div>
      <span class="text-white font-semibold">Gestión de Pacientes</span>
    </div>

    <!-- Patient list -->
    <div class="space-y-3">
      <div class="bg-void p-3 rounded-lg flex items-center justify-between">
        <div>
          <div class="text-white text-sm font-medium">María González</div>
          <div class="text-gray-500 text-xs">ID: #4521 • Última visita: Hoy</div>
        </div>
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
      </div>
      <div class="bg-void p-3 rounded-lg flex items-center justify-between">
        <div>
          <div class="text-white text-sm font-medium">Carlos Ramírez</div>
          <div class="text-gray-500 text-xs">ID: #4518 • Última visita: 28/01</div>
        </div>
        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
      </div>
      <div class="bg-void p-3 rounded-lg flex items-center justify-between">
        <div>
          <div class="text-white text-sm font-medium">Ana Martínez</div>
          <div class="text-gray-500 text-xs">ID: #4502 • Última visita: 25/01</div>
        </div>
        <div class="w-2 h-2 rounded-full bg-gray-500"></div>
      </div>
    </div>
  </div>
</div>
```

**Step 3: Add Window 3 - Vitales**

```html
<!-- Window 3: Vitales (depth 0.7) -->
<div class="kenos-window" data-depth="0.7" style="width: 460px; top: 250px; left: 100px;">
  <div class="window-chrome">
    <div class="window-dot" style="background: #FF5F57;"></div>
    <div class="window-dot" style="background: #FFBD2E;"></div>
    <div class="window-dot" style="background: #28CA42;"></div>
    <span class="text-gray-500 text-xs ml-4">kenos.app/vitales</span>
  </div>

  <div class="window-content">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
        <span class="text-primary font-bold text-sm">K</span>
      </div>
      <span class="text-white font-semibold">Monitor de Vitales</span>
    </div>

    <div class="space-y-4">
      <div class="bg-void p-4 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-400 text-sm">Frecuencia Cardíaca</span>
          <span class="text-primary text-lg font-bold">72 bpm</span>
        </div>
        <div class="h-12 flex items-end gap-1">
          <div class="bg-primary/20 w-1 rounded-t" style="height: 40%;"></div>
          <div class="bg-primary/30 w-1 rounded-t" style="height: 60%;"></div>
          <div class="bg-primary/40 w-1 rounded-t" style="height: 45%;"></div>
          <div class="bg-primary/50 w-1 rounded-t" style="height: 70%;"></div>
          <div class="bg-primary/60 w-1 rounded-t" style="height: 55%;"></div>
          <div class="bg-primary/70 w-1 rounded-t" style="height: 65%;"></div>
          <div class="bg-primary w-1 rounded-t" style="height: 50%;"></div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-void p-3 rounded-lg">
          <div class="text-gray-400 text-xs">Presión</div>
          <div class="text-white font-semibold">120/80</div>
        </div>
        <div class="bg-void p-3 rounded-lg">
          <div class="text-gray-400 text-xs">SpO2</div>
          <div class="text-white font-semibold">98%</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Step 4: Add Window 4 - IA Analytics**

```html
<!-- Window 4: IA Analytics (depth 0.9) -->
<div class="kenos-window" data-depth="0.9" style="width: 500px; top: 300px; left: 620px;">
  <div class="window-chrome">
    <div class="window-dot" style="background: #FF5F57;"></div>
    <div class="window-dot" style="background: #FFBD2E;"></div>
    <div class="window-dot" style="background: #28CA42;"></div>
    <span class="text-gray-500 text-xs ml-4">kenos.app/ia-analytics</span>
  </div>

  <div class="window-content">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
        <span class="text-primary font-bold text-sm">K</span>
      </div>
      <span class="text-white font-semibold">Predicciones IA</span>
    </div>

    <div class="space-y-4">
      <div class="bg-void p-4 rounded-lg border-l-2 border-primary">
        <div class="flex items-start gap-3">
          <div class="text-2xl">⚠️</div>
          <div>
            <div class="text-white text-sm font-medium mb-1">Alerta Temprana</div>
            <div class="text-gray-400 text-xs mb-2">
              Patrón detectado en paciente #4521 sugiere atención preventiva
            </div>
            <div class="text-primary text-xs">Confianza: 87%</div>
          </div>
        </div>
      </div>

      <div class="bg-void p-4 rounded-lg">
        <div class="text-gray-400 text-xs mb-2">Insights Automáticos</div>
        <div class="space-y-2 text-xs">
          <div class="flex items-center gap-2 text-gray-300">
            <div class="w-1 h-1 bg-primary rounded-full"></div>
            <span>15% aumento en citas preventivas vs mes anterior</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <div class="w-1 h-1 bg-primary rounded-full"></div>
            <span>Tiempo de consulta promedio: -12 min (mejorado)</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300">
            <div class="w-1 h-1 bg-primary rounded-full"></div>
            <span>3 pacientes requieren seguimiento esta semana</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Step 5: Verify windows render**

Reload page. Expected: 4 browser windows visible in Kenos section, stacked diagonally. No parallax yet.

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat(kenos): add 4 browser window mockups

Dashboard, Pacientes, Vitales, IA Analytics windows.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Implement Kenos Section - Parallax Logic

**Files:**
- Modify: `index.html` (add mousemove parallax JavaScript)

**Step 1: Add parallax controller**

Insert in `<script>` section:

```javascript
// Kenos Parallax Controller
class KenosParallax {
  constructor() {
    this.container = document.getElementById('kenos-parallax');
    this.windows = [];
    this.isEnabled = window.innerWidth >= 768; // Disable on mobile
  }

  init() {
    if (!this.container || !this.isEnabled) return;

    this.windows = Array.from(this.container.querySelectorAll('.kenos-window'));

    this.container.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    // Reset on mouse leave
    this.container.addEventListener('mouseleave', () => {
      this.reset();
    });
  }

  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate mouse position relative to center (-1 to 1)
    const mouseX = (e.clientX - rect.left - centerX) / centerX;
    const mouseY = (e.clientY - rect.top - centerY) / centerY;

    this.windows.forEach(window => {
      const depth = parseFloat(window.dataset.depth);

      // Movement amount based on depth (closer = more movement)
      const moveX = mouseX * depth * 30; // Max 30px movement
      const moveY = mouseY * depth * 30;

      // Rotation based on mouse position
      const rotateY = mouseX * depth * 5; // Max 5deg rotation
      const rotateX = -mouseY * depth * 5;

      // Apply transform
      window.style.transform = `
        translate3d(${moveX}px, ${moveY}px, ${depth * 50}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });
  }

  reset() {
    this.windows.forEach(window => {
      const depth = parseFloat(window.dataset.depth);
      window.style.transform = `translate3d(0, 0, ${depth * 50}px)`;
    });
  }
}

// Initialize parallax
const kenosParallax = new KenosParallax();
kenosParallax.init();
```

**Step 2: Verify parallax effect**

Reload page and move mouse over Kenos section. Expected: Windows move with parallax effect, closer windows move more.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(kenos): add mouse parallax interaction

Windows respond to mouse movement with depth-based parallax.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Implement Chatbot Section - Structure

**Files:**
- Modify: `index.html` (add new chatbot comparison section after Kenos)

**Step 1: Add chatbot section**

Insert after Kenos section, before footer:

```html
<!-- Chatbot Comparison Section -->
<section id="chatbot" class="py-24 px-6 md:px-12 bg-surface relative">
  <div class="max-w-7xl mx-auto">
    <!-- Title -->
    <div class="text-center mb-16">
      <h2 class="text-white text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Conversaciones <span class="text-primary">Inteligentes</span>
      </h2>
      <p class="text-gray-400 text-lg max-w-2xl mx-auto">
        Compara la diferencia entre un chatbot tradicional y uno potenciado con IA
      </p>
    </div>

    <!-- Split Comparison -->
    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <!-- Traditional Chatbot -->
      <div class="bg-void rounded-2xl overflow-hidden border border-white/5">
        <!-- Header -->
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span class="text-xl">⚙️</span>
            </div>
            <div>
              <div class="text-white font-semibold">Bot Tradicional</div>
              <div class="text-gray-500 text-xs">Respuestas básicas</div>
            </div>
          </div>
        </div>

        <!-- Chat Container -->
        <div id="chat-traditional" class="p-6 h-96 overflow-y-auto space-y-4">
          <!-- Messages will be added by JavaScript -->
        </div>
      </div>

      <!-- AI Chatbot -->
      <div class="bg-void rounded-2xl overflow-hidden border border-primary/20">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary/20 to-primary/10 px-6 py-4 border-b border-primary/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center">
              <span class="text-xl">🤖</span>
            </div>
            <div>
              <div class="text-white font-semibold">Kenos AI Chat</div>
              <div class="text-primary text-xs">Inteligencia real</div>
            </div>
          </div>
        </div>

        <!-- Chat Container -->
        <div id="chat-ai" class="p-6 h-96 overflow-y-auto space-y-4">
          <!-- Messages will be added by JavaScript -->
        </div>
      </div>
    </div>

    <!-- Carousel Navigation -->
    <div class="flex justify-center gap-3">
      <button class="carousel-dot active" data-scenario="0"></button>
      <button class="carousel-dot" data-scenario="1"></button>
      <button class="carousel-dot" data-scenario="2"></button>
    </div>
  </div>
</section>
```

**Step 2: Add CSS for chatbot**

Insert in `<style>`:

```css
/* Chatbot Messages */
.chat-message {
  display: flex;
  gap: 12px;
  opacity: 0;
  animation: messageAppear 0.3s ease forwards;
}

@keyframes messageAppear {
  to { opacity: 1; }
}

.chat-message.user {
  flex-direction: row-reverse;
}

.chat-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.chat-bubble.traditional {
  background: #2A2A2E;
  color: #E5E5E5;
  border-radius: 12px 12px 12px 4px;
}

.chat-bubble.ai {
  background: linear-gradient(135deg, #ffb200 0%, #ff8c00 100%);
  color: #0A0A0B;
  border-radius: 12px 12px 12px 4px;
  font-weight: 500;
}

.chat-bubble.user {
  background: #4A4A4E;
  color: #FFFFFF;
  border-radius: 12px 12px 4px 12px;
}

.chat-checkmark {
  color: #0A0A0B;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #2A2A2E;
  border-radius: 12px;
  width: fit-content;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #6B7280;
  border-radius: 50%;
  animation: typingBounce 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

/* Carousel Dots */
.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4A4A4E;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  background: #ffb200;
  width: 32px;
  border-radius: 6px;
}

.carousel-dot:hover {
  background: #6B7280;
}
```

**Step 3: Verify structure**

Reload page. Expected: Chatbot section appears with empty chat containers and dots.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(chatbot): add comparison section structure

Split view with traditional and AI chatbot containers.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Implement Chatbot Section - Scenario Data

**Files:**
- Modify: `index.html` (add scenario data and typing animation)

**Step 1: Add scenario data**

Insert in `<script>` section:

```javascript
// Chatbot Scenarios Data
const chatbotScenarios = [
  {
    name: "Agendar Cita",
    traditional: [
      { type: 'user', text: 'Necesito agendar una cita' },
      { type: 'bot', text: 'Por favor complete el formulario en este enlace: [Formulario de Citas]' }
    ],
    ai: [
      { type: 'user', text: 'Necesito agendar una cita' },
      { type: 'bot', text: '¡Claro! Veo que prefieres las mañanas. ¿Te viene bien el miércoles a las 10am con la Dra. González?' },
      { type: 'user', text: 'Perfecto' },
      { type: 'bot', text: 'Excelente. Confirmo:', checkmarks: [
        'Cita agendada para 05/02 10:00',
        'Recordatorio enviado a tu email',
        'Preparación pre-consulta lista'
      ]}
    ]
  },
  {
    name: "Consulta Médica",
    traditional: [
      { type: 'user', text: 'Me duele la cabeza desde hace 3 días' },
      { type: 'bot', text: 'Consulta nuestras FAQs sobre síntomas comunes:\n- Dolor de cabeza [link]\n- Migraña [link]\n- Fiebre [link]' }
    ],
    ai: [
      { type: 'user', text: 'Me duele la cabeza desde hace 3 días' },
      { type: 'bot', text: 'Entiendo tu preocupación. Veo en tu historial que tuviste migrañas en 2024. ¿Este dolor es similar? ¿Viene acompañado de sensibilidad a la luz?' },
      { type: 'user', text: 'Sí, es similar' },
      { type: 'bot', text: 'Basándome en tu historial y síntomas:', checkmarks: [
        'Recomiendo consulta con neurología',
        'He enviado tus síntomas al Dr. Ramírez',
        'Mientras tanto, evita pantallas brillantes'
      ]}
    ]
  },
  {
    name: "Acción Compleja",
    traditional: [
      { type: 'user', text: 'Necesito enviar mis últimos análisis al especialista y agendar seguimiento' },
      { type: 'bot', text: 'Lo siento, no puedo ayudarte con eso. Por favor contacta a soporte en horario de oficina.' }
    ],
    ai: [
      { type: 'user', text: 'Necesito enviar mis últimos análisis al especialista y agendar seguimiento' },
      { type: 'bot', text: 'Perfecto, déjame ayudarte:', checkmarks: [
        'Análisis de sangre (28/01) enviados al Dr. López',
        'Seguimiento agendado para 12/02 a las 15:00',
        'Recordatorio añadido a tu calendario',
        'Preparación para la consulta lista'
      ]},
      { type: 'bot', text: '¿Necesitas algo más?' }
    ]
  }
];
```

**Step 2: Add typing animation function**

```javascript
// Typing Animation
async function typeMessage(text, speed = 30) {
  const chars = text.split('');
  let result = '';
  for (const char of chars) {
    result += char;
    await new Promise(resolve => setTimeout(resolve, speed));
  }
  return result;
}
```

**Step 3: Add message rendering function**

```javascript
// Render Chat Message
function createChatMessage(message, isAI = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${message.type}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${message.type === 'user' ? 'user' : (isAI ? 'ai' : 'traditional')}`;

  if (message.checkmarks) {
    bubble.innerHTML = `<div>${message.text}</div>`;
    const checksDiv = document.createElement('div');
    checksDiv.className = 'chat-checkmark';
    message.checkmarks.forEach(check => {
      const checkItem = document.createElement('div');
      checkItem.innerHTML = `✓ ${check}`;
      checksDiv.appendChild(checkItem);
    });
    bubble.appendChild(checksDiv);
  } else {
    bubble.textContent = message.text;
  }

  messageDiv.appendChild(bubble);
  return messageDiv;
}
```

**Step 4: Verify functions**

Test in console. Expected: No errors, functions defined.

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat(chatbot): add scenario data and typing functions

3 scenarios with traditional and AI responses.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Implement Chatbot Section - Carousel Controller

**Files:**
- Modify: `index.html` (add carousel controller with autoplay)

**Step 1: Add carousel controller**

Insert in `<script>`:

```javascript
// Chatbot Carousel Controller
class ChatbotCarousel {
  constructor() {
    this.currentScenario = 0;
    this.isPlaying = false;
    this.autoplayInterval = null;
    this.traditionalContainer = document.getElementById('chat-traditional');
    this.aiContainer = document.getElementById('chat-ai');
    this.dots = document.querySelectorAll('.carousel-dot');
    this.observer = null;
  }

  init() {
    // Setup dot click handlers
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToScenario(index);
      });
    });

    // Setup Intersection Observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          this.startAutoplay();
        } else {
          this.stopAutoplay();
        }
      });
    }, { threshold: 0.5 });

    const chatbotSection = document.getElementById('chatbot');
    if (chatbotSection) {
      this.observer.observe(chatbotSection);
    }

    // Pause on hover
    const section = document.getElementById('chatbot');
    section.addEventListener('mouseenter', () => this.pauseAutoplay());
    section.addEventListener('mouseleave', () => this.resumeAutoplay());
  }

  async goToScenario(index) {
    if (this.isPlaying) return;

    this.currentScenario = index;
    this.updateDots();
    await this.playScenario(chatbotScenarios[index]);
  }

  async playScenario(scenario) {
    this.isPlaying = true;

    // Clear chats
    this.traditionalContainer.innerHTML = '';
    this.aiContainer.innerHTML = '';

    // Play traditional chat
    const traditionalPromise = this.playMessages(scenario.traditional, this.traditionalContainer, false);

    // Play AI chat simultaneously
    const aiPromise = this.playMessages(scenario.ai, this.aiContainer, true);

    await Promise.all([traditionalPromise, aiPromise]);

    this.isPlaying = false;
  }

  async playMessages(messages, container, isAI) {
    for (const message of messages) {
      // Show typing indicator
      if (message.type === 'bot') {
        const typing = this.createTypingIndicator();
        container.appendChild(typing);
        await new Promise(resolve => setTimeout(resolve, 800));
        typing.remove();
      }

      // Add message
      const messageEl = createChatMessage(message, isAI);
      container.appendChild(messageEl);

      // Scroll to bottom
      container.scrollTop = container.scrollHeight;

      // Wait before next message
      await new Promise(resolve => setTimeout(resolve, message.type === 'user' ? 1000 : 1500));
    }
  }

  createTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    return typing;
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentScenario);
    });
  }

  startAutoplay() {
    if (this.autoplayInterval) return;

    // Play first scenario immediately
    this.goToScenario(0);

    // Then autoplay every 6 seconds
    this.autoplayInterval = setInterval(() => {
      if (!this.isPlaying) {
        this.currentScenario = (this.currentScenario + 1) % chatbotScenarios.length;
        this.goToScenario(this.currentScenario);
      }
    }, 6000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  pauseAutoplay() {
    this.stopAutoplay();
  }

  resumeAutoplay() {
    this.startAutoplay();
  }
}

// Initialize chatbot carousel
const chatbotCarousel = new ChatbotCarousel();
chatbotCarousel.init();
```

**Step 2: Verify carousel works**

Reload page and scroll to chatbot section. Expected: Autoplay starts, scenarios change every 6 seconds, dots update, pause on hover.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(chatbot): add carousel controller with autoplay

Automatic scenario rotation, pause on hover, dot navigation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Final Testing and Adjustments

**Files:**
- Modify: `index.html` (responsive fixes and polish)

**Step 1: Test on mobile viewport**

Resize browser to 375px width. Check:
- Hero responsive
- Workflow animation visible (simplified)
- Kenos windows stack vertically (no parallax)
- Chatbot sections stack vertically
- Footer responsive

**Step 2: Add mobile CSS fixes**

Insert in `<style>`:

```css
/* Mobile Responsive Fixes */
@media (max-width: 768px) {
  /* Workflow SVG smaller */
  #workflow-animation {
    height: 400px;
  }

  /* Kenos windows stack */
  .kenos-window {
    position: relative !important;
    width: 100% !important;
    max-width: 400px;
    margin: 0 auto 20px !important;
    top: auto !important;
    left: auto !important;
    transform: none !important;
  }

  #kenos-parallax {
    height: auto !important;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Chatbot single column */
  #chatbot .grid {
    grid-template-columns: 1fr;
  }

  .chat-bubble {
    max-width: 90%;
  }
}
```

**Step 3: Test animations with prefers-reduced-motion**

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .workflow-connection {
    animation: none;
  }

  .typing-dot {
    animation: none;
  }

  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 4: Final visual check**

Open page, verify:
- ✅ Hero unchanged from original
- ✅ Workflow animation runs smoothly
- ✅ Kenos parallax responds to mouse
- ✅ Chatbot carousel autoplays
- ✅ Footer unchanged from original
- ✅ No Tech Stack section

**Step 5: Commit final version**

```bash
git add index.html
git commit -m "feat: finalize responsive design and accessibility

Mobile responsive fixes, prefers-reduced-motion support.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Launch and Validate

**Step 1: Start development server**

```bash
cd .worktrees/final
python -m http.server 8090
```

Open: http://localhost:8090

**Step 2: Validate all sections**

Go through checklist:
- [ ] Hero displays with video, original styling
- [ ] Workflow animation triggers on scroll, loops correctly
- [ ] Kenos windows have parallax effect on mouse move
- [ ] Chatbot scenarios autoplay, dots work
- [ ] Footer displays correctly
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] No console errors

**Step 3: Performance check**

Open DevTools → Lighthouse
Run audit. Expected:
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90

**Step 4: Document completion**

Create summary of implementation.

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: complete final landing page implementation

All sections implemented and tested:
- Hero: original (maintained)
- Workflow: hybrid animation with 8s loop
- Kenos: 4 windows with mouse parallax
- Chatbot: 3-scenario carousel with autoplay
- Footer: original (maintained)

Tech Stack section removed as planned.

Ready for review and merge to master.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Plan Complete

**Total Tasks**: 12
**Estimated Time**: 3-4 hours
**Files Modified**: 1 (`index.html`)

**Key Features Implemented**:
1. ✅ Workflow section with hybrid color animation
2. ✅ Kenos showcase with mouse parallax
3. ✅ Chatbot comparison with carousel
4. ✅ Maintained original hero and footer
5. ✅ Removed Tech Stack section
6. ✅ Mobile responsive
7. ✅ Accessibility support

---
