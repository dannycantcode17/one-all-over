import { useState, useEffect, useRef, useMemo } from "react";

// ============================================================
// MUSCLE MEMORY - Danny's shortcut vault ("1 all over")
// Edit your shortcuts here. This array IS the database (v0.3).
// keys: array of keycaps. tool: where it lives.
// ============================================================
const SEED_SHORTCUTS = [
  // ---- Numpad deck (AHK + AutoHotInterception) ----
  { id: 1,  keys: ["Num /"],     action: "Open Attio",                  tool: "Numpad", notes: "" },
  { id: 2,  keys: ["Num *"],     action: "Open Shopify",                tool: "Numpad", notes: "" },
  { id: 3,  keys: ["Num -"],     action: "Open Apollo",                 tool: "Numpad", notes: "" },
  { id: 4,  keys: ["Num +"],     action: "Move window to next monitor", tool: "Numpad", notes: "" },
  { id: 5,  keys: ["Num 7"],     action: "Snap window LEFT third",      tool: "Numpad", notes: "" },
  { id: 6,  keys: ["Num 8"],     action: "Snap window CENTRE third",    tool: "Numpad", notes: "" },
  { id: 7,  keys: ["Num 9"],     action: "Snap window RIGHT third",     tool: "Numpad", notes: "" },
  { id: 8,  keys: ["Num Enter"], action: "Maximise toggle",             tool: "Numpad", notes: "" },
  { id: 9,  keys: ["Num 4"],     action: "Open Notion",                 tool: "Numpad", notes: "" },
  { id: 10, keys: ["Num 5"],     action: "Open Claude desktop",         tool: "Numpad", notes: "" },
  { id: 11, keys: ["Num 6"],     action: "Open Claude web",             tool: "Numpad", notes: "" },
  { id: 12, keys: ["Num 1"],     action: "Open Scienza",                tool: "Numpad", notes: "" },
  { id: 13, keys: ["Num 2"],     action: "Open Obsidian",               tool: "Numpad", notes: "" },
  { id: 14, keys: ["Num 3"],     action: "Open GitHub",                 tool: "Numpad", notes: "" },
  { id: 15, keys: ["Num Del"],   action: "Relayout windows",            tool: "Numpad", notes: "" },
  { id: 16, keys: ["Num 0"],     action: "Cleanse (close the clutter)", tool: "Numpad", notes: "" },

  // ---- Wispr Flow ----
  { id: 17, keys: ["Copilot", "hold"], action: "Push-to-talk dictation",     tool: "Wispr Flow", notes: "Hold to speak, release to drop text" },
  { id: 18, keys: ["Copilot", "x2"],   action: "Hands-free dictation",       tool: "Wispr Flow", notes: "Double-tap to toggle on/off" },
  { id: 19, keys: ["Win", "Alt", "1"], action: "Polish: improve clarity",    tool: "Wispr Flow", notes: "Custom prompt" },
  { id: 20, keys: ["Ctrl", "/"],       action: "Prompt Engineer",            tool: "Wispr Flow", notes: "Custom prompt: structures into title + lines" },

  // ---- ShareX ----
  { id: 21, keys: ["Shift", "Win", "D"],      action: "Capture region",              tool: "ShareX", notes: "" },
  { id: 22, keys: ["PrtSc"],                  action: "Capture entire screen",       tool: "ShareX", notes: "" },
  { id: 23, keys: ["Alt", "PrtSc"],           action: "Capture active window",       tool: "ShareX", notes: "" },
  { id: 24, keys: ["Shift", "PrtSc"],         action: "Start/stop screen recording", tool: "ShareX", notes: "" },
  { id: 25, keys: ["Ctrl", "Shift", "PrtSc"], action: "Start/stop GIF recording",    tool: "ShareX", notes: "" },

  // ---- iPhone ----
  { id: 26, keys: ["Action button"], action: "New Granola note recording", tool: "iPhone", notes: "Shortcuts automation" },
];

const TOOL_COLOURS = {
  Numpad:       "#ffb27d",
  "Wispr Flow": "#a78bfa",
  ShareX:       "#34d399",
  iPhone:       "#60a5fa",
  Raycast:      "#ff6363",
  Windows:      "#93c5fd",
  PowerToys:    "#c4b5fd",
  "Text Blaze": "#f472b6",
  Obsidian:     "#b794f6",
  Chrome:       "#fbbf24",
};

// big-sur from the backdrop bank: late-night builds
const BACKDROP =
  "https://raw.githubusercontent.com/dannycantcode17/backdrop-bank/main/Beach%20Web%20Design%206.png";

