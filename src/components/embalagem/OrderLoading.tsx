interface Props {
  code: string | null;
}

// Feedback visual enquanto o backend consulta o pedido na IDWorks a partir da
// chave de acesso da NF-e bipada. Scanner animado + esqueleto do cartão do
// pedido para indicar claramente que os dados estão sendo buscados.
export function OrderLoading({ code }: Props) {
  const shortCode = code
    ? `${code.slice(0, 8)}…${code.slice(-6)}`
    : null;

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
          Buscando pedido
          <span className="ol-dots">
            <span />
            <span />
            <span />
          </span>
        </h3>
        <p>Consultando os dados da nota fiscal na IDWorks.</p>
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
