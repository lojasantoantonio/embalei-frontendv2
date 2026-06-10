interface Props {
  message: string;
  code: string | null;
}

// Feedback visual quando a consulta da chave da NF-e não retorna um pedido
// (não encontrado / erro na IDWorks). Substitui o toast de erro: fica fixo na
// área principal até o operador bipar a chave novamente.
export function OrderNotFound({ message, code }: Props) {
  const shortCode = code
    ? `${code.slice(0, 8)}…${code.slice(-6)}`
    : null;

  return (
    <div className="order-notfound" role="alert" aria-live="assertive">
      <div className="onf-illus">
        <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
          <rect
            x="7"
            y="11"
            width="34"
            height="26"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          {[12, 17, 22, 30, 35].map((x) => (
            <line
              key={x}
              x1={x}
              y1="17"
              x2={x}
              y2="31"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <span className="onf-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>

      <h3>Pedido não encontrado</h3>
      <p>{message}</p>
      {shortCode && <code className="onf-key">{shortCode}</code>}

      <div className="onf-hint">
        Confira a etiqueta e bipe a chave de acesso novamente.
      </div>
    </div>
  );
}
