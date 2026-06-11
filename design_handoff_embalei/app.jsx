const { useState, useEffect, useRef, useMemo } = React;

// ===== Tweaks =====
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "accent": "#006fee",
  "scanner": "a"
}/*EDITMODE-END*/;

const ACCENT_MAP = {
  "#006fee": { brand50: "#e6f1fe", gradFrom: "#0a5cd1", gradTo: "#38bdf8" },
  "#7828c8": { brand50: "#f4eaff", gradFrom: "#6020a0", gradTo: "#c084fc" },
  "#f31260": { brand50: "#fee7ef", gradFrom: "#c70d4e", gradTo: "#fb7185" },
  "#0c8242": { brand50: "#e8faf0", gradFrom: "#0a6b37", gradTo: "#22c55e" },
};

// ===== Icons (inline SVG) =====
const Ic = {
  scan: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  box: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  truck: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  thermo: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4 4 0 1 0 5 0z"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  logout: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  reset: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  pkg: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  drop: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
};

// ===== Top Bar =====
function TopBar({ orderCode, onExit, onReset }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">E</div>
        <span>Embalei</span>
      </div>
      <div className="crumbs">
        <span>Estação 03</span>
        <span className="sep">/</span>
        <span>Embalagem</span>
        {orderCode && <>
          <span className="sep">/</span>
          <span className="cur mono">{orderCode}</span>
        </>}
      </div>
      <div className="spacer"></div>
      <div className="station">
        <span className="dot"></span>
        <span>Lara M. · turno tarde</span>
      </div>
      {orderCode && (
        <button className="btn ghost" onClick={onReset}>
          <Ic.reset width="14" height="14" />
          Novo pedido
        </button>
      )}
      <button className="btn danger" onClick={onExit}>
        <Ic.logout width="14" height="14" />
        SAIR
      </button>
    </div>
  );
}

// ===== Scan strip =====
function ScannerIllus({ variant }) {
  if (variant === "b") {
    return (
      <div className="scanner-illus vb">
        <div className="scanner-label">ZBR · DS2208</div>
        <div className="gun">
          <div className="gun-head"></div>
          <div className="grip"></div>
          <div className="beam"></div>
          <div className="barcode"></div>
        </div>
      </div>
    );
  }
  if (variant === "c") {
    return (
      <div className="scanner-illus vc">
        <div className="scanner-label">HONEY · MK7580</div>
        <div className="laser-bar"></div>
        <div className="laser-fan"></div>
        <div className="pkg"></div>
        <div className="scan-line"></div>
      </div>
    );
  }
  return (
    <div className="scanner-illus va">
      <div className="scanner-label">SYM · LS2208</div>
      <div className="scanner-window"></div>
    </div>
  );
}

function ScanStrip({ stats, onScan, hasOrder, scannerVariant }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (code) {
      onScan(code);
      setValue("");
    }
  };

  return (
    <div className="scan-card">
      <ScannerIllus variant={scannerVariant} />
      <div className="scan-right">
        <div className="scan-headline">
          <span className="pulse"></span>
          {hasOrder
            ? "PEDIDO CARREGADO · ESCANEIE O PRÓXIMO QUANDO TERMINAR"
            : "ESCANEIE O CUPOM DO PEDIDO NO LEITOR"}
        </div>
        <form onSubmit={submit}>
          <div className="scan-input-wrap">
            <input
              ref={inputRef}
              className="scan-input"
              placeholder="Escaneie seu pedido aqui!"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </form>
        <div className="scan-stats">
          <div className="stat-chip">
            <span>Hoje:</span>
            <span className="n">{stats.orders}</span>
            <span>pedidos bipados</span>
          </div>
          <div className="stat-chip">
            <span>Hoje:</span>
            <span className="n">{stats.products}</span>
            <span>itens confirmados</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Empty state =====
function EmptyState({ onPick }) {
  const codes = window.SUGGESTED_CODES;
  return (
    <div className="empty">
      <div className="empty-illus">
        <Ic.pkg width="28" height="28" />
      </div>
      <h3>Aguardando bipagem do cupom</h3>
      <div>Encoste o cupom do pedido no leitor para começar.</div>
      <div className="codes">
        <span style={{ fontSize: 12, color: "var(--ink-3)", alignSelf: "center", marginRight: 4 }}>
          Demo · bipe um destes:
        </span>
        {codes.map(c => (
          <button key={c} onClick={() => onPick(c)}>{c}</button>
        ))}
      </div>
    </div>
  );
}

// ===== Item row =====
function ItemRow({ item, picked, onPick }) {
  const done = picked >= item.qty;
  return (
    <div className={"item" + (done ? " done" : "")} onClick={onPick}>
      <div className="item-photo" title={item.name}>
        <div className="ph" style={{ background: `linear-gradient(135deg, ${item.color}, #e5e7eb)` }}></div>
        <div className="label">{item.label}</div>
      </div>
      <div className="item-meta">
        <div className="item-name">{item.name}</div>
        <div className="item-sku">SKU · {item.sku}</div>
        {item.tags.length > 0 && (
          <div className="item-tags">
            {item.tags.map(t => (
              <span key={t} className={"tag " + (t === "refrigerado" ? "cold" : t === "frágil" ? "frag" : "")}>{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="check">
        <span className="mono" style={{ fontSize: 16 }}>{item.qty}×</span>
      </div>
    </div>
  );
}

// ===== Label sticking GIF placeholder (animated CSS) =====
function LabelGif() {
  return (
    <div>
      <h3 className="panel-title">
        <span className="ic"><Ic.play width="12" height="12" /></span>
        Como colar a etiqueta
      </h3>
      <div className="gif">
        <div className="ph-label">GIF · ETIQUETA</div>
        <div className="ph-dot">LIVE</div>
        <div className="label-art">
          <div className="label-box"></div>
          <div className="label-sticker">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div className="gif-step-bar">
          <div></div>
          <div></div>
          <div></div>
          <div className="active"></div>
        </div>
      </div>
      <div className="gif-caption">
        <div>
          <b>Passo 4</b> · Cole na face superior, centralizada
        </div>
        <div className="steps">04 / 04</div>
      </div>
    </div>
  );
}

// ===== Box recommendation =====
function BoxCard({ box }) {
  return (
    <div>
      <h3 className="panel-title">
        <span className="ic"><Ic.box width="12" height="12" /></span>
        Caixa recomendada
      </h3>
      <div className="box-card">
        <div className="box-3d">
          <svg viewBox="0 0 100 100">
            {/* Top */}
            <polygon points="20,30 50,15 80,30 50,45" fill="#d4a574" stroke="#9a6e3f" strokeWidth="1.5"/>
            {/* Left */}
            <polygon points="20,30 50,45 50,85 20,70" fill="#b8895a" stroke="#9a6e3f" strokeWidth="1.5"/>
            {/* Right */}
            <polygon points="50,45 80,30 80,70 50,85" fill="#a07444" stroke="#9a6e3f" strokeWidth="1.5"/>
            {/* tape */}
            <line x1="20" y1="42" x2="50" y2="57" stroke="#e2c39a" strokeWidth="3"/>
            <line x1="80" y1="42" x2="50" y2="57" stroke="#cda884" strokeWidth="3"/>
          </svg>
        </div>
        <div className="box-info">
          <div className="name">{box.name}</div>
          <div className="dim">{box.dim}</div>
          <div className="fill">
            <span>Ocupação</span>
            <div className="fill-bar"><div style={{ width: `${box.fill}%` }}></div></div>
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>{box.fill}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Carrier card =====
function CarrierCard({ carrier }) {
  return (
    <div>
      <h3 className="panel-title">
        <span className="ic"><Ic.truck width="12" height="12" /></span>
        Transportadora
      </h3>
      <div className="carrier">
        <div className="carrier-logo" style={{ background: `linear-gradient(135deg, ${carrier.color}, ${carrier.color}cc)` }}>
          {carrier.logo}
        </div>
        <div className="carrier-info">
          <div className="name">{carrier.name}</div>
          <div className="svc">{carrier.svc}</div>
          <div className="eta"><b>ETA</b> · {carrier.eta}</div>
        </div>
      </div>
    </div>
  );
}

// ===== Temperature card =====
function TempCard({ temp }) {
  // map -10..40 → -120deg..120deg
  const v = Math.max(-10, Math.min(40, temp.value));
  const rot = -120 + ((v + 10) / 50) * 240;
  const isCold = v < 15;
  const isHot = v > 25;
  return (
    <div>
      <h3 className="panel-title">
        <span className="ic"><Ic.thermo width="12" height="12" /></span>
        Temperatura no destino
      </h3>
      <div className="temp-card">
        <div className="dial">
          <div className="needle" style={{ "--rot": rot + "deg" }}></div>
          <div className="center"></div>
        </div>
        <div className="temp-num">
          <div className="deg">{temp.value}<span className="unit">°C</span></div>
          <div className="where"><b>{temp.city}</b></div>
          <div className="forecast">{temp.condition}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-2)" }}>
        <div className="info-row" style={{ padding: 0, border: 0 }}>
          <div className={"ic2 " + (isCold ? "c" : isHot ? "w" : "g")}>
            <Ic.drop width="16" height="16" />
          </div>
          <div>
            <div className="lab">Recomendação</div>
            <div className="val" style={{ fontSize: 13 }}>{temp.forecast}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Order detail =====
function OrderDetail({ order, picks, onPick, onConfirm }) {
  const totalQty = order.items.reduce((s, i) => s + i.qty, 0);
  const pickedQty = order.items.reduce((s, i) => s + Math.min(i.qty, picks[i.id] || 0), 0);
  const allDone = pickedQty >= totalQty;
  const [itemsOpen, setItemsOpen] = useState(false);
  const pct = Math.round((pickedQty / totalQty) * 100);

  return (
    <>
      <div className="order">
        <div className="info-grid">
          <div className="panel"><BoxCard box={order.box} /></div>
          <div className="panel"><CarrierCard carrier={order.carrier} /></div>
          <div className="panel"><TempCard temp={order.temperature} /></div>
          <div className="panel"><LabelGif /></div>
        </div>
        <div className="panel">
          <div
            className="order-head collapsible"
            onClick={() => setItemsOpen(o => !o)}
            role="button"
            aria-expanded={itemsOpen}
          >
            <div className="order-head-row">
              <div className="order-code">
                <span className={"chev-toggle" + (itemsOpen ? " open" : "")}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
                <div>
                  <div className="pid"><span className="pid-prefix">PED-</span>{order.code.replace("PED-", "")}</div>
                  <div className="meta"><b style={{color:'var(--ink)'}}>{order.customer}</b> · {order.city} · {order.placedAt}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {order.priority === "express" && <span className="badge warn">⚡ Expresso</span>}
                <span className="badge brand">{order.items.length} itens · {totalQty} unidades</span>
              </div>
            </div>
          </div>
          {itemsOpen && (
            <div className="items">
              {order.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  picked={Math.min(item.qty, picks[item.id] || 0)}
                  onPick={() => onPick(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ===== Toasts =====
function Toasts({ list }) {
  return (
    <div className="toast-wrap">
      {list.map(t => (
        <div key={t.id} className={"toast " + (t.kind || "")}>
          {t.kind === "success" && <Ic.check width="16" height="16" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ===== App =====
function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [orderCode, setOrderCode] = useState(null);
  const [picks, setPicks] = useState({});
  const [stats, setStats] = useState({ products: 124, orders: 32, queue: 8 });
  const [toasts, setToasts] = useState([]);

  const order = orderCode ? window.ORDERS[orderCode] : null;

  useEffect(() => {
    document.body.classList.toggle("compact", t.density === "compact");
  }, [t.density]);

  useEffect(() => {
    const a = ACCENT_MAP[t.accent] || ACCENT_MAP["#006fee"];
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-50", a.brand50);
    const mark = document.querySelector(".brand-mark");
    if (mark) mark.style.background = `linear-gradient(135deg, ${a.gradFrom}, ${t.accent} 60%, ${a.gradTo})`;
  }, [t.accent]);

  const pushToast = (msg, kind = "") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, msg, kind }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 2400);
  };

  const handleScan = (code) => {
    if (window.ORDERS[code]) {
      setOrderCode(code);
      // Start with all items pre-confirmed (green) — pre-conference mode.
      const initial = {};
      window.ORDERS[code].items.forEach(i => { initial[i.id] = i.qty; });
      setPicks(initial);
      pushToast(`Pedido ${code} carregado · ${window.ORDERS[code].items.length} itens`, "success");
    } else if (order) {
      // try to bip an item by SKU
      const item = order.items.find(i => i.sku === code);
      if (item) {
        setPicks(p => {
          const next = { ...p, [item.id]: Math.min(item.qty, (p[item.id] || 0) + 1) };
          return next;
        });
        pushToast(`${item.name.split(" · ")[0]} · bipado`, "success");
      } else {
        pushToast(`Código ${code} não encontrado neste pedido`, "error");
      }
    } else {
      pushToast(`Pedido ${code} não encontrado`, "error");
    }
  };

  const handlePickItem = (id) => {
    if (!order) return;
    const item = order.items.find(i => i.id === id);
    if (!item) return;
    setPicks(p => ({ ...p, [id]: Math.min(item.qty, (p[id] || 0) + 1) }));
  };

  const handleConfirm = () => {
    if (!order) return;
    const total = order.items.reduce((s, i) => s + i.qty, 0);
    setStats(s => ({ ...s, products: s.products + total, orders: s.orders + 1, queue: Math.max(0, s.queue - 1) }));
    pushToast(`Pedido ${order.code} confirmado · etiqueta enviada à impressora`, "success");
    setOrderCode(null);
    setPicks({});
  };

  const handleReset = () => {
    setOrderCode(null);
    setPicks({});
  };

  const handleExit = () => {
    pushToast("Sessão encerrada", "warn");
    setTimeout(() => { window.location.href = "Login.html"; }, 600);
  };

  return (
    <>
      <TopBar orderCode={orderCode} onExit={handleExit} onReset={handleReset} />
      <div className="stage">
        <ScanStrip stats={stats} onScan={handleScan} hasOrder={!!order} scannerVariant={t.scanner} />
        {order
          ? <OrderDetail order={order} picks={picks} onPick={handlePickItem} onConfirm={handleConfirm} />
          : <EmptyState onPick={handleScan} />
        }
      </div>
      <Toasts list={toasts} />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Aparência">
          <window.TweakRadio
            label="Densidade"
            value={t.density}
            options={[
              { value: "comfortable", label: "Confortável" },
              { value: "compact", label: "Compacta" },
            ]}
            onChange={(v) => setTweak("density", v)}
          />
          <window.TweakRadio
            label="Leitor"
            value={t.scanner}
            options={[
              { value: "a", label: "Mesa" },
              { value: "b", label: "Pistola" },
              { value: "c", label: "Túnel" },
            ]}
            onChange={(v) => setTweak("scanner", v)}
          />
          <window.TweakColor
            label="Destaque"
            value={t.accent}
            options={["#006fee", "#7828c8", "#f31260", "#0c8242"]}
            onChange={(v) => setTweak("accent", v)}
          />
        </window.TweakSection>
        <window.TweakSection label="Demo">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {window.SUGGESTED_CODES.map(c => (
              <window.TweakButton key={c} label={"Bipar " + c} onClick={() => handleScan(c)} />
            ))}
            {order && (
              <window.TweakButton
                label="Bipar todos os itens"
                secondary={true}
                onClick={() => {
                  order.items.forEach(i => setPicks(p => ({ ...p, [i.id]: i.qty })));
                }}
              />
            )}
          </div>
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
