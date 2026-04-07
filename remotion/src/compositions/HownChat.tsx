import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSans";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
});

// ── Design Tokens ─────────────────────────────────────────────────────────────
const TG = {
  bg: "#0E1621",
  header: "#17212B",
  bubbleIn: "#182533",
  bubbleOut: "#2B5278",
  buttonBg: "#2B5278",
  buttonBgHover: "#3A6A9B",
  inputBar: "#17212B",
  textWhite: "#FFFFFF",
  textGray: "#8696A7",
  textTime: "#6D7F8F",
  textLink: "#6AB2F2",
  primary: "#ffb200",
  green: "#34D399",
  separator: "rgba(255,255,255,0.06)",
};

const H = 1920;

// ── Message Types ─────────────────────────────────────────────────────────────
type MsgType =
  | { type: "user"; text: string }
  | { type: "bot"; text: string; bold?: boolean }
  | { type: "buttons"; options: string[]; selected?: number }
  | { type: "status"; text: string; icon: "loading" | "success" }
  | { type: "summary"; lines: string[] }
  | { type: "attachment"; filename: string }
  | { type: "pause"; frames: number };

// ── Conversation Script ───────────────────────────────────────────────────────
const SCRIPT: MsgType[] = [
  { type: "user", text: "/facturar" },
  { type: "bot", text: "¿Qué tipo de comprobante querés emitir?\n\n🎤 O mandame un audio con los datos de la factura." },
  { type: "buttons", options: ["Factura C"], selected: 0 },
  { type: "bot", text: "Tipo: Factura C\n\n¿Quién es el receptor?" },
  { type: "buttons", options: ["Ingresar CUIT", "Consumidor Final"], selected: 1 },
  { type: "bot", text: "Receptor: Consumidor Final\n\n¿Cuál es el concepto de la factura?" },
  { type: "buttons", options: ["Productos", "Servicios", "Productos y Servicios"], selected: 1 },
  { type: "bot", text: "Ingresá la descripción del primer ítem:" },
  { type: "user", text: "Desarrollo web" },
  { type: "bot", text: "Ítem: Desarrollo web\nIngresá la cantidad:" },
  { type: "user", text: "1" },
  { type: "bot", text: "Ingresá el precio unitario:" },
  { type: "user", text: "50000" },
  { type: "bot", text: "Ítem cargado:\n  1. Desarrollo web: 1 x $50.000,00 = $50.000,00\n(final)" },
  { type: "buttons", options: ["Agregar otro", "Editar items", "Continuar"], selected: 2 },
  { type: "bot", text: "¿Querés enviar la factura por email al receptor?" },
  { type: "buttons", options: ["Enviar por email", "No, gracias"], selected: 0 },
  { type: "bot", text: "Ingresá el email del receptor:" },
  { type: "user", text: "cliente@gmail.com" },
  { type: "pause", frames: 10 },
  { type: "status", text: "Conectándose a ARCA...", icon: "loading" },
  { type: "pause", frames: 30 },
  { type: "status", text: "Conexión exitosa. Facturando...", icon: "loading" },
  { type: "pause", frames: 25 },
  {
    type: "summary",
    lines: [
      "**Resumen de factura**",
      "",
      "Tipo: Factura C",
      "Receptor: Consumidor Final",
      "Concepto: Servicios",
      "",
      "**Ítems:**",
      "  1. Desarrollo web: 1 x $50.000,00 = $50.000,00",
      "",
      "**Montos:**",
      "  Neto: $50.000,00",
      "  Total: $50.000,00",
      "",
      "Email receptor: cliente@gmail.com",
      "",
      "✅ Factura emitida — CAE: 74XXXXXXXXXX3",
    ],
  },
  { type: "attachment", filename: "factura-C-0001-00000042.pdf" },
  { type: "pause", frames: 15 },
  { type: "status", text: "Correo enviado a cliente@gmail.com", icon: "success" },
];

// ── Timing ────────────────────────────────────────────────────────────────────
const TYPING_FRAMES = 18; // typing indicator duration before bot msg
const MSG_GAP = 8; // gap between messages
const BUTTON_DELAY = 35; // delay before button "click" (~1.2s to appreciate options)
const HOLD_END = 90; // hold final state

