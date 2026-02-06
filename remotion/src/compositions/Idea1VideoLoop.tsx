import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { evolvePath, getPointAtLength, getLength } from "@remotion/paths";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSans";

// ─── Font Loading ────────────────────────────────────────────────────────────
const { fontFamily: spaceGrotesk } = loadFont();
const { fontFamily: notoSans } = loadNoto();

// ─── Design Tokens ───────────────────────────────────────────────────────────
const COLORS = {
  primary: "#ffb200",
  bg: "#0A0A0B",
  inactiveGray: "#4A4A4A",
  text: "#A1A1AA",
  label: "#71717A",
  dark: "#1a1a1a",
  connectionGray: "#52525B",
  gold: {
    light: "#ffe066",
    mid: "#ffb200",
    dark: "#996b00",
    warm: "#ffc933",
    deep: "#e6a000",
  },
  gray: {
    light: "#6B6B6B",
    mid: "#4A4A4A",
    dark: "#2A2A2A",
  },
};

// ─── Phase Timing (frames) ──────────────────────────────────────────────────
const PHASE = {
  grayStart: 0,
  grayEnd: 45,
  aiBirthStart: 45,
  aiBirthEnd: 135,
  connectionsStart: 135,
  connectionsEnd: 210,
  illuminationStart: 210,
  illuminationEnd: 300,
  capabilitiesStart: 300,
  capabilitiesEnd: 420,
  holdStart: 420,
  holdEnd: 450,
};

// ─── Layout Constants (in SVG viewBox coordinates: 1920x600) ────────────────
const VIEWBOX_W = 1920;
const VIEWBOX_H = 600;

// Process node positions (% of viewBox width, mapped to absolute coords)
const PROCESS_NODES = [
  {
    name: "Entrada",
    label: "Recepcion",
    x: VIEWBOX_W * 0.25,
    y: 175,
    r: 65,
  },
  {
    name: "Documentos",
    label: "Gestion",
    x: VIEWBOX_W * 0.4,
    y: 175,
    r: 65,
  },
  {
    name: "Controles",
    label: "Verificacion",
    x: VIEWBOX_W * 0.6,
    y: 175,
    r: 65,
  },
  {
    name: "Metricas",
    label: "Medicion",
    x: VIEWBOX_W * 0.75,
    y: 175,
    r: 65,
  },
];

// AI node position (centered below orbs)
const AI_NODE = {
  x: VIEWBOX_W * 0.5,
  y: 380,
  r: 80,
};

// Capability nodes (below AI)
const CAPABILITY_NODES = [
  { name: "Analitica", label: "Insights IA", x: 660, y: 540, r: 55 },
  { name: "Optimizacion", label: "Auto-mejora", x: 960, y: 560, r: 55 },
  { name: "Prediccion", label: "Forecasting", x: 1260, y: 540, r: 55 },
];

// ─── Curved path generators ─────────────────────────────────────────────────
function aiToNodePath(ai: { x: number; y: number }, node: { x: number; y: number }): string {
  const dx = node.x - ai.x;
  const dy = node.y - ai.y;
  const cpx = ai.x + dx * 0.4;
  const cpy = ai.y + dy * 0.7;
  return `M ${ai.x} ${ai.y - 60} Q ${cpx} ${cpy}, ${node.x} ${node.y + 50}`;
}

