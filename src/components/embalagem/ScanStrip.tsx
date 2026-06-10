import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@heroui/react";
import { ScannerIllus, type ScannerVariant } from "./ScannerIllus";

interface Props {
  onScan: (code: string) => void;
  hasOrder: boolean;
  boxScanCount: number;
  volumeCount: number;
  scannerVariant: ScannerVariant;
}

function buildHeadline(
  hasOrder: boolean,
  volumeCount: number,
  boxScanCount: number,
): string {
  if (!hasOrder) return "POR FAVOR, ESCANEIE O CUPOM DO PEDIDO NO LEITOR";
  if (boxScanCount >= volumeCount && volumeCount > 0)
    return "BIPE A NF-E NOVAMENTE PARA FINALIZAR";
  if (volumeCount > 1)
    return `BIPE A CAIXA · ${boxScanCount}/${volumeCount} VOLUMES`;
  return "BIPE A CAIXA E A NF-E NOVAMENTE PARA FINALIZAR";
}

export function ScanStrip({
  onScan,
  hasOrder,
  boxScanCount,
  volumeCount,
  scannerVariant,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const refocusTimer = useRef<number | null>(null);
  const [value, setValue] = useState("");

  // Estação de leitura: o campo precisa estar sempre em foco para que o
  // scanner "digite" o código aqui, independente do que o operador clicar.
  // Só foca se o input ainda estiver montado/conectado e a aba visível —
  // focar um elemento destacado durante uma transição de rota dispara
  // InvalidStateError e aborta a navegação.
  const focusInput = useCallback(() => {
    const el = inputRef.current;
    if (!el || !el.isConnected || document.visibilityState !== "visible") return;
    try {
      el.focus({ preventScroll: true });
    } catch {
      /* foco indisponível neste instante (transição/unmount) — ignora */
    }
  }, []);

  const scheduleRefocus = useCallback(() => {
    if (refocusTimer.current !== null) window.clearTimeout(refocusTimer.current);
    refocusTimer.current = window.setTimeout(() => {
      refocusTimer.current = null;
      focusInput();
    }, 0);
  }, [focusInput]);

  useEffect(() => {
    focusInput();
    window.addEventListener("focus", focusInput);
    return () => {
      window.removeEventListener("focus", focusInput);
      if (refocusTimer.current !== null) {
        window.clearTimeout(refocusTimer.current);
        refocusTimer.current = null;
      }
    };
  }, [focusInput]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (code) {
      onScan(code);
      setValue("");
    }
    focusInput();
  };

  return (
    <div className="scan-card">
      <ScannerIllus variant={scannerVariant} />
      <div className="scan-right">
        <div className="scan-headline">
          <span className="pulse" />
          {buildHeadline(hasOrder, volumeCount, boxScanCount)}
        </div>
        <form onSubmit={submit}>
          <div className="scan-input-wrap">
            <Input
              ref={inputRef}
              className="scan-input"
              aria-label="Leitor de código (NF-e ou caixa)"
              placeholder={
                hasOrder ? "Bipe a caixa ou a NF-e…" : "Escaneie seu pedido aqui!"
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={scheduleRefocus}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