/** Pre-calculate the start frame for each script entry */
function buildTimeline(script: MsgType[]): number[] {
  const starts: number[] = [];
  let f = 30; // start after header appears
  for (const msg of script) {
    starts.push(f);
    if (msg.type === "pause") {
      f += msg.frames;
    } else if (msg.type === "user") {
      const typingFrames = msg.text.length * 2 + 6; // 2 frames/char + send pop
      f += typingFrames + MSG_GAP;
    } else if (msg.type === "bot" || msg.type === "summary") {
      f += TYPING_FRAMES + 20 + MSG_GAP;
    } else if (msg.type === "buttons") {
      f += 15 + BUTTON_DELAY + 12 + MSG_GAP; // appear + delay + collapse + gap
    } else if (msg.type === "status") {
      f += 20 + MSG_GAP;
    } else if (msg.type === "attachment") {
      f += 25 + MSG_GAP;
    }
  }
  return starts;
}

const TIMELINE = buildTimeline(SCRIPT);
const TOTAL_FRAMES = TIMELINE[TIMELINE.length - 1] + HOLD_END + 60;

// ── Shared helpers ───────────────────────────────────────────────────────────

function scaleIn(
  frame: number,
  startFrame: number,
  config: { damping: number; stiffness: number } = { damping: 15, stiffness: 200 },
  fadeFrames = 6,
): { scale: number; opacity: number; visible: boolean } {
  const t = frame - startFrame;
  if (t < 0) return { scale: 0, opacity: 0, visible: false };
  return {
    scale: spring({ frame: t, fps: 30, config }),
    opacity: interpolate(t, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" }),
    visible: true,
  };
}

const AnimatedDots: React.FC<{
  phase: number;
  size?: number;
  color?: string;
  bounce?: boolean;
}> = ({ phase, size = 10, color = TG.textGray, bounce = false }) => (
  <div style={{ display: "flex", gap: size * 0.6 }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          ...(bounce
            ? { transform: `translateY(${Math.sin(phase * 0.25 + i * 1.2) * 3}px)` }
            : { opacity: 0.4 + 0.6 * Math.abs(Math.sin(phase + i * 1)) }),
        }}
      />
    ))}
  </div>
);

// ── Sub-components ────────────────────────────────────────────────────────────

const TypingIndicator: React.FC<{ frame: number; startFrame: number }> = ({
  frame,
  startFrame,
}) => {
  const t = frame - startFrame;
  if (t < 0 || t >= TYPING_FRAMES) return null;
  const opacity = interpolate(t, [0, 4, TYPING_FRAMES - 3, TYPING_FRAMES], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        padding: "16px 20px",
        background: TG.bubbleIn,
        borderRadius: "18px 18px 18px 4px",
        width: "fit-content",
        opacity,
        marginBottom: 8,
      }}
    >
      <AnimatedDots phase={t} bounce />
    </div>
  );
};

const FRAMES_PER_CHAR = 2;

const BubbleUser: React.FC<{ text: string; frame: number; start: number }> = ({
  text,
  frame,
  start,
}) => {
  const sendFrame = start + text.length * FRAMES_PER_CHAR + 2;
  const { scale, opacity, visible } = scaleIn(frame, sendFrame, { damping: 12, stiffness: 260 }, 4);
  if (!visible) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
      <div
        style={{
          background: TG.bubbleOut,
          color: TG.textWhite,
          padding: "12px 18px",
          borderRadius: "18px 18px 4px 18px",
          maxWidth: "75%",
          fontSize: 32,
          lineHeight: 1.4,
          fontFamily,
          fontWeight: 400,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "bottom right",
        }}
      >
        {text}
        <span
          style={{
            fontSize: 22,
            color: TG.textTime,
            marginLeft: 12,
            whiteSpace: "nowrap",
          }}
        >
          16:13 ✓✓
        </span>
      </div>
    </div>
  );
};

