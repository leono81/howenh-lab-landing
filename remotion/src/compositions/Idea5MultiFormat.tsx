import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSans";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const idea5Schema = z.object({
  format: z.enum(["landscape", "square", "vertical"]),
});

type Idea5Props = z.infer<typeof idea5Schema>;

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const { fontFamily: spaceGrotesk } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: notoSans } = loadNoto("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  primary: "#ffb200",
  bg: "#0A0A0B",
  surface: "#18181B",
  grayLight: "#6B6B6B",
  grayMid: "#4A4A4A",
  grayDark: "#2A2A2A",
  goldLight: "#ffe066",
  goldMid: "#ffb200",
  goldDark: "#996b00",
  white: "#ffffff",
  dotGrid: "rgba(255, 178, 0, 0.12)",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NodePosition = { x: number; y: number; r: number };

type Layout = {
  nodes: {
    entrada: NodePosition;
    documentos: NodePosition;
    controles: NodePosition;
    metricas: NodePosition;
  };
  aiNode: NodePosition;
  capabilities: {
    analitica: NodePosition;
    optimizacion: NodePosition;
    prediccion: NodePosition;
  };
  title: { x: number; y: number; fontSize: number };
  subtitle: { x: number; y: number; fontSize: number };
};

// ---------------------------------------------------------------------------
// useLayout hook - adaptive positioning
// ---------------------------------------------------------------------------

function useLayout(format: Idea5Props["format"]): Layout {
  const { width, height } = useVideoConfig();

  if (format === "landscape") {
    const cx = width / 2;
    const orbR = 32;
    const capR = 24;
    const topY = height * 0.22;
    const aiY = height * 0.52;
    const botY = height * 0.82;
    const spread = width * 0.2;

    return {
      nodes: {
        entrada: { x: cx - spread * 1.5, y: topY, r: orbR },
        documentos: { x: cx - spread * 0.5, y: topY, r: orbR },
        controles: { x: cx + spread * 0.5, y: topY, r: orbR },
        metricas: { x: cx + spread * 1.5, y: topY, r: orbR },
      },
      aiNode: { x: cx, y: aiY, r: 44 },
      capabilities: {
        analitica: { x: cx - spread, y: botY, r: capR },
        optimizacion: { x: cx, y: botY, r: capR },
        prediccion: { x: cx + spread, y: botY, r: capR },
      },
      title: { x: cx, y: height * 0.08, fontSize: 28 },
      subtitle: { x: cx, y: height * 0.93, fontSize: 16 },
    };
  }

  if (format === "square") {
    const cx = width / 2;
    const orbR = 38;
    const capR = 28;
    const gapX = width * 0.22;
    const gapY = height * 0.14;
    const topCenterY = height * 0.22;

    return {
      nodes: {
        entrada: { x: cx - gapX, y: topCenterY - gapY * 0.3, r: orbR },
        documentos: { x: cx + gapX, y: topCenterY - gapY * 0.3, r: orbR },
        controles: { x: cx - gapX, y: topCenterY + gapY * 0.9, r: orbR },
        metricas: { x: cx + gapX, y: topCenterY + gapY * 0.9, r: orbR },
      },
      aiNode: { x: cx, y: height * 0.52, r: 52 },
      capabilities: {
        analitica: { x: cx - gapX * 1.1, y: height * 0.8, r: capR },
        optimizacion: { x: cx, y: height * 0.8, r: capR },
        prediccion: { x: cx + gapX * 1.1, y: height * 0.8, r: capR },
      },
      title: { x: cx, y: height * 0.06, fontSize: 36 },
      subtitle: { x: cx, y: height * 0.93, fontSize: 18 },
    };
  }

  // vertical (1080x1920)
  const cx = width / 2;
  const orbR = 36;
  const capR = 28;
  const leftX = width * 0.22;
  const rightX = width * 0.78;
  const orbSpacing = height * 0.085;
  const orbStartY = height * 0.22;
  const capStartY = height * 0.55;

  return {
    nodes: {
      entrada: { x: leftX, y: orbStartY, r: orbR },
      documentos: { x: leftX, y: orbStartY + orbSpacing, r: orbR },
      controles: { x: leftX, y: orbStartY + orbSpacing * 2, r: orbR },
      metricas: { x: leftX, y: orbStartY + orbSpacing * 3, r: orbR },
    },
    aiNode: { x: cx, y: height * 0.46, r: 56 },
    capabilities: {
      analitica: { x: rightX, y: capStartY, r: capR },
      optimizacion: { x: rightX, y: capStartY + orbSpacing, r: capR },
      prediccion: { x: rightX, y: capStartY + orbSpacing * 2, r: capR },
    },
    title: { x: cx, y: height * 0.08, fontSize: 42 },
    subtitle: { x: cx, y: height * 0.9, fontSize: 20 },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function curvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const curvature = 0.25;
  const cx = mx - dy * curvature;
  const cy = my + dx * curvature;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const DotGrid: React.FC<{ width: number; height: number; opacity: number }> = ({
  width,
  height,
  opacity,
}) => {
  const spacing = 40;
  const dots: React.ReactNode[] = [];
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      dots.push(
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={1.2}
          fill={COLORS.primary}
          opacity={opacity}
        />
      );
    }
  }
  return <>{dots}</>;
};

const Orb: React.FC<{
  x: number;
  y: number;
  r: number;
  illuminated: number; // 0-1
  scale: number;
  label: string;
  format: Idea5Props["format"];
}> = ({ x, y, r, illuminated, scale, label, format }) => {
  const grayStops = [COLORS.grayLight, COLORS.grayMid, COLORS.grayDark];
  const goldStops = [COLORS.goldLight, COLORS.goldMid, COLORS.goldDark];

  const stops = grayStops.map((gray, i) => {
    const gold = goldStops[i];
    const gR = parseInt(gray.slice(1, 3), 16);
    const gG = parseInt(gray.slice(3, 5), 16);
    const gB = parseInt(gray.slice(5, 7), 16);
    const oR = parseInt(gold.slice(1, 3), 16);
    const oG = parseInt(gold.slice(3, 5), 16);
    const oB = parseInt(gold.slice(5, 7), 16);
    const mR = Math.round(gR + (oR - gR) * illuminated);
    const mG = Math.round(gG + (oG - gG) * illuminated);
    const mB = Math.round(gB + (oB - gB) * illuminated);
    return `rgb(${mR},${mG},${mB})`;
  });

  const labelOffset = format === "vertical" ? r + 20 : r + 18;
  const fontSize = format === "landscape" ? 11 : format === "square" ? 13 : 14;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={`orb-grad-${label}`}>
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="50%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </radialGradient>
      </defs>
      {/* Outer glow when illuminated */}
      {illuminated > 0.01 && (
        <circle
          cx={0}
          cy={0}
          r={r * 1.6}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={1.5}
          opacity={illuminated * 0.3}
        />
      )}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={`url(#orb-grad-${label})`}
        stroke={
          illuminated > 0.5
            ? COLORS.primary
            : COLORS.grayMid
        }
        strokeWidth={1.5}
      />
      <text
        x={0}
        y={labelOffset}
        textAnchor="middle"
        fill={illuminated > 0.5 ? COLORS.primary : COLORS.grayLight}
        fontFamily={notoSans}
        fontSize={fontSize}
        fontWeight={500}
      >
        {label}
      </text>
    </g>
  );
};