// The deck rendered as a real numpad. match ties a key to its
// shortcut by keycap label; hint is the engraving under the cap.
const NUMPAD_LAYOUT = [
  { label: "Num",   match: null,        hint: "",          col: "1",     row: "1" },
  { label: "/",     match: "Num /",     hint: "Attio",     col: "2",     row: "1" },
  { label: "*",     match: "Num *",     hint: "Shopify",   col: "3",     row: "1" },
  { label: "-",     match: "Num -",     hint: "Apollo",    col: "4",     row: "1" },
  { label: "7",     match: "Num 7",     hint: "left ⅓",    col: "1",     row: "2" },
  { label: "8",     match: "Num 8",     hint: "centre ⅓",  col: "2",     row: "2" },
  { label: "9",     match: "Num 9",     hint: "right ⅓",   col: "3",     row: "2" },
  { label: "+",     match: "Num +",     hint: "monitor",   col: "4",     row: "2 / span 2" },
  { label: "4",     match: "Num 4",     hint: "Notion",    col: "1",     row: "3" },
  { label: "5",     match: "Num 5",     hint: "Claude",    col: "2",     row: "3" },
  { label: "6",     match: "Num 6",     hint: "Claude web", col: "3",    row: "3" },
  { label: "1",     match: "Num 1",     hint: "Scienza",   col: "1",     row: "4" },
  { label: "2",     match: "Num 2",     hint: "Obsidian",  col: "2",     row: "4" },
  { label: "3",     match: "Num 3",     hint: "GitHub",    col: "3",     row: "4" },
  { label: "Enter", match: "Num Enter", hint: "maximise",  col: "4",     row: "4 / span 2" },
  { label: "0",     match: "Num 0",     hint: "cleanse",   col: "1 / span 2", row: "5" },
  { label: "Del",   match: "Num Del",   hint: "relayout",  col: "3",     row: "5" },
];

const STORE_KEY = "one-all-over.vault.v1";

function Keys({ keys, small }) {
  return (
    <>
      {keys.map((k, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span className={small ? "keycap sm" : "keycap"}>{k}</span>
          {i < keys.length - 1 && <span className="keyplus">+</span>}
        </span>
      ))}
    </>
  );
}