const BubbleBot: React.FC<{
  text: string;
  frame: number;
  start: number;
  bold?: boolean;
}> = ({ text, frame, start, bold }) => {
  const { scale, opacity, visible } = scaleIn(frame, start + TYPING_FRAMES);
  if (!visible) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
      <div
        style={{
          background: TG.bubbleIn,
          color: TG.textWhite,
          padding: "12px 18px",
          borderRadius: "18px 18px 18px 4px",
          maxWidth: "80%",
          fontSize: 32,
          lineHeight: 1.5,
          fontFamily,
          fontWeight: bold ? 600 : 400,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "bottom left",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
        <span style={{ fontSize: 22, color: TG.textTime, marginLeft: 12 }}>16:13</span>
      </div>
    </div>
  );
};

const InlineButtons: React.FC<{
  options: string[];
  selected?: number;
  frame: number;
  start: number;
}> = ({ options, selected, frame, start }) => {
  const t = frame - start;
  if (t < 0) return null;
  const clickFrame = start + BUTTON_DELAY;
  const clicked = frame >= clickFrame;
  const collapseFrames = 10;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginBottom: 12,
        marginTop: -4,
      }}
    >
      {options.map((opt, i) => {
        const btnT = t - i * 3;
        if (btnT < 0) return null;
        const opacity = interpolate(btnT, [0, 5], [0, 1], { extrapolateRight: "clamp" });
        const isSelected = clicked && i === selected;
        const isHidden = clicked && i !== selected;
        // Fully collapsed — don't render at all
        if (isHidden && frame >= clickFrame + collapseFrames) return null;
        const hideProgress = isHidden
          ? interpolate(frame - clickFrame, [0, collapseFrames], [0, 1], { extrapolateRight: "clamp" })
          : 0;
        const hideOpacity = 1 - hideProgress;
        const maxH = isHidden
          ? interpolate(hideProgress, [0, 1], [58, 0])
          : 58;
        return (
          <div
            key={i}
            style={{
              background: isSelected ? TG.primary : TG.buttonBg,
              color: isSelected ? "#0A0A0B" : TG.textWhite,
              padding: isHidden && hideProgress > 0.8 ? "0 20px" : "14px 20px",
              borderRadius: 12,
              textAlign: "center",
              fontSize: 30,
              fontFamily,
              fontWeight: isSelected ? 600 : 500,
              opacity: opacity * hideOpacity,
              maxHeight: maxH,
              overflow: "hidden",
              transform: isSelected ? "scale(1.02)" : "scale(1)",
            }}
          >
            {opt}
          </div>
        );
      })}
    </div>
  );
};

const StatusMessage: React.FC<{
  text: string;
  icon: "loading" | "success";
  frame: number;
  start: number;
}> = ({ text, icon, frame, start }) => {
  const t = frame - start;
  if (t < 0) return null;
  const opacity = interpolate(t, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const dotPhase = t * 0.15;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        background: TG.bubbleIn,
        borderRadius: "18px 18px 18px 4px",
        width: "fit-content",
        marginBottom: 8,
        opacity,
        fontFamily,
        fontSize: 30,
        color: icon === "success" ? TG.green : TG.textGray,
      }}
    >
      {icon === "loading" && (
        <AnimatedDots phase={dotPhase} size={8} color={TG.primary} />
      )}
      {icon === "success" && <span>✅</span>}
      {text}
    </div>
  );
};

const SummaryBubble: React.FC<{
  lines: string[];
  frame: number;
  start: number;
}> = ({ lines, frame, start }) => {
  const { scale, opacity, visible } = scaleIn(frame, start + TYPING_FRAMES, { damping: 15, stiffness: 180 }, 8);
  if (!visible) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
      <div
        style={{
          background: TG.bubbleIn,
          color: TG.textWhite,
          padding: "18px 22px",
          borderRadius: "18px 18px 18px 4px",
          maxWidth: "85%",
          fontSize: 28,
          lineHeight: 1.6,
          fontFamily,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "bottom left",
          whiteSpace: "pre-wrap",
        }}
      >
        {lines.map((line, i) => {
          const isBold = line.startsWith("**") && line.endsWith("**");
          const isCheck = line.startsWith("✅");
          const content = isBold ? line.slice(2, -2) : line;
          return (
            <div
              key={i}
              style={{
                fontWeight: isBold ? 700 : 400,
                color: isCheck ? TG.green : isBold ? TG.primary : TG.textWhite,
                minHeight: line === "" ? 8 : undefined,
              }}
            >
              {content}
            </div>
          );
        })}
        <div style={{ fontSize: 22, color: TG.textTime, textAlign: "right", marginTop: 6 }}>
          16:14
        </div>
      </div>
    </div>
  );
};

