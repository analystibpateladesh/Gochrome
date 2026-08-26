// ─────────────────────────────────────────────────────────────
// ChatWidget.tsx
// Drop this into your GoChrome storefront (e.g. src/components/ChatWidget.tsx)
// and render it once near the root of your app, e.g. in your root layout:
//
//   import { ChatWidget } from "@/components/ChatWidget";
//   ...
//   <ChatWidget />
//
// No external UI library or Tailwind required — styles are self-contained
// so it drops into any page safely. Content lives in chatConfig.ts.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import {
  CHAT_BACKEND_URL,
  STATUS_TO_STAGE,
  STAGE_MESSAGES,
  FAQ_CONTENT,
  REFUND_URL,
  REFUND_MESSAGE,
  type StageKey,
} from "./chatConfig";

type Order = {
  orderId: string;
  status: string;
  customerName: string;
  items: string;
  total: string;
  address: string;
};

// A single "Key: Value" line inside a bot bubble — key is bold/highlighted,
// value is blue + underlined.
type KV = { key: string; value: string };

type Message = {
  id: string;
  from: "bot" | "user";
  text?: string; // plain text bubble
  kv?: KV[]; // structured key/value bubble (one pair per line)
};

type Screen = "identify" | "loading" | "menu" | "faqMenu";