function aiToCapPath(ai: { x: number; y: number }, cap: { x: number; y: number }): string {
  const cpx = ai.x + (cap.x - ai.x) * 0.3;
  const cpy = ai.y + (cap.y - ai.y) * 0.6;
  return `M ${ai.x} ${ai.y + 60} Q ${cpx} ${cpy}, ${cap.x} ${cap.y - 45}`;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Dot grid background pattern */
const DotGrid: React.FC = () => {
  const dots: React.ReactNode[] = [];
  const spacing = 50;
  for (let x = spacing; x < VIEWBOX_W; x += spacing) {
    for (let y = spacing; y < VIEWBOX_H; y += spacing) {
      dots.push(
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill={COLORS.primary} />
      );
    }
  }
  return <g opacity={0.12}>{dots}</g>;
};

/** Crystalline orb node with animated gray-to-gold transition */
const CrystallineOrb: React.FC<{
  node: (typeof PROCESS_NODES)[number];
  illuminationProgress: number; // 0 = gray, 1 = fully golden
  index: number;
}> = ({ node, illuminationProgress, index }) => {
  const ip = Math.max(0, Math.min(1, illuminationProgress));

  // Interpolate gradient stops between gray and gold
  const gradId = `orb-grad-${index}`;
  const highlightId = `orb-highlight-${index}`;
  const shadowId = `orb-shadow-${index}`;

  // Colors interpolation
  const c1r = interpolate(ip, [0, 1], [107, 255]);
  const c1g = interpolate(ip, [0, 1], [107, 224]);
  const c1b = interpolate(ip, [0, 1], [107, 102]);
  const c2r = interpolate(ip, [0, 1], [74, 255]);
  const c2g = interpolate(ip, [0, 1], [74, 178]);
  const c2b = interpolate(ip, [0, 1], [74, 0]);
  const c3r = interpolate(ip, [0, 1], [42, 153]);
  const c3g = interpolate(ip, [0, 1], [42, 107]);
  const c3b = interpolate(ip, [0, 1], [42, 0]);

  // Text color: gray text -> dark text
  const textR = Math.round(interpolate(ip, [0, 1], [161, 26]));
  const textG = Math.round(interpolate(ip, [0, 1], [161, 26]));
  const textB = Math.round(interpolate(ip, [0, 1], [170, 26]));
  const textColor = `rgb(${textR},${textG},${textB})`;

  // Label color: gray -> gold
  const labelR = Math.round(interpolate(ip, [0, 1], [113, 255]));
  const labelG = Math.round(interpolate(ip, [0, 1], [113, 178]));
  const labelB = Math.round(interpolate(ip, [0, 1], [122, 0]));
  const labelColor = `rgb(${labelR},${labelG},${labelB})`;

  // Floor shadow opacity
  const floorShadowOpacity = interpolate(ip, [0, 1], [0, 0.25]);
  const floorShadowColor = ip > 0.5 ? COLORS.primary : "#000000";

  // Shadow blur intensity
  const shadowOpacity = interpolate(ip, [0, 1], [0.3, 0.5]);

  return (
    <g>
      {/* Defs for this orb */}
      <defs>
        <radialGradient id={gradId} cx="35%" cy="25%">
          <stop
            offset="0%"
            stopColor={`rgb(${Math.round(c1r)},${Math.round(c1g)},${Math.round(c1b)})`}
          />
          <stop
            offset="40%"
            stopColor={`rgb(${Math.round(c2r)},${Math.round(c2g)},${Math.round(c2b)})`}
          />
          <stop
            offset="100%"
            stopColor={`rgb(${Math.round(c3r)},${Math.round(c3g)},${Math.round(c3b)})`}
          />
        </radialGradient>
        <radialGradient id={highlightId} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={ip > 0.5 ? "8" : "6"} result="blur" />
          <feOffset in="blur" dx="0" dy="15" result="offsetBlur" />
          <feFlood
            floodColor={floorShadowColor}
            floodOpacity={String(shadowOpacity)}
            result="color"
          />
          <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floor shadow ellipse */}
      <ellipse
        cx={node.x}
        cy={node.y + 55}
        rx={50}
        ry={12}
        fill={floorShadowColor}
        opacity={floorShadowOpacity}
      />

      {/* Main orb circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={`url(#${gradId})`}
        filter={`url(#${shadowId})`}
      />

      {/* Highlight ellipse */}
      <ellipse
        cx={node.x - 15}
        cy={node.y - 25}
        rx={28}
        ry={18}
        fill={`url(#${highlightId})`}
        opacity={0.4}
      />

      {/* Node text */}
      <text
        x={node.x}
        y={node.y + 6}
        textAnchor="middle"
        fill={textColor}
        fontSize={node.name === "Documentos" ? 15 : 17}
        fontWeight={600}
        fontFamily={spaceGrotesk}
      >
        {node.name}
      </text>

      {/* Label below */}
      <text
        x={node.x}
        y={node.y + 90}
        textAnchor="middle"
        fill={labelColor}
        fontSize={13}
        fontFamily={notoSans}
      >
        {node.label}
      </text>
    </g>
  );
};