const AINode: React.FC<{
  x: number;
  y: number;
  r: number;
  scale: number;
  ringProgress: number;
  frame: number;
  fps: number;
}> = ({ x, y, r, scale, ringProgress, frame, fps }) => {
  const pulse = Math.sin((frame / fps) * Math.PI * 2) * 0.5 + 0.5;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id="ai-grad">
          <stop offset="0%" stopColor={COLORS.goldLight} />
          <stop offset="50%" stopColor={COLORS.goldMid} />
          <stop offset="100%" stopColor={COLORS.goldDark} />
        </radialGradient>
      </defs>
      {/* Pulsing rings */}
      {[1.4, 1.8, 2.2].map((mult, i) => (
        <circle
          key={i}
          cx={0}
          cy={0}
          r={r * mult}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={1}
          opacity={
            ringProgress *
            interpolate(pulse, [0, 1], [0.08, 0.2]) *
            (1 - i * 0.25)
          }
        />
      ))}
      {/* Atmospheric glow */}
      <circle
        cx={0}
        cy={0}
        r={r * 2.5}
        fill={COLORS.primary}
        opacity={ringProgress * 0.06}
      />
      {/* Core */}
      <circle cx={0} cy={0} r={r} fill="url(#ai-grad)" />
      {/* AI label */}
      <text
        x={0}
        y={5}
        textAnchor="middle"
        fill={COLORS.bg}
        fontFamily={spaceGrotesk}
        fontSize={r * 0.6}
        fontWeight={700}
      >
        AI
      </text>
    </g>
  );
};

