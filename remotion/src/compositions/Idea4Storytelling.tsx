import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Sequence,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSans";

// ── Fonts ──────────────────────────────────────────────────────────────────────
const { fontFamily: spaceGrotesk } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
});
const { fontFamily: notoSans } = loadNoto("normal", {
  weights: ["400", "500"],
});

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  primary: "#ffb200",
  primaryLight: "#ffe066",
  primaryDark: "#996b00",
  bg: "#0A0A0B",
  surface: "#18181B",
  surfaceLight: "#222225",
  inactive: "#666666",
  inactiveDim: "#3A3A40",
  inactiveMid: "#9A9AA0",
  textMuted: "#A1A1AA",
  textLabel: "#71717A",
  textBright: "#FAFAFA",
  white: "#FFFFFF",
  // Capability accent colors
  cyan: "#06b6d4",
  cyanLight: "#67e8f9",
  cyanDark: "#0891b2",
  emerald: "#10b981",
  emeraldLight: "#6ee7b7",
  emeraldDark: "#059669",
  violet: "#8b5cf6",
  violetLight: "#c4b5fd",
  violetDark: "#7c3aed",
};

// ── Layout Constants ───────────────────────────────────────────────────────────
const W = 1920;
const H = 800;
const AI_CENTER = { x: 960, y: 350 };
const AI_ORB_EDGE = 56; // AI orb radius (52) + margin (4)

/** Calculate point on AI orb edge toward a target */
const aiEdgePoint = (targetX: number, targetY: number) => {
  const dx = targetX - AI_CENTER.x;
  const dy = targetY - AI_CENTER.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return {
    x: AI_CENTER.x + (dx / len) * AI_ORB_EDGE,
    y: AI_CENTER.y + (dy / len) * AI_ORB_EDGE,
  };
};

const PROCESS_NODES = [
  { id: "entrada", label: "Entrada", sublabel: "Recepción", x: 340, y: 270 },
  { id: "documentos", label: "Documentos", sublabel: "Gestión", x: 720, y: 190 },
  { id: "controles", label: "Controles", sublabel: "Calidad", x: 1200, y: 240 },
  { id: "metricas", label: "Métricas", sublabel: "Análisis", x: 1560, y: 430 },
];

const CAPABILITY_NODES = [
  { id: "analitica", label: "Analítica", x: 740, y: 620, icon: "chart" as const, color: C.cyan, colorLight: C.cyanLight, colorDark: C.cyanDark },
  { id: "optimizacion", label: "Optimización", x: 960, y: 660, icon: "gear" as const, color: C.emerald, colorLight: C.emeraldLight, colorDark: C.emeraldDark },
  { id: "prediccion", label: "Predicción", x: 1180, y: 620, icon: "trending" as const, color: C.violet, colorLight: C.violetLight, colorDark: C.violetDark },
];

// Node activation frames (Act 3) — spaced out for slower dramatic effect
const NODE_ACTIVATION_FRAMES = [215, 265, 310, 350];
// Capability appearance frames (Act 4)
const CAP_APPEAR_FRAMES = [380, 400, 420];

// ── Inter-node connections (sequential pairs) ──────────────────────────────────
const INTER_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
];

// ── Camera Keyframes ───────────────────────────────────────────────────────────
// Each keyframe: { frame, x, y, scale, originX, originY }
// Act 1: Camera zooms into each process node sequentially
// Act 2: Zoom out to reveal scene, AI appears
// Act 3: Subtle pans following activations
// Act 4: Settle
// Act 5: Final hold
interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  scale: number;
  originX: number;
  originY: number;
}

const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // Start: zoomed into first node "Entrada"
  { frame: 0, x: -340 + W / 2, y: -270 + H / 2, scale: 2.0, originX: 340, originY: 270 },
  // Linger on Entrada
  { frame: 28, x: -340 + W / 2, y: -270 + H / 2, scale: 2.0, originX: 340, originY: 270 },
  // Pan to Documentos
  { frame: 42, x: -720 + W / 2, y: -190 + H / 2, scale: 1.9, originX: 720, originY: 190 },
  // Linger on Documentos
  { frame: 70, x: -720 + W / 2, y: -190 + H / 2, scale: 1.9, originX: 720, originY: 190 },
  // Pan to Controles
  { frame: 84, x: -1200 + W / 2, y: -240 + H / 2, scale: 2.1, originX: 1200, originY: 240 },
  // Linger on Controles
  { frame: 110, x: -1200 + W / 2, y: -240 + H / 2, scale: 2.1, originX: 1200, originY: 240 },
  // Pan to Metricas
  { frame: 124, x: -1560 + W / 2, y: -430 + H / 2, scale: 1.85, originX: 1560, originY: 430 },
  // Linger on Metricas
  { frame: 148, x: -1560 + W / 2, y: -430 + H / 2, scale: 1.85, originX: 1560, originY: 430 },
  // Act 2: Zoom out to reveal full scene
  { frame: 178, x: 0, y: 0, scale: 1.0, originX: W / 2, originY: H / 2 },
  // Hold for AI appearance
  { frame: 200, x: 0, y: 0, scale: 1.0, originX: W / 2, originY: H / 2 },
  // Act 3: Subtle tracking toward activating nodes (wider spacing)
  { frame: 225, x: 20, y: 8, scale: 1.02, originX: 500, originY: 330 },
  { frame: 275, x: -15, y: -5, scale: 1.02, originX: 900, originY: 370 },
  { frame: 320, x: -30, y: 5, scale: 1.02, originX: 1300, originY: 320 },
  { frame: 360, x: -10, y: -8, scale: 1.01, originX: 1400, originY: 400 },
  // Act 4: Settle back to center — match idle loop scale (0.96)
  { frame: 380, x: 0, y: 0, scale: 0.96, originX: W / 2, originY: H / 2 },
  // Act 5: Final hold
  { frame: 540, x: 0, y: 0, scale: 0.96, originX: W / 2, originY: H / 2 },
  { frame: 600, x: 0, y: 0, scale: 0.96, originX: W / 2, originY: H / 2 },
];

// ── Helper: interpolate camera with spring physics ─────────────────────────────
function getCameraAt(frame: number, fps: number) {
  // Find the two keyframes we're between
  let kfBefore = CAMERA_KEYFRAMES[0];
  let kfAfter = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];

  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    if (frame >= CAMERA_KEYFRAMES[i].frame && frame <= CAMERA_KEYFRAMES[i + 1].frame) {
      kfBefore = CAMERA_KEYFRAMES[i];
      kfAfter = CAMERA_KEYFRAMES[i + 1];
      break;
    }
    if (frame < CAMERA_KEYFRAMES[i].frame) {
      kfBefore = CAMERA_KEYFRAMES[Math.max(0, i - 1)];
      kfAfter = CAMERA_KEYFRAMES[i];
      break;
    }
  }

  const duration = kfAfter.frame - kfBefore.frame;
  if (duration <= 0) return kfBefore;

  const elapsed = frame - kfBefore.frame;

  // Use spring for smooth camera motion
  const t = spring({
    frame: elapsed,
    fps,
    config: { damping: 20, stiffness: 40, mass: 1.2 },
    durationInFrames: duration,
  });

  return {
    frame,
    x: kfBefore.x + (kfAfter.x - kfBefore.x) * t,
    y: kfBefore.y + (kfAfter.y - kfBefore.y) * t,
    scale: kfBefore.scale + (kfAfter.scale - kfBefore.scale) * t,
    originX: kfBefore.originX + (kfAfter.originX - kfBefore.originX) * t,
    originY: kfBefore.originY + (kfAfter.originY - kfBefore.originY) * t,
  };
}

// ── Helper: hex color lerp ─────────────────────────────────────────────────────
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