export default function App() {
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : SEED_SHORTCUTS;
    } catch {
      return SEED_SHORTCUTS;
    }
  });
  const [query, setQuery] = useState("");
  const [toolFilter, setToolFilter] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ keys: "", action: "", tool: "", notes: "" });
  const [hoverKey, setHoverKey] = useState(null);
  const [pinnedKey, setPinnedKey] = useState(null);
  const searchRef = useRef(null);

  // The vault remembers edits per browser; the seed in this file
  // stays the deployable truth.
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(shortcuts));
    } catch {
      // private browsing: edits just live for the session
    }
  }, [shortcuts]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setQuery("");
        setToolFilter(null);
        setPinnedKey(null);
        searchRef.current?.focus();
      }
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tools = useMemo(() => [...new Set(shortcuts.map((s) => s.tool))], [shortcuts]);

  const byNumpadKey = useMemo(() => {
    const map = new Map();
    shortcuts
      .filter((s) => s.tool === "Numpad")
      .forEach((s) => map.set(s.keys[0], s));
    return map;
  }, [shortcuts]);

  const activeKey = hoverKey ?? pinnedKey;
  const activeShortcut = activeKey ? byNumpadKey.get(activeKey) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shortcuts.filter((s) => {
      if (toolFilter && s.tool !== toolFilter) return false;
      if (!q) return true;
      const hay = `${s.action} ${s.tool} ${s.keys.join(" ")} ${s.notes}`.toLowerCase();
      return q.split(" ").every((w) => hay.includes(w));
    });
  }, [shortcuts, query, toolFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((s) => {
      if (!map.has(s.tool)) map.set(s.tool, []);
      map.get(s.tool).push(s);
    });
    return [...map.entries()];
  }, [filtered]);

  const removeShortcut = (id) => setShortcuts((prev) => prev.filter((s) => s.id !== id));

  const addShortcut = () => {
    if (!draft.keys.trim() || !draft.action.trim()) return;
    setShortcuts((prev) => [
      ...prev,
      {
        id: Date.now(),
        keys: draft.keys.split("+").map((k) => k.trim()).filter(Boolean),
        action: draft.action.trim(),
        tool: draft.tool.trim() || "Other",
        notes: draft.notes.trim(),
      },
    ]);
    setDraft({ keys: "", action: "", tool: "", notes: "" });
    setShowAdd(false);
  };

  const resetVault = () => {
    setShortcuts(SEED_SHORTCUTS);
    setPinnedKey(null);
  };

  return (
    <div className="app-root">
      <div className="backdrop" style={{ backgroundImage: `url('${BACKDROP}')` }} />

      <div className="shell">
        {/* Header */}
        <header className="rise" style={{ paddingTop: 64, paddingBottom: 36 }}>
          <div className="eyebrow">1 all over · shortcut vault</div>
          <h1 className="hero-title">Muscle Memory</h1>
          <p className="hero-sub">
            {shortcuts.length} shortcuts on file across {tools.length} tools · press{" "}
            <span className="keycap sm">/</span> to search
          </p>
        </header>

        {/* The deck */}
        <section className="glass deck rise" style={{ animationDelay: "60ms", marginBottom: 26 }}>
          <div className="padwrap">
          <div className="numpad" onMouseLeave={() => setHoverKey(null)}>
            {NUMPAD_LAYOUT.map((k) => {
              const dead = !k.match;
              const lit = !dead && (hoverKey === k.match || pinnedKey === k.match);
              return (
                <button
                  key={k.label + k.col}
                  className={`npkey${lit ? " lit" : ""}${dead ? " dead" : ""}`}
                  style={{ gridColumn: k.col, gridRow: k.row }}
                  onMouseEnter={() => !dead && setHoverKey(k.match)}
                  onFocus={() => !dead && setHoverKey(k.match)}
                  onBlur={() => setHoverKey(null)}
                  onClick={() =>
                    !dead && setPinnedKey((p) => (p === k.match ? null : k.match))
                  }
                  tabIndex={dead ? -1 : 0}
                  aria-label={
                    dead ? k.label : `${k.match}: ${byNumpadKey.get(k.match)?.action ?? ""}`
                  }
                >
                  <span className="cap">{k.label}</span>
                  {k.hint && <span className="hint">{k.hint}</span>}
                </button>
              );
            })}
          </div>
          </div>

          <div className="readout">
            {activeShortcut ? (
              <>
                <div className="readout-keys">
                  <Keys keys={activeShortcut.keys} />
                </div>
                <div className="readout-action">{activeShortcut.action}</div>
                {activeShortcut.notes && (
                  <div className="readout-notes">{activeShortcut.notes}</div>
                )}
              </>
            ) : (
              <div className="readout-idle">
                This is the deck. Hover a key to see what it fires, click to pin it
                while it sinks in. AutoHotkey and AutoHotInterception underneath,
                so the real numpad does all of this without a modifier in sight.
              </div>
            )}
          </div>
        </section>

        {/* Search */}
        <div className="glass search rise" style={{ animationDelay: "120ms" }}>
          <span style={{ opacity: 0.4, fontSize: 16 }}>⌕</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you trying to do?"
          />
          {query && (
            <button className="linklike" onClick={() => setQuery("")}>
              clear
            </button>
          )}
        </div>

        {/* Tool chips */}
        <div className="chips rise" style={{ animationDelay: "160ms" }}>
          {tools.map((t) => (
            <button
              key={t}
              className={`chip${toolFilter === t ? " on" : ""}`}
              onClick={() => setToolFilter(toolFilter === t ? null : t)}
            >
              {t}
            </button>
          ))}
          <button className="chip add" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "− close" : "+ add shortcut"}
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="glass add-form rise">
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              New shortcut
            </div>
            <div className="add-grid">
              {[
                { k: "keys", ph: "Keys, e.g. Ctrl + Shift + V" },
                { k: "action", ph: "What it does" },
                { k: "tool", ph: "Tool (e.g. ShareX)" },
                { k: "notes", ph: "Notes (optional)" },
              ].map((f) => (
                <input
                  key={f.k}
                  value={draft[f.k]}
                  onChange={(e) => setDraft({ ...draft, [f.k]: e.target.value })}
                  placeholder={f.ph}
                />
              ))}
            </div>
            <button className="btn-accent" onClick={addShortcut}>
              Add to vault
            </button>
            <span className="form-note">
              Saved in this browser. The file stays the deployable truth.
            </span>
          </div>
        )}

        {/* Grouped by tool */}
        {grouped.length > 0 ? (
          grouped.map(([tool, rows], gi) => (
            <section
              key={tool}
              className="group rise"
              style={{ animationDelay: `${220 + gi * 60}ms` }}
            >
              <div className="group-head">
                <span
                  className="group-dot"
                  style={{ background: TOOL_COLOURS[tool] || "#cbd5e1" }}
                />
                <span className="eyebrow">{tool}</span>
                <span className="group-count">{rows.length}</span>
                <span className="group-num">{String(gi + 1).padStart(2, "0")}</span>
              </div>
              <div className="glass rows">
                {rows.map((s) => (
                  <div
                    key={s.id}
                    className={`row${
                      s.tool === "Numpad" && pinnedKey === s.keys[0] ? " flash" : ""
                    }`}
                  >
                    <div className="row-keys">
                      <Keys keys={s.keys} />
                    </div>
                    <div className="row-body">
                      <div className="row-action">{s.action}</div>
                      {s.notes && <div className="row-notes">{s.notes}</div>}
                    </div>
                    <button
                      className="row-remove"
                      title="Remove"
                      onClick={() => removeShortcut(s.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="glass empty rise">
            Nothing matches. Clear the search or add it as a new shortcut. Future
            you will be grateful.
          </div>
        )}

        <footer className="foot">
          A number 1, all over. Because that would be a short cut.
          <br />
          <button className="linklike" onClick={resetVault}>
            reset vault to seed
          </button>
        </footer>
      </div>
    </div>
  );
}