const ConnectionPath: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color: string;
  dashed?: boolean;
}> = ({ x1, y1, x2, y2, progress, color, dashed }) => {
  const d = curvedPath(x1, y1, x2, y2);
  const evolved = evolvePath(Math.max(0, Math.min(1, progress)), d);

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={dashed ? 1 : 1.5}
      strokeDasharray={dashed ? "4 6" : evolved.strokeDasharray}
      strokeDashoffset={dashed ? 0 : evolved.strokeDashoffset}
      opacity={dashed ? 0.25 : 0.8}
    />
  );
};

const FormatBadge: React.FC<{
  format: string;
  width: number;
  height: number;
}> = ({ format, width }) => {
  const labels: Record<string, string> = {
    landscape: "1920 x 600 - Landscape",
    square: "1080 x 1080 - Square",
    vertical: "1080 x 1920 - Vertical",
  };
  const fontSize = format === "landscape" ? 10 : 12;
  const padX = format === "landscape" ? 12 : 16;
  const padY = format === "landscape" ? 8 : 12;

  return (
    <g transform={`translate(${width - padX}, ${padY})`}>
      <rect
        x={-130}
        y={-2}
        width={126}
        height={22}
        rx={4}
        fill={COLORS.surface}
        stroke={COLORS.primary}
        strokeWidth={0.5}
        opacity={0.8}
      />
      <text
        x={-67}
        y={14}
        textAnchor="middle"
        fill={COLORS.primary}
        fontFamily={notoSans}
        fontSize={fontSize}
        fontWeight={500}
        opacity={0.9}
      >
        {labels[format] || format}
      </text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Main Composition
// ---------------------------------------------------------------------------

export const Idea5MultiFormat: React.FC<Idea5Props> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const layout = useLayout(format);

  // ------ Phase timing helpers ------

  const nodeNames = ["entrada", "documentos", "controles", "metricas"] as const;
  const capNames = ["analitica", "optimizacion", "prediccion"] as const;

  const nodeLabels: Record<string, string> = {
    entrada: "Entrada",
    documentos: "Documentos",
    controles: "Controles",
    metricas: "Metricas",
  };

  const capLabels: Record<string, string> = {
    analitica: "Analitica",
    optimizacion: "Optimizacion",
    prediccion: "Prediccion",
  };

  // Phase 1: Gray State (0-45)
  const orbAppearProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Phase 2: AI Birth (45-135)
  const aiScale = spring({
    frame: frame - 45,
    fps,
    config: { damping: 8, stiffness: 80, mass: 0.8 },
  });

  const aiGlowProgress = interpolate(frame, [45, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Phase 3: Connections (135-210) - staggered 7 frames apart
  const connectionProgresses = nodeNames.map((_, i) => {
    const startFrame = 135 + i * 7;
    return interpolate(frame, [startFrame, startFrame + 50], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
  });

  // Phase 4: Illumination (210-300) - sequential, spring
  const illuminations = nodeNames.map((_, i) => {
    const startFrame = 210 + i * 20;
    return spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 200, stiffness: 100, mass: 1 },
    });
  });

  // Phase 5: Capabilities (300-420) - elastic spring entrance
  const capScales = capNames.map((_, i) => {
    const startFrame = 300 + i * 25;
    return spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 8, stiffness: 120, mass: 0.6 },
    });
  });

  const capConnectionProgresses = capNames.map((_, i) => {
    const startFrame = 330 + i * 25;
    return interpolate(frame, [startFrame, startFrame + 45], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
  });

  // Title & subtitle fade
  const titleOpacity =
    format === "vertical"
      ? interpolate(frame, [0, 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const subtitleOpacity =
    format === "vertical"
      ? interpolate(frame, [380, 410], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Atmospheric golden glow behind everything (Phase 2+)
  const atmosphereOpacity = interpolate(frame, [45, 120], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="atmosphere-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Dot grid background */}
        <DotGrid width={width} height={height} opacity={0.12} />

        {/* Atmospheric golden glow */}
        <circle
          cx={layout.aiNode.x}
          cy={layout.aiNode.y}
          r={Math.max(width, height) * 0.4}
          fill="url(#atmosphere-glow)"
          opacity={atmosphereOpacity}
        />

        {/* Phase 1: Dashed connections between orbs */}
        {nodeNames.map((name, i) => {
          const nextName = nodeNames[(i + 1) % nodeNames.length];
          if (i >= nodeNames.length - 1) return null;
          const n1 = layout.nodes[name];
          const n2 = layout.nodes[nextName];
          return (
            <ConnectionPath
              key={`dashed-${name}`}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
              progress={1}
              color={COLORS.grayMid}
              dashed
            />
          );
        })}

        {/* Phase 3: Connection paths from AI to each orb */}
        {nodeNames.map((name, i) => {
          const node = layout.nodes[name];
          return (
            <ConnectionPath
              key={`conn-${name}`}
              x1={layout.aiNode.x}
              y1={layout.aiNode.y}
              x2={node.x}
              y2={node.y}
              progress={connectionProgresses[i]}
              color={COLORS.primary}
            />
          );
        })}

        {/* Phase 5: Connection paths from AI to capabilities */}
        {capNames.map((name, i) => {
          const cap = layout.capabilities[name];
          return (
            <ConnectionPath
              key={`cap-conn-${name}`}
              x1={layout.aiNode.x}
              y1={layout.aiNode.y}
              x2={cap.x}
              y2={cap.y}
              progress={capConnectionProgresses[i]}
              color={COLORS.primary}
            />
          );
        })}

        {/* Phase 1: Gray orbs */}
        {nodeNames.map((name, i) => {
          const node = layout.nodes[name];
          return (
            <Orb
              key={name}
              x={node.x}
              y={node.y}
              r={node.r}
              illuminated={illuminations[i]}
              scale={orbAppearProgress}
              label={nodeLabels[name]}
              format={format}
            />
          );
        })}

        {/* Phase 2: AI Node */}
        <AINode
          x={layout.aiNode.x}
          y={layout.aiNode.y}
          r={layout.aiNode.r}
          scale={Math.max(0, aiScale)}
          ringProgress={aiGlowProgress}
          frame={frame}
          fps={fps}
        />

        {/* Phase 5: Capability orbs */}
        {capNames.map((name, i) => {
          const cap = layout.capabilities[name];
          return (
            <Orb
              key={`cap-${name}`}
              x={cap.x}
              y={cap.y}
              r={cap.r}
              illuminated={capScales[i] > 0.5 ? 1 : 0}
              scale={Math.max(0, capScales[i])}
              label={capLabels[name]}
              format={format}
            />
          );
        })}

        {/* Title (vertical format) */}
        {format === "vertical" && (
          <text
            x={layout.title.x}
            y={layout.title.y}
            textAnchor="middle"
            fill={COLORS.primary}
            fontFamily={spaceGrotesk}
            fontSize={layout.title.fontSize}
            fontWeight={700}
            opacity={titleOpacity}
          >
            {"Automatizacion Inteligente"}
          </text>
        )}

        {/* Subtitle (vertical format) */}
        {format === "vertical" && (
          <text
            x={layout.subtitle.x}
            y={layout.subtitle.y}
            textAnchor="middle"
            fill={COLORS.white}
            fontFamily={notoSans}
            fontSize={layout.subtitle.fontSize}
            fontWeight={400}
            opacity={subtitleOpacity}
          >
            {"Flujos de trabajo potenciados por IA"}
          </text>
        )}

        {/* Format badge */}
        <FormatBadge format={format} width={width} height={height} />
      </svg>
    </AbsoluteFill>
  );
};