// ── SVG Icon Components ────────────────────────────────────────────────────────
const ChartIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="13" width="4" height="8" rx="1" fill={color} opacity={0.7} />
    <rect x="10" y="8" width="4" height="13" rx="1" fill={color} opacity={0.85} />
    <rect x="17" y="3" width="4" height="18" rx="1" fill={color} />
  </svg>
);

const GearIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);

const TrendingIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline
      points="23 6 13.5 15.5 8.5 10.5 1 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="17 6 23 6 23 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ICONS: Record<string, React.FC<{ color: string; size?: number }>> = {
  chart: ChartIcon,
  gear: GearIcon,
  trending: TrendingIcon,
};

// ── Reactive Dot Grid ──────────────────────────────────────────────────────────
const DOT_SPACING = 38;
const DOT_COLS = Math.ceil(W / DOT_SPACING) + 1;
const DOT_ROWS = Math.ceil(H / DOT_SPACING) + 1;

// Pre-compute dot positions
const DOT_POSITIONS: { x: number; y: number }[] = [];
for (let row = 0; row < DOT_ROWS; row++) {
  for (let col = 0; col < DOT_COLS; col++) {
    DOT_POSITIONS.push({ x: col * DOT_SPACING, y: row * DOT_SPACING });
  }
}

const ReactiveDotGrid: React.FC<{
  frame: number;
  fps: number;
  aiVisible: boolean;
  activatedNodes: { x: number; y: number; activationFrame: number }[];
}> = ({ frame, fps, aiVisible, activatedNodes }) => {
  // Base opacity ramps up from Act 1
  const baseOpacity = interpolate(frame, [0, 30], [0.1, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // AI shockwave parameters — powerful, cinematic waves
  const aiWaveStart = 160;
  const waveSpeed = 11;
  const waveWidth = 220;

  return (
    <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
      {DOT_POSITIONS.map((dot, i) => {
        let opacity = baseOpacity;
        let dx = 0;
        let dy = 0;

        // Distance from AI center
        const distFromAI = Math.sqrt(
          (dot.x - AI_CENTER.x) ** 2 + (dot.y - AI_CENTER.y) ** 2
        );

        // AI waves (after appearance)
        if (aiVisible && frame > aiWaveStart) {
          const waveElapsed = frame - aiWaveStart;
          const angle = Math.atan2(dot.y - AI_CENTER.y, dot.x - AI_CENTER.x);

          // ── INITIAL SHOCKWAVE — the big dramatic one ──
          // Slower speed, massive width, very strong — only plays once
          const shockSpeed = 8;
          const shockWidth = 300;
          const shockFront = waveElapsed * shockSpeed;
          const shockDelta = shockFront - distFromAI;

          if (shockDelta > -shockWidth && shockDelta < shockWidth * 3) {
            const shockPhase = Math.sin((shockDelta / shockWidth) * Math.PI);
            // Almost no decay — reaches the edges of the screen at full power
            const shockDecay = Math.max(0, 1 - distFromAI / 2000);
            const shockIntensity = Math.max(0, shockPhase) * shockDecay * 1.4;

            opacity += shockIntensity;

            // Massive outward displacement
            const displacement = shockIntensity * 16;
            dx += Math.cos(angle) * displacement;
            dy += Math.sin(angle) * displacement;
          }

          // ── SECOND SHOCKWAVE — echo, slightly delayed ──
          const echo2Elapsed = Math.max(0, waveElapsed - 12);
          const echo2Front = echo2Elapsed * shockSpeed * 0.85;
          const echo2Delta = echo2Front - distFromAI;

          if (echo2Elapsed > 0 && echo2Delta > -shockWidth * 0.6 && echo2Delta < shockWidth * 2) {
            const echo2Phase = Math.sin((echo2Delta / (shockWidth * 0.8)) * Math.PI);
            const echo2Decay = Math.max(0, 1 - distFromAI / 1800);
            const echo2Intensity = Math.max(0, echo2Phase) * echo2Decay * 0.7;

            opacity += echo2Intensity;
            dx += Math.cos(angle) * echo2Intensity * 10;
            dy += Math.sin(angle) * echo2Intensity * 10;
          }

          // ── CONTINUOUS HEARTBEAT — subtler pulse that keeps going ──
          const heartbeatPeriod = 45;
          const heartbeatElapsed = (waveElapsed % heartbeatPeriod);
          const heartbeatFront = heartbeatElapsed * waveSpeed * 0.9;
          const hbDelta = heartbeatFront - distFromAI;

          if (hbDelta > -waveWidth * 0.6 && hbDelta < waveWidth * 1.2) {
            const hbPhase = Math.sin((hbDelta / (waveWidth * 0.8)) * Math.PI);
            const hbDecay = Math.max(0, 1 - distFromAI / 1100);
            const hbIntensity = Math.max(0, hbPhase) * hbDecay * 0.5;
            opacity += hbIntensity;

            dx += Math.cos(angle) * hbIntensity * 5;
            dy += Math.sin(angle) * hbIntensity * 5;
          }
        }

        // Local ripples from activated nodes
        for (const node of activatedNodes) {
          if (frame < node.activationFrame) continue;
          const nodeElapsed = frame - node.activationFrame;
          const nodeDist = Math.sqrt((dot.x - node.x) ** 2 + (dot.y - node.y) ** 2);
          const nodeFront = nodeElapsed * waveSpeed * 0.7;
          const nodeDelta = nodeFront - nodeDist;

          if (nodeDelta > -80 && nodeDelta < 160) {
            const nodePhase = Math.sin((nodeDelta / 100) * Math.PI);
            const nodeDecay = Math.max(0, 1 - nodeDist / 500);
            const nodeIntensity = Math.max(0, nodePhase) * nodeDecay * 0.4;
            opacity += nodeIntensity;

            // Node ripples also displace
            const nAngle = Math.atan2(dot.y - node.y, dot.x - node.x);
            dx += Math.cos(nAngle) * nodeIntensity * 4;
            dy += Math.sin(nAngle) * nodeIntensity * 4;
          }
        }

        // Proximity glow: dots near golden elements are brighter
        if (aiVisible) {
          const proximityBright = Math.max(0, 1 - distFromAI / 400) * 0.3;
          opacity += proximityBright;
        }

        for (const node of activatedNodes) {
          if (frame < node.activationFrame + 20) continue;
          const nd = Math.sqrt((dot.x - node.x) ** 2 + (dot.y - node.y) ** 2);
          const nodeBright = Math.max(0, 1 - nd / 220) * 0.15;
          opacity += nodeBright;
        }

        opacity = Math.min(opacity, 0.95);

        // Dots grow slightly when hit by waves
        const sizeBoost = Math.min(opacity * 1.5, 1.2);
        const dotR = 1.8 + sizeBoost;

        return (
          <circle
            key={i}
            cx={dot.x + dx}
            cy={dot.y + dy}
            r={dotR}
            fill={C.primary}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

// ── Hexagonal Tech Panel (Process Node) ────────────────────────────────────────
const HexPanel: React.FC<{
  x: number;
  y: number;
  label: string;
  sublabel: string;
  activationProgress: number;
  entranceProgress: number;
  frame: number;
}> = ({ x, y, label, sublabel, activationProgress, entranceProgress, frame }) => {
  const panelW = 150;
  const panelH = 80;

  // Dormant pulse: breathing when inactive
  const dormantPulse =
    activationProgress < 0.1
      ? 0.08 * Math.sin(frame * 0.06 + x * 0.01)
      : 0;

  // Color transitions
  const borderColor = lerpColor(C.inactive, C.primary, activationProgress);
  const bgColor = lerpColor(C.inactiveDim, C.surface, activationProgress);
  const textColor = lerpColor(C.inactiveMid, C.textBright, activationProgress);
  const sublabelColor = lerpColor(C.inactiveDim, C.textLabel, activationProgress);

  const borderOpacity = 0.5 + activationProgress * 0.5;
  const glowIntensity = activationProgress;
  const innerRadiance = activationProgress;

  // Scale bounce on activation
  const scaleBase = 0.85 + entranceProgress * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        left: x - panelW / 2,
        top: y - panelH / 2,
        width: panelW,
        height: panelH,
        opacity: entranceProgress,
        transform: `scale(${scaleBase})`,
        zIndex: 10,
      }}
    >
      {/* Glow layer underneath */}
      <div
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: 18,
          background: `radial-gradient(ellipse, ${C.primary}${Math.round(glowIntensity * 40).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          opacity: glowIntensity,
          filter: `blur(8px)`,
        }}
      />

      {/* Glass panel body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${bgColor}ee, ${bgColor}cc)`,
          border: `1.5px solid ${borderColor}`,
          borderTopColor: lerpColor(C.inactive, C.primaryLight, activationProgress * 0.6),
          opacity: borderOpacity + dormantPulse,
          backdropFilter: "blur(12px)",
          boxShadow: glowIntensity > 0.01
            ? `0 0 ${24 * glowIntensity}px ${C.primary}${Math.round(glowIntensity * 60).toString(16).padStart(2, "0")}, inset 0 1px 0 ${C.primaryLight}${Math.round(innerRadiance * 30).toString(16).padStart(2, "0")}`
            : `0 2px 8px rgba(0,0,0,0.4)`,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {/* Label */}
        <span
          style={{
            fontFamily: spaceGrotesk,
            fontSize: 15,
            fontWeight: 600,
            color: textColor,
            letterSpacing: 0.8,
          }}
        >
          {label}
        </span>
        {/* Sublabel */}
        <span
          style={{
            fontFamily: notoSans,
            fontSize: 10,
            fontWeight: 400,
            color: sublabelColor,
            letterSpacing: 1.5,
            textTransform: "uppercase" as const,
          }}
        >
          {sublabel}
        </span>
      </div>

      {/* Active indicator dot at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: activationProgress > 0.5 ? C.primary : C.inactive,
          opacity: 0.3 + activationProgress * 0.7,
          boxShadow: activationProgress > 0.5 ? `0 0 8px ${C.primary}` : "none",
        }}
      />
    </div>
  );
};

// ── Burst Particles (on node activation) ───────────────────────────────────────
const BurstParticles: React.FC<{
  cx: number;
  cy: number;
  startFrame: number;
  count?: number;
}> = ({ cx, cy, startFrame, count = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > startFrame + 40) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i * 0.3);
        const distance = 50 + (i % 3) * 20;
        const elapsed = Math.max(0, frame - startFrame - i * 0.8);

        const prog = spring({
          frame: elapsed,
          fps,
          config: { damping: 25, stiffness: 60, mass: 0.4 },
        });

        const px = cx + Math.cos(angle) * distance * prog;
        const py = cy + Math.sin(angle) * distance * prog;
        const size = 2 + (i % 3);

        const opacity = interpolate(prog, [0, 0.2, 0.8, 1], [0, 0.9, 0.4, 0], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: C.primary,
              opacity,
              boxShadow: `0 0 ${size * 3}px ${C.primary}`,
            }}
          />
        );
      })}
    </>
  );
};

// ── Concentric Ring ────────────────────────────────────────────────────────────
const ConcentricRing: React.FC<{
  cx: number;
  cy: number;
  delay: number;
  maxRadius: number;
}> = ({ cx, cy, delay, maxRadius }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - delay);

  const progress = spring({
    frame: elapsed,
    fps,
    config: { damping: 28, stiffness: 18, mass: 1.2 },
  });

  const radius = maxRadius * progress;
  const opacity = interpolate(progress, [0, 0.15, 0.6, 1], [0, 0.5, 0.2, 0], {
    extrapolateRight: "clamp",
  });

  if (opacity < 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - radius,
        top: cy - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `1px solid ${C.primary}`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Data Flow Particle ─────────────────────────────────────────────────────────
const DataFlowParticle: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startFrame: number;
  cycleDuration: number;
  offset: number;
  size?: number;
  particleColor?: string;
  glowColor?: string;
}> = ({ fromX, fromY, toX, toY, startFrame, cycleDuration, offset, size = 3.5, particleColor = C.primaryLight, glowColor = C.primary }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame) return null;

  const elapsed = frame - startFrame;
  const t = ((elapsed + offset) % cycleDuration) / cycleDuration;

  const px = fromX + (toX - fromX) * t;
  const py = fromY + (toY - fromY) * t;

  const opacity = interpolate(t, [0, 0.08, 0.85, 1], [0, 0.85, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  // Slight trail effect: render a faint smaller dot behind
  const trailT = Math.max(0, t - 0.04);
  const trailX = fromX + (toX - fromX) * trailT;
  const trailY = fromY + (toY - fromY) * trailT;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: trailX - size * 0.4,
          top: trailY - size * 0.4,
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: "50%",
          background: particleColor,
          opacity: opacity * 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: px - size / 2,
          top: py - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: particleColor,
          opacity,
          boxShadow: `0 0 ${size * 2}px ${glowColor}`,
        }}
      />
    </>
  );
};

// ── Typewriter Text ────────────────────────────────────────────────────────────
const TypewriterText: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
}> = ({
  text,
  startFrame,
  charsPerFrame = 0.5,
  fontSize = 22,
  color = C.textMuted,
  fontWeight = 400,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const visibleChars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const displayText = text.slice(0, visibleChars);

  const cursorVisible = visibleChars < text.length;
  const cursorBlink = cursorVisible ? (Math.floor(elapsed / 8) % 2 === 0 ? 1 : 0) : 0;

  const fadeIn = interpolate(elapsed, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: notoSans,
        fontSize,
        fontWeight,
        color,
        opacity: fadeIn,
        letterSpacing: 1.2,
        zIndex: 100,
      }}
    >
      {displayText}
      <span style={{ opacity: cursorBlink, color: C.primary }}>|</span>
    </div>
  );
};

// ── AI Core Node ───────────────────────────────────────────────────────────────
const AICore: React.FC<{
  frame: number;
  fps: number;
  entranceProgress: number;
  showFullLabel?: boolean;
}> = ({ frame, fps, entranceProgress, showFullLabel }) => {
  if (entranceProgress < 0.01) return null;

  const radius = 52;

  // Pulsing glow
  const pulsePhase = (frame - 160) * 0.08;
  const pulse = 0.6 + Math.sin(pulsePhase) * 0.2;

  // "IA" text typewriter (or full label in idle mode)
  const iaText = showFullLabel ? "IA" : "IA".slice(0, Math.max(0, frame - 170) > 10 ? 2 : Math.max(0, frame - 170) > 4 ? 1 : 0);

  return (
    <>
      {/* Atmospheric golden light — sunrise effect */}
      <div
        style={{
          position: "absolute",
          left: AI_CENTER.x - 300,
          top: AI_CENTER.y - 300,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.primary}30 0%, ${C.primary}12 30%, ${C.primary}05 60%, transparent 80%)`,
          opacity: entranceProgress * pulse,
          transform: `scale(${entranceProgress})`,
          pointerEvents: "none",
        }}
      />

      {/* Concentric rings */}
      {[0, 8, 16, 26, 38].map((delay, i) => (
        <ConcentricRing
          key={`ring-${i}`}
          cx={AI_CENTER.x}
          cy={AI_CENTER.y}
          delay={158 + delay}
          maxRadius={70 + i * 35}
        />
      ))}

      {/* Core body — outer ring */}
      <div
        style={{
          position: "absolute",
          left: AI_CENTER.x - radius - 4,
          top: AI_CENTER.y - radius - 4,
          width: (radius + 4) * 2,
          height: (radius + 4) * 2,
          borderRadius: "50%",
          border: `2px solid ${C.primary}50`,
          opacity: entranceProgress,
          transform: `scale(${entranceProgress})`,
          boxShadow: `0 0 50px ${C.primary}40, 0 0 100px ${C.primary}15`,
        }}
      />

      {/* Core body — main circle */}
      <div
        style={{
          position: "absolute",
          left: AI_CENTER.x - radius,
          top: AI_CENTER.y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 35%, ${C.primaryLight}, ${C.primary} 60%, ${C.primaryDark} 100%)`,
          border: `2.5px solid ${C.primaryLight}`,
          transform: `scale(${entranceProgress})`,
          boxShadow: `0 0 40px ${C.primary}88, 0 0 80px ${C.primary}44, inset 0 -8px 20px ${C.primaryDark}80`,
        }}
      />

      {/* "IA" text */}
      <div
        style={{
          position: "absolute",
          left: AI_CENTER.x - 30,
          top: AI_CENTER.y - 16,
          width: 60,
          textAlign: "center",
          fontFamily: spaceGrotesk,
          fontSize: 28,
          fontWeight: 700,
          color: C.bg,
          opacity: entranceProgress,
          transform: `scale(${entranceProgress})`,
          letterSpacing: 2,
        }}
      >
        {iaText}
      </div>

    </>
  );
};

// ── Micro-Animation: Analytics Bar Chart ─────────────────────────────────────
const AnalyticsBars: React.FC<{ progress: number; frame: number; color: string; colorLight: string; colorDark: string }> = ({ progress, frame, color, colorLight, colorDark }) => {
  const barHeights = [0.55, 0.78, 0.42, 0.91, 0.67];
  const barW = 8;
  const gap = 4;
  const chartW = barHeights.length * (barW + gap) - gap;
  const chartH = 32;

  return (
    <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
      <defs>
        <filter id="barGlow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        {barHeights.map((_, i) => (
          <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={colorDark} />
            <stop offset="100%" stopColor={colorLight} />
          </linearGradient>
        ))}
      </defs>
      {barHeights.map((h, i) => {
        const barDelay = i * 0.12;
        const barProg = Math.max(0, Math.min(1, (progress - barDelay) / (1 - barDelay)));
        const breath = barProg >= 0.99 ? Math.sin(frame * 0.07 + i * 1.2) * 0.04 : 0;
        const finalH = chartH * h * barProg * (1 + breath);
        const x = i * (barW + gap);

        return (
          <React.Fragment key={i}>
            <rect
              x={x - 1}
              y={chartH - finalH - 1}
              width={barW + 2}
              height={finalH + 2}
              rx={2}
              fill={color}
              opacity={0.15 * barProg}
              filter="url(#barGlow)"
            />
            <rect
              x={x}
              y={chartH - finalH}
              width={barW}
              height={Math.max(0, finalH)}
              rx={2}
              fill={`url(#barGrad-${i})`}
              opacity={0.6 + barProg * 0.4}
            />
          </React.Fragment>
        );
      })}
    </svg>
  );
};