let idCounter = 0;
const nextId = () => `m${idCounter++}`;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("identify");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      from: "bot",
      text: "Hi! I'm the GoChrome order assistant. To look up your order, please enter the phone number or email you used at checkout.",
    },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pulseExpanded, setPulseExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Periodically stretch the closed circle into a pill to remind
  // customers it's there, then settle back into a circle.
  useEffect(() => {
    if (open) {
      setPulseExpanded(false);
      return;
    }
    const loop = setInterval(() => {
      setPulseExpanded(true);
      const shrink = setTimeout(() => setPulseExpanded(false), 2600);
      return () => clearTimeout(shrink);
    }, 7000);
    return () => clearInterval(loop);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, screen]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { id: nextId(), from: "bot", text }]);
  }
  // Push a bot bubble made of Key: Value lines (bold key, blue underlined value)
  function pushBotKV(pairs: KV[]) {
    setMessages((m) => [...m, { id: nextId(), from: "bot", kv: pairs }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { id: nextId(), from: "user", text }]);
  }

  async function handleIdentify() {
    const query = input.trim();
    if (!query) return;
    pushUser(query);
    setInput("");
    setScreen("loading");
    setError(null);

    try {
      const res = await fetch(
        `${CHAT_BACKEND_URL}?action=lookup&query=${encodeURIComponent(query)}`,
      );
      const data = await res.json();

      if (!data.found || !data.orders?.length) {
        pushBot(
          "I couldn't find any orders with that phone number or email. Please double-check and try again, or make sure you're using the same one from checkout.",
        );
        setScreen("identify");
        return;
      }

      setOrders(data.orders);
      const name = data.orders[0].customerName || "there";
      pushBot(
        `Found it! Hi ${name}, you have ${data.orders.length} order${
          data.orders.length > 1 ? "s" : ""
        } with us. What would you like to know?`,
      );
      setScreen("menu");
    } catch (e) {
      pushBot(
        "Sorry, I'm having trouble reaching our order system right now. Please try again in a bit, or reach out to us directly.",
      );
      setScreen("identify");
    }
  }

  function stageFor(status: string): StageKey {
    return STATUS_TO_STAGE[status?.trim()] ?? "unknown";
  }

  function handleMenuSelect(option: string) {
    pushUser(option);

    if (option === "Where is my order / status") {
      orders.forEach((o) => {
        const stage = stageFor(o.status);
        const msg = STAGE_MESSAGES[stage];
        pushBot(msg.title);
        pushBotKV([
          { key: "Order ID", value: o.orderId },
          { key: "Status", value: msg.body.replace("{orderId}", o.orderId) },
        ]);
      });
      return;
    }

    if (option === "Payment status") {
      orders.forEach((o) => {
        pushBotKV([
          { key: "Order ID", value: o.orderId },
          {
            key: "Payment",
            value: o.total ? `₹${o.total} received` : "on file",
          },
        ]);
      });
      return;
    }

    if (option === "See my order details") {
      orders.forEach((o) => {
        pushBotKV([
          { key: "Order ID", value: o.orderId },
          { key: "Items", value: o.items || "item details on file" },
          { key: "Total", value: `₹${o.total}` },
          { key: "Delivery to", value: o.address },
        ]);
      });
      return;
    }

    if (option === "Something else / FAQ") {
      setScreen("faqMenu");
      return;
    }

    if (option === "Start over") {
      setOrders([]);
      setMessages([
        {
          id: nextId(),
          from: "bot",
          text: "Sure - please enter your phone number or email again.",
        },
      ]);
      setScreen("identify");
    }
  }

  function handleFaqSelect(key: string) {
    const item = FAQ_CONTENT.find((f) => f.key === key);
    if (!item) return;
    pushUser(item.label);
    pushBot(item.answer);
    setScreen("menu");
  }

  function handleRefund() {
    pushUser("Refund");
    pushBot(REFUND_MESSAGE);
    if (typeof window !== "undefined") {
      window.open(REFUND_URL, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div style={styles.root}>
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>GoChrome Support</div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} style={styles.closeBtn}>
              ✕
            </button>
          </div>

          <div style={styles.body}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  ...styles.bubbleRow,
                  justifyContent: m.from === "bot" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(m.from === "bot" ? styles.bubbleBot : styles.bubbleUser),
                    ...(m.kv ? styles.bubbleKv : null),
                  }}
                >
                  {m.kv
                    ? m.kv.map((pair, i) => (
                        <div key={i} style={styles.kvRow}>
                          <span style={styles.kvKey}>{pair.key}:</span>{" "}
                          <span style={styles.kvValue}>{pair.value}</span>
                        </div>
                      ))
                    : m.text}
                </div>
              </div>
            ))}

            {screen === "loading" && (
              <div style={styles.bubbleRow}>
                <div style={{ ...styles.bubble, ...styles.bubbleBot }}>Looking that up…</div>
              </div>
            )}

            {screen === "menu" && (
              <div style={styles.optionsWrap}>
                {[
                  "Where is my order / status",
                  "Payment status",
                  "See my order details",
                  "Something else / FAQ",
                  "Start over",
                ].map((opt) => (
                  <button key={opt} style={styles.optionBtn} onClick={() => handleMenuSelect(opt)}>
                    {opt}
                  </button>
                ))}
                <button style={styles.refundBtn} onClick={handleRefund}>
                  Need a refund?
                </button>
              </div>
            )}

            {screen === "faqMenu" && (
              <div style={styles.optionsWrap}>
                {FAQ_CONTENT.map((f) => (
                  <button
                    key={f.key}
                    style={styles.optionBtn}
                    onClick={() => handleFaqSelect(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
                <button style={styles.optionBtn} onClick={() => setScreen("menu")}>
                  ← Back
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {screen === "identify" && (
            <div style={styles.inputRow}>
              <input
                style={styles.input}
                placeholder="Phone number or email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleIdentify()}
              />
              <button style={styles.sendBtn} onClick={handleIdentify}>
                Go
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes gcFabBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.055); }
        }
        @keyframes gcFabRing {
          0% { box-shadow: 0 0 0 0 rgba(232,234,237,0.35), 0 8px 24px rgba(0,0,0,0.45); }
          70% { box-shadow: 0 0 0 10px rgba(232,234,237,0), 0 8px 24px rgba(0,0,0,0.45); }
          100% { box-shadow: 0 0 0 0 rgba(232,234,237,0), 0 8px 24px rgba(0,0,0,0.45); }
        }
        .gc-fab {
          display: flex;
          align-items: center;
          border: 2.5px solid #050608;
          background: ${CHROME};
          color: #111;
          cursor: pointer;
          overflow: hidden;
          transition: width 0.45s cubic-bezier(0.34, 1.2, 0.4, 1), padding 0.45s ease, border-radius 0.35s ease;
        }
        .gc-fab-idle {
          animation: gcFabBreathe 3.2s ease-in-out infinite, gcFabRing 3.2s ease-out infinite;
        }
        .gc-fab-label {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.25s ease 0.15s;
        }
        .gc-fab-expanded .gc-fab-label {
          opacity: 1;
        }
      `}</style>

      <button
        aria-label={open ? "Close chat" : "Ask GoChrome Assistant"}
        onClick={() => setOpen((v) => !v)}
        className={
          "gc-fab" +
          (!open && !pulseExpanded ? " gc-fab-idle" : "") +
          (!open && pulseExpanded ? " gc-fab-expanded" : "")
        }
        style={{
          height: 58,
          width: open ? 58 : pulseExpanded ? 216 : 58,
          borderRadius: open ? "50%" : pulseExpanded ? 999 : "50%",
          padding: !open && pulseExpanded ? "0 18px 0 15px" : 0,
          justifyContent: !open && pulseExpanded ? "flex-start" : "center",
          gap: 8,
        }}
      >
        {open ? (
          <CloseIcon />
        ) : (
          <>
            <AskIcon />
            {pulseExpanded && <span className="gc-fab-label">Ask GoChrome Assistant</span>}
          </>
        )}
      </button>
    </div>
  );
}

function AskIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 6L18 18M18 6L6 18" stroke="#111" strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}

// ── Styles ──────────────────────────────────────────────────
const CHROME = "linear-gradient(135deg, #e8eaed 0%, #9aa1ab 45%, #e8eaed 100%)";
const BG = "#111214";
const PANEL_BORDER = "#2a2c30";

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 9999,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  panel: {
    width: 340,
    maxWidth: "90vw",
    height: 480,
    maxHeight: "70vh",
    background: BG,
    border: `1px solid ${PANEL_BORDER}`,
    borderRadius: 16,
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  },
  header: {
    background: CHROME,
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: 700,
    color: "#111",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#111",
  },
  body: {
    flex: 1,
    padding: 14,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  bubbleRow: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    maxWidth: "82%",
    padding: "9px 12px",
    borderRadius: 12,
    fontSize: 13.5,
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
  },
  bubbleBot: {
    background: "#1d1f23",
    color: "#e9e9ea",
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    background: CHROME,
    color: "#111",
    borderTopRightRadius: 4,
  },
  // extra vertical breathing room for structured key/value bubbles
  bubbleKv: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  kvRow: {
    display: "block",
  },
  kvKey: {
    fontWeight: 800,
    color: "#f4f5f6",
  },
  kvValue: {
    color: "#ffffff",
  },
  optionsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 4,
  },
  optionBtn: {
    textAlign: "left",
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${PANEL_BORDER}`,
    background: "#17181b",
    color: "#e9e9ea",
    fontSize: 13,
    cursor: "pointer",
  },
  refundBtn: {
    textAlign: "left",
    padding: "5px 10px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#8a8d93",
    fontSize: 11,
    cursor: "pointer",
    marginTop: 6,
    textDecoration: "underline",
    alignSelf: "flex-start",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: `1px solid ${PANEL_BORDER}`,
  },
  input: {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 10,
    border: `1px solid ${PANEL_BORDER}`,
    background: "#0c0d0f",
    color: "#e9e9ea",
    fontSize: 13,
    outline: "none",
  },
  sendBtn: {
    padding: "0 16px",
    borderRadius: 10,
    border: "none",
    background: CHROME,
    color: "#111",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
};
