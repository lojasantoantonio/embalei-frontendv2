interface Props {
  orderCode: string;
  volumeCount: number;
}

// Overlay de feedback positivo exibido após fechar uma embalagem com sucesso.
// Mostra um círculo verde com check animado e sai por fade-out (~1.4s no total,
// controlado pelo pai via timeout).
export function PackSuccessOverlay({ orderCode, volumeCount }: Props) {
  return (
    <div className="pack-success" role="status" aria-live="polite">
      <div className="pack-success-card">
        <div className="pack-success-burst" aria-hidden="true" />
        <div className="pack-success-circle" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="72" height="72">
            <circle
              className="pack-success-ring"
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="pack-success-check"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27 L23 36 L39 18"
            />
          </svg>
        </div>
        <div className="pack-success-title">Pedido embalado</div>
        <div className="pack-success-subtitle">
          <span className="pack-success-code">{orderCode}</span>
          <span className="pack-success-sep">·</span>
          <span>
            {volumeCount} volume{volumeCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