// ── Micro-Animation: Optimization Gauge ──────────────────────────────────────
const OptimizationGauge: React.FC<{ progress: number; frame: number; color: string; colorLight: string; colorDark: string }> = ({ progress, frame, color, colorLight }) => {
  const gaugeR = 18;
  const gcx = 24;
  const gcy = 22;
  const startAngle = Math.PI * 0.85;
  const endAngle = Math.PI * 0.15;
  const totalSweep = startAngle - endAngle + Math.PI;

  const breath = progress >= 0.99 ? Math.sin(frame * 0.06) * 0.03 : 0;
  const needleT = Math.min(1, progress * 1.1) * 0.82 + breath;
  const needleAngle = startAngle - needleT * totalSweep;
  const needleLen = gaugeR - 4;
  const nx = gcx + Math.cos(needleAngle) * needleLen;
  const ny = gcy - Math.sin(needleAngle) * needleLen;

  const arcPoint = (t: number) => {
    const a = startAngle - t * totalSweep;
    return { x: gcx + Math.cos(a) * gaugeR, y: gcy - Math.sin(a) * gaugeR };
  };

  const arcPath = (t0: number, t1: number) => {
    const steps = 16;
    const pts: string[] = [];
    for (let s = 0; s <= steps; s++) {
      const t = t0 + (t1 - t0) * (s / steps);
      const p = arcPoint(t);
      pts.push(`${s === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const filledT = Math.min(1, progress);

  return (
    <svg width={48} height={30} viewBox="0 0 48 30">
      <path d={arcPath(0, 1)} fill="none" stroke={C.inactive} strokeWidth={3} opacity={0.3} strokeLinecap="round" />
      {filledT > 0 && (
        <path d={arcPath(0, Math.min(filledT, 0.33))} fill="none" stroke="#ef4444" strokeWidth={3} opacity={0.8} strokeLinecap="round" />
      )}
      {filledT > 0.33 && (
        <path d={arcPath(0.33, Math.min(filledT, 0.66))} fill="none" stroke="#eab308" strokeWidth={3} opacity={0.8} strokeLinecap="round" />
      )}
      {filledT > 0.66 && (
        <path d={arcPath(0.66, Math.min(filledT, 1))} fill="none" stroke="#22c55e" strokeWidth={3} opacity={0.9} strokeLinecap="round" />
      )}
      <line x1={gcx} y1={gcy} x2={nx} y2={ny} stroke={C.white} strokeWidth={1.5} strokeLinecap="round" opacity={progress} />
      <circle cx={gcx} cy={gcy} r={2.5} fill={C.white} opacity={progress} />

      {/* Value label below gauge */}
      {progress > 0.05 && (() => {
        const pct = Math.round(needleT * 100);
        const valColor = pct < 33 ? "#ef4444" : pct < 66 ? "#eab308" : "#22c55e";
        return (
          <text
            x={gcx}
            y={29}
            textAnchor="middle"
            fontSize={7}
            fontWeight={600}
            fontFamily={spaceGrotesk}
            fill={valColor}
            opacity={progress * 0.9}
          >
            {pct}%
          </text>
        );
      })()}
    </svg>
  );
};

// ── Micro-Animation: Prediction Forecast Line ────────────────────────────────
const PredictionForecast: React.FC<{ progress: number; frame: number; color: string; colorLight: string; colorDark: string }> = ({ progress, frame, color, colorLight }) => {
  const chartW = 80;
  const chartH = 30;
  const splitX = chartW * 0.55;

  const histPoints = [
    { x: 0, y: 22 },
    { x: 12, y: 18 },
    { x: 24, y: 20 },
    { x: 36, y: 14 },
    { x: splitX, y: 12 },
  ];

  const forecastPoints = [
    { x: splitX, y: 12 },
    { x: 56, y: 9 },
    { x: 68, y: 7 },
    { x: chartW, y: 4 },
  ];

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const histPath = toPath(histPoints);
  const forecastPath = toPath(forecastPoints);

  const bandWidth = 5;
  const bandUpper = forecastPoints.map(p => `${p.x} ${p.y - bandWidth}`);
  const bandLower = [...forecastPoints].reverse().map(p => `${p.x} ${p.y + bandWidth}`);
  const bandPath = `M ${bandUpper.join(" L ")} L ${bandLower.join(" L ")} Z`;

  const histDraw = Math.min(1, progress * 1.6);
  const forecastDraw = Math.max(0, (progress - 0.5) * 2);
  const endPulse = forecastDraw >= 0.99 ? 1 + Math.sin(frame * 0.1) * 0.3 : 0;

  return (
    <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
      {forecastDraw > 0.1 && (
        <path d={bandPath} fill={color} opacity={0.08 * forecastDraw} />
      )}
      <path
        d={histPath}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={200}
        strokeDashoffset={200 * (1 - histDraw)}
        opacity={0.9}
      />
      {forecastDraw > 0 && (
        <path
          d={forecastPath}
          fill="none"
          stroke={colorLight}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
          opacity={0.7 * forecastDraw}
        />
      )}
      <circle cx={splitX} cy={12} r={2.5} fill={color} opacity={histDraw > 0.9 ? 1 : 0} />
      {forecastDraw > 0.8 && (
        <>
          <circle cx={chartW} cy={4} r={2 + endPulse} fill={colorLight} opacity={0.4 * forecastDraw} />
          <circle cx={chartW} cy={4} r={2} fill={colorLight} opacity={0.9 * forecastDraw} />
        </>
      )}
      {histPoints.slice(1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={color} opacity={histDraw > (i + 1) / histPoints.length ? 0.7 : 0} />
      ))}
    </svg>
  );
};

const MICRO_ANIMATIONS: Record<string, React.FC<{ progress: number; frame: number; color: string; colorLight: string; colorDark: string }>> = {
  chart: AnalyticsBars,
  gear: OptimizationGauge,
  trending: PredictionForecast,
};

// ── Capability Burst (color shockwave on appear) ─────────────────────────────
const CapabilityBurst: React.FC<{
  cx: number;
  cy: number;
  color: string;
  colorLight: string;
  appearFrame: number;
}> = ({ cx, cy, color, colorLight, appearFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - appearFrame);
  if (elapsed <= 0 || elapsed > 80) {
    // After burst, only render the persistent aura
    if (elapsed > 80) {
      const auraPulse = 0.25 + Math.sin(frame * 0.05) * 0.06;
      return (
        <>
          {/* Inner aura */}
          <div
            style={{
              position: "absolute",
              left: cx - 100,
              top: cy - 80,
              width: 200,
              height: 160,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${color}35 0%, ${color}15 45%, transparent 75%)`,
              opacity: auraPulse,
              pointerEvents: "none",
            }}
          />
          {/* Outer soft halo */}
          <div
            style={{
              position: "absolute",
              left: cx - 140,
              top: cy - 110,
              width: 280,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${color}10 0%, transparent 65%)`,
              opacity: auraPulse * 0.6,
              pointerEvents: "none",
            }}
          />
        </>
      );
    }
    return null;
  }

  // Expanding rings (two rings for more impact)
  const ringProg = spring({
    frame: elapsed,
    fps,
    config: { damping: 20, stiffness: 45, mass: 0.6 },
  });
  const ringRadius = 20 + ringProg * 100;
  const ringOpacity = interpolate(ringProg, [0, 0.2, 0.6, 1], [0, 0.8, 0.4, 0], {
    extrapolateRight: "clamp",
  });

  const ring2Prog = spring({
    frame: Math.max(0, elapsed - 5),
    fps,
    config: { damping: 22, stiffness: 40, mass: 0.7 },
  });
  const ring2Radius = 15 + ring2Prog * 70;
  const ring2Opacity = interpolate(ring2Prog, [0, 0.2, 0.6, 1], [0, 0.6, 0.2, 0], {
    extrapolateRight: "clamp",
  });

  // Flash glow — stronger and larger
  const flashOpacity = interpolate(elapsed, [0, 4, 25], [0, 0.75, 0], {
    extrapolateRight: "clamp",
  });

  // Persistent aura (fades in and stays)
  const auraOpacity = interpolate(elapsed, [10, 40], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const auraPulse = auraOpacity + Math.sin(frame * 0.05) * 0.06;

  return (
    <>
      {/* Flash — large color burst */}
      {flashOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cx - 100,
            top: cy - 80,
            width: 200,
            height: 160,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colorLight}aa 0%, ${color}55 35%, ${color}20 60%, transparent 80%)`,
            opacity: flashOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Expanding ring 1 */}
      {ringOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cx - ringRadius,
            top: cy - ringRadius,
            width: ringRadius * 2,
            height: ringRadius * 2,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            opacity: ringOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Expanding ring 2 (delayed, smaller) */}
      {ring2Opacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cx - ring2Radius,
            top: cy - ring2Radius,
            width: ring2Radius * 2,
            height: ring2Radius * 2,
            borderRadius: "50%",
            border: `1.5px solid ${colorLight}`,
            opacity: ring2Opacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Persistent aura glow */}
      <div
        style={{
          position: "absolute",
          left: cx - 100,
          top: cy - 80,
          width: 200,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}35 0%, ${color}15 45%, transparent 75%)`,
          opacity: auraPulse,
          pointerEvents: "none",
        }}
      />
      {/* Outer soft halo */}
      <div
        style={{
          position: "absolute",
          left: cx - 140,
          top: cy - 110,
          width: 280,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}10 0%, transparent 65%)`,
          opacity: auraPulse * 0.6,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Capability Node ────────────────────────────────────────────────────────────
const CapabilityNode: React.FC<{
  x: number;
  y: number;
  label: string;
  icon: string;
  entranceProgress: number;
  frame: number;
  appearFrame: number;
  color: string;
  colorLight: string;
  colorDark: string;
}> = ({ x, y, label, icon, entranceProgress, frame, appearFrame, color, colorLight, colorDark }) => {
  if (entranceProgress < 0.01) return null;

  const panelW = 140;
  const panelH = 90;
  const MicroAnim = MICRO_ANIMATIONS[icon];

  // Internal animation: starts 10 frames after appear, ramps over 60 frames
  const internalElapsed = Math.max(0, frame - appearFrame - 10);
  const animProgress = interpolate(internalElapsed, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x - panelW / 2,
        top: y - panelH / 2,
        width: panelW,
        height: panelH,
        opacity: entranceProgress,
        transform: `scale(${entranceProgress})`,
        zIndex: 10,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 14,
          background: `radial-gradient(ellipse, ${color}30 0%, transparent 70%)`,
          filter: "blur(6px)",
        }}
      />

      {/* Panel body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          background: `linear-gradient(145deg, ${C.surface}ee, ${C.surfaceLight}dd)`,
          border: `1.5px solid ${color}`,
          borderTopColor: `${colorLight}80`,
          boxShadow: `0 0 20px ${color}30, inset 0 1px 0 ${colorLight}15`,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          padding: "6px 8px",
        }}
      >
        {/* Micro-animation (driven by internal progress, not entrance) */}
        {MicroAnim && <MicroAnim progress={animProgress} frame={frame} color={color} colorLight={colorLight} colorDark={colorDark} />}

        {/* Label */}
        <span
          style={{
            fontFamily: spaceGrotesk,
            fontSize: 11,
            fontWeight: 600,
            color,
            letterSpacing: 0.8,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// ██  MAIN COMPOSITION  ██
// ════════════════════════════════════════════════════════════════════════════════

export const Idea4Storytelling: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Camera ───────────────────────────────────────────────────────────────────
  const cam = getCameraAt(frame, fps);

  // ── Act flags ────────────────────────────────────────────────────────────────
  const aiVisible = frame >= 150;

  // ── AI entrance spring ───────────────────────────────────────────────────────
  const aiEntrance = spring({
    frame: Math.max(0, frame - 155),
    fps,
    config: { damping: 8, stiffness: 70, mass: 0.7 },
  });

  // ── Process node activation progress (slow, dramatic transition) ─────────────
  const nodeActivations = PROCESS_NODES.map((_, i) =>
    spring({
      frame: Math.max(0, frame - NODE_ACTIVATION_FRAMES[i]),
      fps,
      config: { damping: 22, stiffness: 18, mass: 1.5 },
    })
  );

  // ── Process node entrance (staggered in Act 1) ──────────────────────────────
  const nodeEntrances = PROCESS_NODES.map((_, i) =>
    spring({
      frame: Math.max(0, frame - i * 3),
      fps,
      config: { damping: 30, stiffness: 60, mass: 0.8 },
    })
  );

  // ── Capability node entrances ────────────────────────────────────────────────
  const capEntrances = CAPABILITY_NODES.map((_, i) =>
    spring({
      frame: Math.max(0, frame - CAP_APPEAR_FRAMES[i]),
      fps,
      config: { damping: 8, stiffness: 90, mass: 0.5 },
    })
  );

  // ── Activated nodes for dot grid reactions ───────────────────────────────────
  const activatedNodesList = PROCESS_NODES
    .map((node, i) => ({
      x: node.x,
      y: node.y,
      activationFrame: NODE_ACTIVATION_FRAMES[i],
    }))
    .filter((n) => frame >= n.activationFrame);

  // ── Dashed inter-node connections (all curves, avoid AI orb) ─────────────────
  const renderInterConnections = () => {
    return INTER_CONNECTIONS.map(([fromIdx, toIdx]) => {
      const from = PROCESS_NODES[fromIdx];
      const to = PROCESS_NODES[toIdx];

      const laterActivationFrame = Math.max(
        NODE_ACTIVATION_FRAMES[fromIdx],
        NODE_ACTIVATION_FRAMES[toIdx]
      );

      const activationProg = spring({
        frame: Math.max(0, frame - laterActivationFrame - 12),
        fps,
        config: { damping: 22, stiffness: 18, mass: 1.5 },
      });

      const entOpacity = interpolate(frame, [8, 25], [0, 0.35], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      const strokeColor = lerpColor(C.inactive, C.primary, activationProg);
      const lineOpacity = entOpacity + activationProg * 0.6;
      const strokeW = 1 + activationProg * 1.5;
      const dashArray = activationProg > 0.5 ? "6 4" : "4 10";

      // All connections use curves for organic feel
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const perpX = -dy / len;
      const perpY = dx / len;

      // Check proximity to AI orb
      const distToAI = Math.sqrt((mx - AI_CENTER.x) ** 2 + (my - AI_CENTER.y) ** 2);

      let curvature: number;
      if (distToAI < 150) {
        // Strong curve away from AI orb
        const sideA = { x: mx + perpX * 120, y: my + perpY * 120 };
        const distA = Math.sqrt((sideA.x - AI_CENTER.x) ** 2 + (sideA.y - AI_CENTER.y) ** 2);
        const sideB = { x: mx - perpX * 120, y: my - perpY * 120 };
        const distB = Math.sqrt((sideB.x - AI_CENTER.x) ** 2 + (sideB.y - AI_CENTER.y) ** 2);
        curvature = distA > distB ? 120 : -120;
      } else {
        // Gentle organic curve (alternate direction)
        curvature = 30 * (fromIdx % 2 === 0 ? -1 : 1);
      }

      const ctrlX = mx + perpX * curvature;
      const ctrlY = my + perpY * curvature;

      return (
        <path
          key={`inter-${fromIdx}-${toIdx}`}
          d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeDasharray={dashArray}
          opacity={lineOpacity}
          strokeLinecap="round"
        />
      );
    });
  };

  // ── AI-to-node connection paths (evolvePath line drawing) ────────────────────
  const renderAIConnections = () => {
    if (frame < 200) return null;

    return PROCESS_NODES.map((node, i) => {
      const startF = NODE_ACTIVATION_FRAMES[i];
      const elapsed = Math.max(0, frame - startF);
      const drawDuration = 35;

      const drawProgress = interpolate(elapsed, [0, drawDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });

      if (drawProgress <= 0) return null;

      // Start from the EDGE of the AI orb, not the center
      const edge = aiEdgePoint(node.x, node.y);

      // Curved path via a control point offset perpendicular to the direct line
      const dx = node.x - edge.x;
      const dy = node.y - edge.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const mx = (edge.x + node.x) / 2;
      const my = (edge.y + node.y) / 2;
      const perpX = -dy / len;
      const perpY = dx / len;
      const curvature = 25 * (i % 2 === 0 ? 1 : -1);
      const cx = mx + perpX * curvature;
      const cy = my + perpY * curvature;

      const pathD = `M ${edge.x} ${edge.y} Q ${cx} ${cy} ${node.x} ${node.y}`;
      const evolved = evolvePath(drawProgress, pathD);

      return (
        <path
          key={`ai-conn-${node.id}`}
          d={pathD}
          fill="none"
          stroke={C.primary}
          strokeWidth={2}
          strokeLinecap="round"
          style={{
            strokeDasharray: evolved.strokeDasharray,
            strokeDashoffset: evolved.strokeDashoffset,
            filter: `drop-shadow(0 0 4px ${C.primary}66)`,
          }}
        />
      );
    });
  };

  // ── AI-to-capability connection paths ────────────────────────────────────────
  const renderCapConnections = () => {
    if (frame < 360) return null;

    return CAPABILITY_NODES.map((node, i) => {
      const startF = CAP_APPEAR_FRAMES[i];
      const elapsed = Math.max(0, frame - startF);

      const drawProgress = interpolate(elapsed, [0, 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });

      if (drawProgress <= 0) return null;

      // Start from edge of AI orb
      const edge = aiEdgePoint(node.x, node.y);

      const pathD = `M ${edge.x} ${edge.y} L ${node.x} ${node.y}`;
      const evolved = evolvePath(drawProgress, pathD);

      return (
        <path
          key={`cap-conn-${node.id}`}
          d={pathD}
          fill="none"
          stroke={node.color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="5 3"
          style={{
            strokeDasharray: evolved.strokeDasharray,
            strokeDashoffset: evolved.strokeDashoffset,
            filter: `drop-shadow(0 0 3px ${node.color}44)`,
          }}
        />
      );
    });
  };

  // ── Data flow particles along AI connections ─────────────────────────────────
  const renderDataParticles = () => {
    if (frame < 220) return null;

    const particles: React.ReactNode[] = [];

    PROCESS_NODES.forEach((node, i) => {
      const startF = NODE_ACTIVATION_FRAMES[i] + 20;
      if (frame < startF) return;

      const edge = aiEdgePoint(node.x, node.y);
      for (let p = 0; p < 3; p++) {
        particles.push(
          <DataFlowParticle
            key={`dp-${node.id}-${p}`}
            fromX={edge.x}
            fromY={edge.y}
            toX={node.x}
            toY={node.y}
            startFrame={startF}
            cycleDuration={35}
            offset={p * 11}
            size={3}
          />
        );
      }
    });

    CAPABILITY_NODES.forEach((node, i) => {
      const startF = CAP_APPEAR_FRAMES[i] + 18;
      if (frame < startF) return;

      const edge = aiEdgePoint(node.x, node.y);
      for (let p = 0; p < 2; p++) {
        particles.push(
          <DataFlowParticle
            key={`cdp-${node.id}-${p}`}
            fromX={edge.x}
            fromY={edge.y}
            toX={node.x}
            toY={node.y}
            startFrame={startF}
            cycleDuration={28}
            offset={p * 14}
            size={2.5}
            particleColor={node.colorLight}
            glowColor={node.color}
          />
        );
      }
    });

    return particles;
  };

  // ── Golden atmospheric sunrise (Act 2) ───────────────────────────────────────
  const renderAtmosphere = () => {
    const atmoOpacity = interpolate(frame, [150, 180, 200], [0, 0.4, 0.2], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    if (atmoOpacity < 0.01) return null;

    return (
      <div
        style={{
          position: "absolute",
          left: AI_CENTER.x - 500,
          top: AI_CENTER.y - 400,
          width: 1000,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.primary}55 0%, ${C.primary}18 35%, transparent 70%)`,
          opacity: atmoOpacity,
          pointerEvents: "none",
        }}
      />
    );
  };

  // ── Final golden vignette (Act 5) ────────────────────────────────────────────
  const vignetteOpacity = interpolate(frame, [560, 590], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Ambient floating motes (Act 4+) ──────────────────────────────────────────
  const renderAmbientMotes = () => {
    if (frame < 340) return null;

    const moteOpacity = interpolate(frame, [340, 390], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return Array.from({ length: 16 }, (_, i) => {
      const seed = i * 137.508;
      const baseX = (seed * 7.3) % W;
      const baseY = (seed * 3.7) % H;
      const elapsed = frame - 340;
      const speed = 0.2 + (i % 4) * 0.1;

      const px = baseX + Math.sin(elapsed * speed * 0.018 + seed) * 25;
      const py = baseY + Math.cos(elapsed * speed * 0.013 + seed) * 18;
      const flicker = 0.15 + Math.sin(elapsed * 0.09 + seed) * 0.1;
      const size = 2 + (i % 3);

      return (
        <div
          key={`mote-${i}`}
          style={{
            position: "absolute",
            left: px,
            top: py,
            width: size,
            height: size,
            borderRadius: "50%",
            background: C.primaryLight,
            opacity: flicker * moteOpacity,
            boxShadow: `0 0 ${size * 2}px ${C.primary}`,
          }}
        />
      );
    });
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        overflow: "hidden",
      }}
    >
      {/* ── Camera Wrapper ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          width: W,
          height: H,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: `${cam.originX}px ${cam.originY}px`,
          willChange: "transform",
        }}
      >
        {/* Reactive dot grid */}
        <ReactiveDotGrid
          frame={frame}
          fps={fps}
          aiVisible={aiVisible}
          activatedNodes={activatedNodesList}
        />

        {/* SVG layer: inter-node dashed connections + AI connections + cap connections */}
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 5 }}
        >
          {renderInterConnections()}
          {renderAIConnections()}
          {renderCapConnections()}
        </svg>

        {/* Atmospheric sunrise glow (Act 2) */}
        {renderAtmosphere()}

        {/* Process Nodes (hex panels) */}
        {PROCESS_NODES.map((node, i) => (
          <HexPanel
            key={node.id}
            x={node.x}
            y={node.y}
            label={node.label}
            sublabel={node.sublabel}
            activationProgress={nodeActivations[i]}
            entranceProgress={nodeEntrances[i]}
            frame={frame}
          />
        ))}

        {/* Burst particles on activation */}
        {PROCESS_NODES.map((node, i) => (
          <BurstParticles
            key={`burst-${node.id}`}
            cx={node.x}
            cy={node.y}
            startFrame={NODE_ACTIVATION_FRAMES[i]}
            count={12}
          />
        ))}

        {/* AI Core Node (Act 2+) */}
        <AICore frame={frame} fps={fps} entranceProgress={aiEntrance} />

        {/* Capability Burst effects (Act 4) */}
        {CAPABILITY_NODES.map((node, i) => (
          <CapabilityBurst
            key={`burst-${node.id}`}
            cx={node.x}
            cy={node.y}
            color={node.color}
            colorLight={node.colorLight}
            appearFrame={CAP_APPEAR_FRAMES[i]}
          />
        ))}

        {/* Capability Nodes (Act 4) */}
        {CAPABILITY_NODES.map((node, i) => (
          <CapabilityNode
            key={node.id}
            x={node.x}
            y={node.y}
            label={node.label}
            icon={node.icon}
            entranceProgress={capEntrances[i]}
            frame={frame}
            appearFrame={CAP_APPEAR_FRAMES[i]}
            color={node.color}
            colorLight={node.colorLight}
            colorDark={node.colorDark}
          />
        ))}

        {/* Data flow particles */}
        {renderDataParticles()}

        {/* Ambient floating motes */}
        {renderAmbientMotes()}
      </div>

      {/* ── Golden Vignette (Act 5) ───────────────────────────────────────── */}
      {vignetteOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: `inset 0 0 140px ${C.primary}40, inset 0 0 60px ${C.primary}18`,
            opacity: vignetteOpacity,
            pointerEvents: "none",
            zIndex: 90,
          }}
        />
      )}

      {/* ── Typewriter Narrative ──────────────────────────────────────────── */}
      <Sequence from={8} durationInFrames={135}>
        <TypewriterText
          text="Procesos aislados. Potencial sin explotar."
          startFrame={8}
          charsPerFrame={0.5}
          color={C.textMuted}
          fontSize={21}
        />
      </Sequence>

      <Sequence from={155} durationInFrames={42}>
        <TypewriterText
          text="La Inteligencia Artificial despierta."
          startFrame={155}
          charsPerFrame={0.65}
          color={C.primary}
          fontSize={24}
          fontWeight={500}
        />
      </Sequence>

      <Sequence from={215} durationInFrames={160}>
        <TypewriterText
          text="Cada proceso cobra vida."
          startFrame={215}
          charsPerFrame={0.4}
          color={C.primaryLight}
          fontSize={22}
        />
      </Sequence>

      <Sequence from={550} durationInFrames={50}>
        <TypewriterText
          text="Automatización Inteligente"
          startFrame={550}
          charsPerFrame={1.2}
          color={C.white}
          fontSize={30}
          fontWeight={600}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// ██  IDLE LOOP COMPOSITION  ██
// ════════════════════════════════════════════════════════════════════════════════
// 90 frames (3 sec @ 30fps) = exactly 2 heartbeat cycles (period 45)
// Everything deployed, no narrative, seamless loop

/** Idle-mode dot grid: heartbeat only, no initial shockwave */
const IdleDotGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const baseOpacity = 0.18;
  const waveWidth = 220;
  const waveSpeed = 11;

  return (
    <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
      {DOT_POSITIONS.map((dot, i) => {
        let opacity = baseOpacity;
        let dx = 0;
        let dy = 0;

        const distFromAI = Math.sqrt(
          (dot.x - AI_CENTER.x) ** 2 + (dot.y - AI_CENTER.y) ** 2
        );
        const angle = Math.atan2(dot.y - AI_CENTER.y, dot.x - AI_CENTER.x);

        // Heartbeat pulse (looping)
        const heartbeatPeriod = 45;
        const heartbeatElapsed = frame % heartbeatPeriod;
        const heartbeatFront = heartbeatElapsed * waveSpeed * 0.9;
        const hbDelta = heartbeatFront - distFromAI;

        if (hbDelta > -waveWidth * 0.6 && hbDelta < waveWidth * 1.2) {
          const hbPhase = Math.sin((hbDelta / (waveWidth * 0.8)) * Math.PI);
          const hbDecay = Math.max(0, 1 - distFromAI / 1100);
          const hbIntensity = Math.max(0, hbPhase) * hbDecay * 0.5;
          opacity += hbIntensity;
          dx += Math.cos(angle) * hbIntensity * 5;
          dy += Math.sin(angle) * hbIntensity * 5;
        }

        // Proximity glow near AI
        const proximityBright = Math.max(0, 1 - distFromAI / 400) * 0.3;
        opacity += proximityBright;

        // Proximity glow near activated nodes
        for (const node of PROCESS_NODES) {
          const nd = Math.sqrt((dot.x - node.x) ** 2 + (dot.y - node.y) ** 2);
          const nodeBright = Math.max(0, 1 - nd / 220) * 0.15;
          opacity += nodeBright;
        }

        opacity = Math.min(opacity, 0.85);
        const sizeBoost = Math.min(opacity * 1.5, 1.2);
        const dotR = 1.8 + sizeBoost;

        return (
          <circle
            key={i}
            cx={dot.x + dx}
            cy={dot.y + dy}
            r={dotR}
            fill={C.primary}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

export const Idea4Idle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fixed camera — final position from storytelling
  const cam = { x: 0, y: 0, scale: 0.96, originX: W / 2, originY: H / 2 };

  // All inter-node connections fully golden
  const renderIdleInterConnections = () => {
    return INTER_CONNECTIONS.map(([fromIdx, toIdx]) => {
      const from = PROCESS_NODES[fromIdx];
      const to = PROCESS_NODES[toIdx];

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const perpX = -dy / len;
      const perpY = dx / len;

      const distToAI = Math.sqrt((mx - AI_CENTER.x) ** 2 + (my - AI_CENTER.y) ** 2);
      let curvature: number;
      if (distToAI < 150) {
        const sideA = { x: mx + perpX * 120, y: my + perpY * 120 };
        const distA = Math.sqrt((sideA.x - AI_CENTER.x) ** 2 + (sideA.y - AI_CENTER.y) ** 2);
        const sideB = { x: mx - perpX * 120, y: my - perpY * 120 };
        const distB = Math.sqrt((sideB.x - AI_CENTER.x) ** 2 + (sideB.y - AI_CENTER.y) ** 2);
        curvature = distA > distB ? 120 : -120;
      } else {
        curvature = 30 * (fromIdx % 2 === 0 ? -1 : 1);
      }

      return (
        <path
          key={`inter-${fromIdx}-${toIdx}`}
          d={`M ${from.x} ${from.y} Q ${mx + perpX * curvature} ${my + perpY * curvature} ${to.x} ${to.y}`}
          fill="none"
          stroke={C.primary}
          strokeWidth={2.5}
          strokeDasharray="6 4"
          opacity={0.95}
          strokeLinecap="round"
        />
      );
    });
  };

  // All AI connections fully drawn
  const renderIdleAIConnections = () => {
    return PROCESS_NODES.map((node, i) => {
      const edge = aiEdgePoint(node.x, node.y);
      const dx = node.x - edge.x;
      const dy = node.y - edge.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const mx = (edge.x + node.x) / 2;
      const my = (edge.y + node.y) / 2;
      const perpX = -dy / len;
      const perpY = dx / len;
      const curvature = 25 * (i % 2 === 0 ? 1 : -1);

      return (
        <path
          key={`ai-conn-${node.id}`}
          d={`M ${edge.x} ${edge.y} Q ${mx + perpX * curvature} ${my + perpY * curvature} ${node.x} ${node.y}`}
          fill="none"
          stroke={C.primary}
          strokeWidth={2}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${C.primary}66)` }}
        />
      );
    });
  };

  // All capability connections fully drawn
  const renderIdleCapConnections = () => {
    return CAPABILITY_NODES.map((node) => {
      const edge = aiEdgePoint(node.x, node.y);
      return (
        <path
          key={`cap-conn-${node.id}`}
          d={`M ${edge.x} ${edge.y} L ${node.x} ${node.y}`}
          fill="none"
          stroke={node.color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="5 3"
          style={{ filter: `drop-shadow(0 0 3px ${node.color}44)` }}
        />
      );
    });
  };

  // Data flow particles (continuous)
  const renderIdleParticles = () => {
    const particles: React.ReactNode[] = [];

    PROCESS_NODES.forEach((node) => {
      const edge = aiEdgePoint(node.x, node.y);
      for (let p = 0; p < 3; p++) {
        particles.push(
          <DataFlowParticle
            key={`dp-${node.id}-${p}`}
            fromX={edge.x}
            fromY={edge.y}
            toX={node.x}
            toY={node.y}
            startFrame={0}
            cycleDuration={35}
            offset={p * 11}
            size={3}
          />
        );
      }
    });

    CAPABILITY_NODES.forEach((node) => {
      const edge = aiEdgePoint(node.x, node.y);
      for (let p = 0; p < 2; p++) {
        particles.push(
          <DataFlowParticle
            key={`cdp-${node.id}-${p}`}
            fromX={edge.x}
            fromY={edge.y}
            toX={node.x}
            toY={node.y}
            startFrame={0}
            cycleDuration={28}
            offset={p * 14}
            size={2.5}
            particleColor={node.colorLight}
            glowColor={node.color}
          />
        );
      }
    });

    return particles;
  };

  // Ambient motes
  const renderIdleMotes = () => {
    return Array.from({ length: 16 }, (_, i) => {
      const seed = i * 137.508;
      const baseX = (seed * 7.3) % W;
      const baseY = (seed * 3.7) % H;
      const speed = 0.2 + (i % 4) * 0.1;
      const px = baseX + Math.sin(frame * speed * 0.018 + seed) * 25;
      const py = baseY + Math.cos(frame * speed * 0.013 + seed) * 18;
      const flicker = 0.15 + Math.sin(frame * 0.09 + seed) * 0.1;
      const size = 2 + (i % 3);

      return (
        <div
          key={`mote-${i}`}
          style={{
            position: "absolute",
            left: px,
            top: py,
            width: size,
            height: size,
            borderRadius: "50%",
            background: C.primaryLight,
            opacity: flicker,
            boxShadow: `0 0 ${size * 2}px ${C.primary}`,
          }}
        />
      );
    });
  };

  // Capability auras (persistent glow)
  const renderIdleAuras = () => {
    return CAPABILITY_NODES.map((node) => {
      const auraPulse = 0.25 + Math.sin(frame * 0.05) * 0.06;
      return (
        <React.Fragment key={`aura-${node.id}`}>
          <div
            style={{
              position: "absolute",
              left: node.x - 100,
              top: node.y - 80,
              width: 200,
              height: 160,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${node.color}35 0%, ${node.color}15 45%, transparent 75%)`,
              opacity: auraPulse,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: node.x - 140,
              top: node.y - 110,
              width: 280,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${node.color}10 0%, transparent 65%)`,
              opacity: auraPulse * 0.6,
              pointerEvents: "none",
            }}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: W,
          height: H,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: `${cam.originX}px ${cam.originY}px`,
          willChange: "transform",
        }}
      >
        {/* Dot grid with heartbeat only */}
        <IdleDotGrid frame={frame} />

        {/* SVG connections (all golden) */}
        <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, zIndex: 5 }}>
          {renderIdleInterConnections()}
          {renderIdleAIConnections()}
          {renderIdleCapConnections()}
        </svg>

        {/* Atmospheric glow */}
        <div
          style={{
            position: "absolute",
            left: AI_CENTER.x - 500,
            top: AI_CENTER.y - 400,
            width: 1000,
            height: 800,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${C.primary}55 0%, ${C.primary}18 35%, transparent 70%)`,
            opacity: 0.2,
            pointerEvents: "none",
          }}
        />

        {/* Process nodes — fully active */}
        {PROCESS_NODES.map((node) => (
          <HexPanel
            key={node.id}
            x={node.x}
            y={node.y}
            label={node.label}
            sublabel={node.sublabel}
            activationProgress={1}
            entranceProgress={1}
            frame={frame}
          />
        ))}

        {/* AI Core — fully visible */}
        <AICore frame={frame} fps={fps} entranceProgress={1} showFullLabel />

        {/* Capability auras */}
        {renderIdleAuras()}

        {/* Capability nodes — fully visible, micro-animations running */}
        {CAPABILITY_NODES.map((node) => (
          <CapabilityNode
            key={node.id}
            x={node.x}
            y={node.y}
            label={node.label}
            icon={node.icon}
            entranceProgress={1}
            frame={frame}
            appearFrame={-100}
            color={node.color}
            colorLight={node.colorLight}
            colorDark={node.colorDark}
          />
        ))}

        {/* Data flow particles */}
        {renderIdleParticles()}

        {/* Ambient motes */}
        {renderIdleMotes()}
      </div>
    </AbsoluteFill>
  );
};
