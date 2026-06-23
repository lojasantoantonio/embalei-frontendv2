import type { ApiEmbalagem } from "@/lib/api";
import { Icon } from "@/components/icons";

interface Props {
  embalagens: ApiEmbalagem[];
  // Códigos (EAN) já adicionados, na ordem — usados para contar por embalagem.
  codes: string[];
  total: number;
  expected: number;
  finalizing: boolean;
  onAdd: (code: string) => void;
  onRemove: (code: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

// Código usado para contar/identificar a embalagem. Embalagens sem EAN caem num
// código sintético estável por id (não casa com a tabela no relatório, mas
// mantém a contagem do volume consistente).
function embalagemCode(embalagem: ApiEmbalagem): string {
  return embalagem.eanCode ?? `#${embalagem.id}`;
}

// Teclado virtual que sobe na hora de contar os volumes: o operador toca na
// embalagem usada (pode tocar várias vezes na mesma), com um contador pequeno
// sobre cada uma. Ao atingir o limite de volumes do pedido, aparece o botão
// "Confirmar volumes". O "−" remove uma unidade para trocar por outra.
export function EmbalagemKeyboard({
  embalagens,
  codes,
  total,
  expected,
  finalizing,
  onAdd,
  onRemove,
  onConfirm,
  onClose,
}: Props) {
  const reachedLimit = total >= expected;

  const countByCode = codes.reduce<Record<string, number>>((acc, code) => {
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="emb-kb" role="group" aria-label="Selecionar embalagens dos volumes">
      <div className="emb-kb-head">
        <span className="emb-kb-title">Toque na embalagem usada</span>
        <span className="emb-kb-counter">
          <b>{total}</b> / {expected} volume(s)
        </span>
        <button
          type="button"
          className="emb-kb-close"
          onClick={onClose}
          aria-label="Fechar teclado"
        >
          ✕
        </button>
      </div>

      {embalagens.length === 0 ? (
        <div className="emb-kb-empty">Nenhuma embalagem cadastrada</div>
      ) : (
        <div className="emb-kb-grid">
          {embalagens.map((embalagem) => {
            const code = embalagemCode(embalagem);
            const count = countByCode[code] ?? 0;
            // Mesmo no limite os tiles ficam no estado normal (mais visibilidade);
            // a adição extra é bloqueada em addEmbalagem com aviso.
            const disableAdd = finalizing;
            return (
              <div key={embalagem.id} className={"emb-tile" + (count > 0 ? " emb-tile--active" : "")}>
                <button
                  type="button"
                  className="emb-tile-add"
                  onClick={() => onAdd(code)}
                  disabled={disableAdd}
                  aria-label={`Adicionar ${embalagem.name}`}
                >
                  {count > 0 && <span className="emb-count" aria-label={`${count} adicionada(s)`}>{count}</span>}
                  <Icon.box width={20} height={20} />
                  <span className="emb-tile-name">{embalagem.name}</span>
                </button>
                {count > 0 && (
                  <button
                    type="button"
                    className="emb-remove"
                    onClick={() => onRemove(code)}
                    disabled={finalizing}
                    aria-label={`Remover ${embalagem.name}`}
                  >
                    −
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reachedLimit && (
        <div className="emb-kb-foot">
          <button
            type="button"
            className="btn primary emb-confirm"
            onClick={onConfirm}
            disabled={finalizing}
          >
            <Icon.check width={16} height={16} />
            Confirmar volumes
          </button>
        </div>
      )}
    </div>
  );
}