const AttachmentBubble: React.FC<{
  filename: string;
  frame: number;
  start: number;
}> = ({ filename, frame, start }) => {
  const { scale, opacity, visible } = scaleIn(frame, start, { damping: 14, stiffness: 200 });
  if (!visible) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
      <div
        style={{
          background: TG.bubbleIn,
          padding: "14px 18px",
          borderRadius: "18px 18px 18px 4px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "bottom left",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "rgba(255,178,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          📄
        </div>
        <div>
          <div
            style={{
              color: TG.textLink,
              fontSize: 28,
              fontFamily,
              fontWeight: 500,
            }}
          >
            {filename}
          </div>
          <div style={{ color: TG.textGray, fontSize: 22, fontFamily }}>
            PDF · 48 KB
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Height estimation per message ────────────────────────────────────────────
const CHARS_PER_LINE_BOT = 26; // ~26 chars fit per line at 32px in 80% of 1080px
const CHARS_PER_LINE_USER = 22; // ~22 chars at 32px in 75% of 1080px (+ time span)

function countVisualLines(text: string, charsPerLine: number): number {
  let total = 0;
  for (const line of text.split("\n")) {
    total += line.length === 0 ? 1 : Math.ceil(line.length / charsPerLine);
  }
  return total;
}

function estimateHeight(msg: MsgType): number {
  if (msg.type === "pause") return 0;
  if (msg.type === "user") {
    const lines = countVisualLines(msg.text, CHARS_PER_LINE_USER);
    return lines * 45 + 32 + 8;
  }
  if (msg.type === "bot") {
    const lines = countVisualLines(msg.text, CHARS_PER_LINE_BOT);
    return lines * 48 + 32 + 8;
  }
  if (msg.type === "buttons") {
    // After selection, only 1 button stays visible — use selected height
    return 58 + 16;
  }
  if (msg.type === "status") {
    return 62 + 8;
  }
  if (msg.type === "summary") {
    let lines = 0;
    for (const line of msg.lines) {
      lines += line.length === 0 ? 1 : Math.ceil(Math.max(1, line.length) / CHARS_PER_LINE_BOT);
    }
    return lines * 45 + 44 + 28 + 8;
  }
  if (msg.type === "attachment") {
    return 88 + 8;
  }
  return 0;
}

const SCROLL_BUFFER = 100; // extra buffer so the latest message is never cut
const VISIBLE_HEIGHT = H - 140 - 130 - 48; // header - input bar - padding

interface ScrollTarget {
  frame: number;
  offset: number;
}

function buildScrollTargets(): ScrollTarget[] {
  const targets: ScrollTarget[] = [{ frame: 0, offset: 0 }];
  let cumulativeHeight = 0;

  for (let i = 0; i < SCRIPT.length; i++) {
    const msg = SCRIPT[i];
    cumulativeHeight += estimateHeight(msg);
    if (msg.type === "pause") continue;

    const neededScroll = Math.max(0, cumulativeHeight - VISIBLE_HEIGHT + SCROLL_BUFFER);
    const targetFrame = TIMELINE[i] + 4;

    if (neededScroll > targets[targets.length - 1].offset && targetFrame > targets[targets.length - 1].frame) {
      targets.push({ frame: targetFrame, offset: neededScroll });
    }
  }

  return targets;
}

const SCROLL_TARGETS = buildScrollTargets();

/** Each scroll transition eases independently — like a real chat snapping to new content */
function computeScroll(frame: number): number {
  const TRANSITION = 14;
  let scroll = 0;

  for (let i = 1; i < SCROLL_TARGETS.length; i++) {
    const delta = SCROLL_TARGETS[i].offset - SCROLL_TARGETS[i - 1].offset;
    const progress = interpolate(
      frame,
      [SCROLL_TARGETS[i].frame, SCROLL_TARGETS[i].frame + TRANSITION],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      },
    );
    scroll += delta * progress;
  }

  return scroll;
}

/** Returns the text currently being typed in the input bar, or null if idle */
function getTypingText(frame: number): string | null {
  for (let i = 0; i < SCRIPT.length; i++) {
    const msg = SCRIPT[i];
    if (msg.type !== "user") continue;
    const start = TIMELINE[i];
    const typeEnd = start + msg.text.length * FRAMES_PER_CHAR;
    const sendFrame = typeEnd + 2;
    if (frame >= start && frame < sendFrame) {
      const charsTyped = Math.min(
        msg.text.length,
        Math.floor((frame - start) / FRAMES_PER_CHAR),
      );
      return msg.text.slice(0, charsTyped);
    }
  }
  return null;
}

// ── Main Composition ──────────────────────────────────────────────────────────

export const HownChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const smoothScroll = computeScroll(frame);

  return (
    <AbsoluteFill
      style={{
        background: TG.bg,
        fontFamily,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 140,
          background: TG.header,
          display: "flex",
          alignItems: "center",
          padding: "0 30px",
          gap: 20,
          zIndex: 10,
          borderBottom: `1px solid ${TG.separator}`,
        }}
      >
        {/* Back arrow */}
        <div style={{ color: TG.textGray, fontSize: 40 }}>←</div>
        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${TG.primary}, #ff8c00)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#0A0A0B">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </div>
        {/* Name + status */}
        <div>
          <div
            style={{
              color: TG.textWhite,
              fontSize: 36,
              fontWeight: 600,
              fontFamily,
            }}
          >
            Hown Facturador
          </div>
          <div
            style={{
              color: TG.textGray,
              fontSize: 26,
              fontFamily,
            }}
          >
            bot
          </div>
        </div>
      </div>

      {/* Chat body */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          bottom: 130,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 28px",
            transform: `translateY(-${smoothScroll}px)`,
          }}
        >
          {SCRIPT.map((msg, i) => {
            const start = TIMELINE[i];

            if (msg.type === "pause") return null;

            if (msg.type === "user") {
              return <BubbleUser key={i} text={msg.text} frame={frame} start={start} />;
            }

            if (msg.type === "bot") {
              return (
                <React.Fragment key={i}>
                  <TypingIndicator frame={frame} startFrame={start} />
                  <BubbleBot text={msg.text} frame={frame} start={start} bold={msg.bold} />
                </React.Fragment>
              );
            }

            if (msg.type === "buttons") {
              return (
                <InlineButtons
                  key={i}
                  options={msg.options}
                  selected={msg.selected}
                  frame={frame}
                  start={start}
                />
              );
            }

            if (msg.type === "status") {
              return (
                <StatusMessage
                  key={i}
                  text={msg.text}
                  icon={msg.icon}
                  frame={frame}
                  start={start}
                />
              );
            }

            if (msg.type === "summary") {
              return (
                <React.Fragment key={i}>
                  <TypingIndicator frame={frame} startFrame={start} />
                  <SummaryBubble lines={msg.lines} frame={frame} start={start} />
                </React.Fragment>
              );
            }

            if (msg.type === "attachment") {
              return (
                <AttachmentBubble
                  key={i}
                  filename={msg.filename}
                  frame={frame}
                  start={start}
                />
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Input bar */}
      {(() => {
        const typingText = getTypingText(frame);
        const hasText = typingText !== null && typingText.length > 0;
        return (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 130,
              background: TG.inputBar,
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              gap: 16,
              borderTop: `1px solid ${TG.separator}`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: TG.textLink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: TG.textWhite,
                fontWeight: 700,
              }}
            >
              ☰
            </div>
            <div style={{ fontSize: 28, color: TG.textGray }}>😊</div>
            <div
              style={{
                flex: 1,
                height: 56,
                borderRadius: 28,
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 24,
              }}
            >
              {hasText ? (
                <>
                  <span style={{ color: TG.textWhite, fontSize: 28, fontFamily }}>
                    {typingText}
                  </span>
                  {/* Blinking cursor */}
                  <span
                    style={{
                      color: TG.primary,
                      fontSize: 28,
                      opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                      marginLeft: 1,
                    }}
                  >
                    |
                  </span>
                </>
              ) : (
                <span style={{ color: TG.textGray, fontSize: 28, fontFamily }}>
                  Mensaje
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {!hasText && <div style={{ fontSize: 32, color: TG.textGray }}>📎</div>}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: hasText ? TG.primary : TG.textLink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {hasText ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A0A0B">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                ) : (
                  <span>🎤</span>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES };
