interface Props {
  code: string | null;
  mode?: "buscando" | "finalizando";
}

const COPY = {
  buscando: {
    title: "Buscando pedido",
    subtitle: "Consultando os dados da nota fiscal na IDWorks.",
  },
  finalizando: {
    title: "Fechando embalagem",
    subtitle: "Gravando volumes e duração. Não bipe outra nota ainda.",
  },
} as const;

// Feedback visual enquanto o backend processa: ou consultando a IDWorks (1º
// bipe) ou finalizando a embalagem (2º bipe). Scanner animado + esqueleto do
// pedido para indicar claramente que algo está em andamento.
export function OrderLoading({ code, mode = "buscando" }: Props) {
  const shortCode = code
    ? `${code.slice(0, 8)}…${code.slice(-6)}`
    : null;
  const copy = COPY[mode];

  return (
    <div className="order-loading" role="status" aria-live="polite">
      <div className="order-loading-head">
        <div className="ol-scanner">
          <div className="ol-barcode">
            {Array.from({ length: 13 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="ol-beam" />
        </div>

        <h3>
          {copy.title}
          <span className="ol-dots">
            <span />
            <span />
            <span />
          </span>
        </h3>
        <p>{copy.subtitle}</p>
        {shortCode && <code className="ol-key">{shortCode}</code>}
      </div>

      <div className="ol-skeleton">
        <div className="ol-sk-row ol-sk-title" />
        <div className="ol-sk-cards">
          <div className="ol-sk-card" />
          <div className="ol-sk-card" />
          <div className="ol-sk-card" />
        </div>
        <div className="ol-sk-row" />
        <div className="ol-sk-row short" />
      </div>
    </div>
  );
}