/** Dashed connections between adjacent process nodes */
const ProcessConnections: React.FC<{
  frame: number;
  illuminated: boolean;
}> = ({ frame, illuminated }) => {
  // Animated dash offset for flowing effect
  const dashOffset = (frame * 0.8) % 14;

  const strokeColor = illuminated ? COLORS.primary : COLORS.connectionGray;
  const opacity = illuminated ? 0.8 : 0.6;

  return (
    <g stroke={strokeColor} strokeWidth={2.5} fill="none" opacity={opacity}>
      {PROCESS_NODES.slice(0, -1).map((node, i) => {
        const next = PROCESS_NODES[i + 1];
        return (
          <line
            key={i}
            x1={node.x + node.r + 5}
            y1={node.y}
            x2={next.x - next.r - 5}
            y2={next.y}
            strokeDasharray="8,6"
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </g>
  );
};

/** AI core node with pulsing rings */
const AINode: React.FC<{
  frame: number;
  fps: number;
  scaleProgress: number;
  labelOpacity: number;
}> = ({ frame, fps, scaleProgress, labelOpacity }) => {
  // Pulsing rings (continuous once AI appears)
  const ringFrameBase = Math.max(0, frame - PHASE.aiBirthStart - 50);

  return (
    <g>
      {/* Pulsing rings */}
      {[0, 1, 2].map((ringIndex) => {
        const ringPeriod = 60; // 2 seconds per cycle
        const ringDelay = ringIndex * 12; // stagger
        const ringFrame = Math.max(0, ringFrameBase - ringDelay);
        const cycleFrame = ringFrame % ringPeriod;
        const ringScale = interpolate(cycleFrame, [0, ringPeriod], [1, 1.8]);
        const ringOpacity = interpolate(cycleFrame, [0, ringPeriod * 0.1, ringPeriod], [0, 0.5, 0]);
        const baseR = AI_NODE.r + 10 + ringIndex * 12;

        return ringFrameBase > ringDelay ? (
          <circle
            key={`ring-${ringIndex}`}
            cx={AI_NODE.x}
            cy={AI_NODE.y}
            r={baseR * ringScale}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={ringIndex === 0 ? 2 : 1}
            opacity={ringOpacity * scaleProgress}
          />
        ) : null;
      })}

      {/* Main AI circle with glow */}
      <defs>
        <radialGradient id="ai-gradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor={COLORS.gold.warm} />
          <stop offset="100%" stopColor={COLORS.gold.mid} />
        </radialGradient>
        <filter id="ai-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 0.7 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={AI_NODE.x}
        cy={AI_NODE.y}
        r={AI_NODE.r}
        fill="url(#ai-gradient)"
        filter="url(#ai-glow)"
        style={{
          transform: `scale(${scaleProgress})`,
          transformOrigin: `${AI_NODE.x}px ${AI_NODE.y}px`,
        }}
      />

      {/* IA text */}
      <text
        x={AI_NODE.x}
        y={AI_NODE.y + 12}
        textAnchor="middle"
        fill={COLORS.dark}
        fontSize={36}
        fontWeight="bold"
        fontFamily={spaceGrotesk}
        opacity={scaleProgress}
      >
        IA
      </text>

      {/* CORE ENGINE label */}
      <text
        x={AI_NODE.x}
        y={AI_NODE.y - AI_NODE.r - 25}
        textAnchor="middle"
        fill={COLORS.primary}
        fontSize={14}
        fontWeight={600}
        fontFamily={spaceGrotesk}
        letterSpacing={3}
        opacity={labelOpacity}
      >
        CORE ENGINE
      </text>
    </g>
  );
};

/** Animated path drawing with stroke-dashoffset */
const AnimatedPath: React.FC<{
  d: string;
  drawProgress: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  id?: string;
}> = ({
  d,
  drawProgress,
  stroke = COLORS.primary,
  strokeWidth = 2.5,
  opacity = 1,
  id,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, drawProgress));

  // Use evolvePath for stroke drawing effect
  const evolved = evolvePath(clampedProgress, d);

  return (
    <path
      id={id}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={evolved.strokeDasharray}
      strokeDashoffset={evolved.strokeDashoffset}
      opacity={opacity * clampedProgress}
    />
  );
};

/** Particles flowing along a path */
const FlowingParticles: React.FC<{
  pathD: string;
  frame: number;
  active: boolean;
  particleCount?: number;
}> = ({ pathD, frame, active, particleCount = 3 }) => {
  if (!active) return null;

  const pathLength = getLength(pathD);
  const particles: React.ReactNode[] = [];
  const radii = [4, 3, 2.5];
  const colors = [COLORS.gold.mid, COLORS.gold.warm, COLORS.gold.light];

  for (let i = 0; i < particleCount; i++) {
    const speed = 0.012 + i * 0.002;
    const offset = i * 0.33;
    const t = ((frame * speed + offset) % 1);
    const pos = getPointAtLength(pathD, t * pathLength);

    particles.push(
      <circle
        key={i}
        cx={pos.x}
        cy={pos.y}
        r={radii[i % radii.length]}
        fill={colors[i % colors.length]}
        opacity={0.85}
      />
    );
  }

  return <g>{particles}</g>;
};

/** Capability orb node */
const CapabilityOrb: React.FC<{
  node: (typeof CAPABILITY_NODES)[number];
  scaleProgress: number;
  index: number;
}> = ({ node, scaleProgress, index }) => {
  const capGradId = `cap-grad-${index}`;

  return (
    <g>
      <defs>
        <radialGradient id={capGradId} cx="30%" cy="30%">
          <stop offset="0%" stopColor={COLORS.gold.warm} />
          <stop offset="100%" stopColor={COLORS.gold.deep} />
        </radialGradient>
        <filter id={`cap-glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 0.7 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={`url(#${capGradId})`}
        filter={`url(#cap-glow-${index})`}
        style={{
          transform: `scale(${scaleProgress})`,
          transformOrigin: `${node.x}px ${node.y}px`,
        }}
      />

      {/* Highlight */}
      <ellipse
        cx={node.x - 10}
        cy={node.y - 18}
        rx={20}
        ry={12}
        fill="white"
        opacity={0.15 * scaleProgress}
      />

      <text
        x={node.x}
        y={node.y + 5}
        textAnchor="middle"
        fill={COLORS.dark}
        fontSize={node.name === "Optimizacion" ? 14 : 15}
        fontWeight={600}
        fontFamily={spaceGrotesk}
        opacity={scaleProgress}
      >
        {node.name}
      </text>

      <text
        x={node.x}
        y={node.y + node.r + 22}
        textAnchor="middle"
        fill={COLORS.primary}
        fontSize={12}
        fontFamily={notoSans}
        opacity={scaleProgress}
      >
        {node.label}
      </text>
    </g>
  );
};

// ─── Main Composition ────────────────────────────────────────────────────────

export const Idea1VideoLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase 2: AI Birth ─────────────────────────────────────────────────────
  // Atmospheric glow fade-in
  const atmosphereOpacity = interpolate(
    frame,
    [PHASE.aiBirthStart, PHASE.aiBirthStart + 36],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // AI core scale with spring (elastic bounce)
  const aiScaleSpring = spring({
    frame: frame - PHASE.aiBirthStart - 15,
    fps,
    config: {
      damping: 8,
      stiffness: 80,
      mass: 1,
    },
  });

  // AI label fade in
  const aiLabelOpacity = interpolate(
    frame,
    [PHASE.aiBirthStart + 40, PHASE.aiBirthStart + 65],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Phase 3: Connection Drawing ───────────────────────────────────────────
  const aiConnectionPaths = PROCESS_NODES.map((node) =>
    aiToNodePath(AI_NODE, node)
  );

  const connectionDrawProgress = PROCESS_NODES.map((_, i) => {
    const staggerDelay = i * 7;
    const drawDuration = 40;
    const startFrame = PHASE.connectionsStart + staggerDelay;
    return interpolate(
      frame,
      [startFrame, startFrame + drawDuration],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  });

  // Particles active after connections are drawn
  const particlesActive = frame > PHASE.connectionsEnd - 15;

  // ── Phase 4: Illumination ─────────────────────────────────────────────────
  const illuminationProgress = PROCESS_NODES.map((_, i) => {
    const staggerDelay = i * 15;
    const startFrame = PHASE.illuminationStart + staggerDelay;
    const s = spring({
      frame: frame - startFrame,
      fps,
      config: {
        damping: 200,
        stiffness: 100,
        mass: 1,
      },
    });
    return frame >= startFrame ? s : 0;
  });

  // Connections between process nodes turn golden
  const connectionsIlluminated = frame > PHASE.illuminationStart + 45;

  // ── Phase 5: Capabilities ─────────────────────────────────────────────────
  const capConnectionPaths = CAPABILITY_NODES.map((cap) =>
    aiToCapPath(AI_NODE, cap)
  );

  const capConnectionDraw = CAPABILITY_NODES.map((_, i) => {
    const staggerDelay = i * 10;
    const drawDuration = 35;
    const startFrame = PHASE.capabilitiesStart + staggerDelay;
    return interpolate(
      frame,
      [startFrame, startFrame + drawDuration],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  });

  const capScaleProgress = CAPABILITY_NODES.map((_, i) => {
    const staggerDelay = i * 10 + 15;
    const startFrame = PHASE.capabilitiesStart + staggerDelay;
    return spring({
      frame: frame - startFrame,
      fps,
      config: {
        damping: 8,
        stiffness: 80,
        mass: 1,
      },
    });
  });

  // Cap particles
  const capParticlesActive = frame > PHASE.capabilitiesStart + 60;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ─── Layer 1: Dot Grid Background ──────────────────────────── */}
        <DotGrid />

        {/* ─── Layer 1b: Atmospheric Glow ─────────────────────────────── */}
        <ellipse
          cx={AI_NODE.x}
          cy={AI_NODE.y - 30}
          rx={350}
          ry={260}
          fill="url(#atmo-glow)"
          opacity={atmosphereOpacity}
        />
        <defs>
          <radialGradient id="atmo-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.2} />
            <stop offset="40%" stopColor={COLORS.primary} stopOpacity={0.08} />
            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* ─── Layer 2: Process Connections (dashed lines) ────────────── */}
        <ProcessConnections frame={frame} illuminated={connectionsIlluminated} />

        {/* ─── Layer 3: AI Connection Paths ───────────────────────────── */}
        {aiConnectionPaths.map((pathD, i) => (
          <AnimatedPath
            key={`ai-conn-${i}`}
            d={pathD}
            drawProgress={connectionDrawProgress[i]}
          />
        ))}

        {/* ─── Layer 3b: Data Particles on AI Connections ─────────────── */}
        {aiConnectionPaths.map((pathD, i) => (
          <FlowingParticles
            key={`particles-${i}`}
            pathD={pathD}
            frame={frame}
            active={particlesActive && connectionDrawProgress[i] >= 0.9}
          />
        ))}

        {/* ─── Layer 4: Process Orb Nodes ─────────────────────────────── */}
        {PROCESS_NODES.map((node, i) => (
          <CrystallineOrb
            key={node.name}
            node={node}
            illuminationProgress={illuminationProgress[i]}
            index={i}
          />
        ))}

        {/* ─── Layer 5: AI Node ───────────────────────────────────────── */}
        {frame >= PHASE.aiBirthStart && (
          <AINode
            frame={frame}
            fps={fps}
            scaleProgress={aiScaleSpring}
            labelOpacity={aiLabelOpacity}
          />
        )}

        {/* ─── Layer 6: Capability Connection Paths ───────────────────── */}
        {capConnectionPaths.map((pathD, i) => (
          <AnimatedPath
            key={`cap-conn-${i}`}
            d={pathD}
            drawProgress={capConnectionDraw[i]}
            strokeWidth={2}
          />
        ))}

        {/* ─── Layer 6b: Capability Particles ─────────────────────────── */}
        {capConnectionPaths.map((pathD, i) => (
          <FlowingParticles
            key={`cap-particles-${i}`}
            pathD={pathD}
            frame={frame}
            active={capParticlesActive && capConnectionDraw[i] >= 0.9}
          />
        ))}

        {/* ─── Layer 7: Capability Nodes ──────────────────────────────── */}
        {CAPABILITY_NODES.map((node, i) => (
          <CapabilityOrb
            key={node.name}
            node={node}
            scaleProgress={capScaleProgress[i]}
            index={i}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
