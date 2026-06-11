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
  if (!hasOrder) return "ESCANEIE A CHAVE DA NOTA";
  if (boxScanCount >= volumeCount && volumeCount > 0)
    return "BIPE A NF-E PARA FINALIZAR";
  if (volumeCount > 1)
    return `BIPE A CAIXA · ${boxScanCount}/${volumeCount} VOLUMES`;
  return "BIPE A CAIXA USADA";
}

interface VirtualKeyboardLike {
  overlaysContent?: boolean;
  hide?: () => void;
  show?: () => void;
}

function getVirtualKeyboard(): VirtualKeyboardLike | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { virtualKeyboard?: VirtualKeyboardLike };
  return nav.virtualKeyboard ?? null;
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

  const hideVirtualKeyboard = useCallback(() => {
    const vk = getVirtualKeyboard();
    if (!vk) return;
    vk.overlaysContent = true;
    // Algumas navegações trazem o teclado aberto antes do hide aplicar.
    // Repetimos por alguns frames para garantir que ele feche.
    vk.hide?.();
    window.setTimeout(() => vk.hide?.(), 50);
    window.setTimeout(() => vk.hide?.(), 200);
  }, []);

  const focusInput = useCallback(() => {
    const el = inputRef.current;
    if (!el || !el.isConnected || document.visibilityState !== "visible") return;
    try {
      hideVirtualKeyboard();
      el.focus({ preventScroll: true });
      hideVirtualKeyboard();
    } catch {
      /* foco indisponível neste instante — ignora */
    }
  }, [hideVirtualKeyboard]);

  const scheduleRefocus = useCallback(() => {
    if (refocusTimer.current !== null) window.clearTimeout(refocusTimer.current);
    refocusTimer.current = window.setTimeout(() => {
      refocusTimer.current = null;
      focusInput();
    }, 0);
  }, [focusInput]);

  // Sequência de mount/retomada: setamos inputmode="none" antes de focar para
  // o Android NÃO abrir o teclado virtual. Logo após o foco, restauramos
  // inputmode normal — o scanner do coletor volta a entregar os caracteres.
  const armScannerInput = useCallback(() => {
    const el = inputRef.current;
    if (!el || !el.isConnected || document.visibilityState !== "visible") return;
    el.setAttribute("inputmode", "none");
    hideVirtualKeyboard();
    try {
      el.focus({ preventScroll: true });
    } catch {
      /* ignora */
    }
    hideVirtualKeyboard();
    window.setTimeout(() => {
      el.removeAttribute("inputmode");
      hideVirtualKeyboard();
    }, 250);
  }, [hideVirtualKeyboard]);

  useEffect(() => {
    armScannerInput();

    const onVisibility = () => {
      if (document.visibilityState === "visible") armScannerInput();
    };
    // Qualquer toque na tela pode reabrir o teclado (Android abre o IME ao
    // tocar num input focado). Re-armamos sempre após o toque.
    const onPointer = () => {
      window.setTimeout(armScannerInput, 0);
    };
    window.addEventListener("focus", armScannerInput);
    window.addEventListener("pageshow", armScannerInput);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("touchstart", onPointer, true);
    return () => {
      window.removeEventListener("focus", armScannerInput);
      window.removeEventListener("pageshow", armScannerInput);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("touchstart", onPointer, true);
      if (refocusTimer.current !== null) {
        window.clearTimeout(refocusTimer.current);
        refocusTimer.current = null;
      }
    };
  }, [armScannerInput]);

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
        <form onSubmit={submit} className="scan-form-hidden">
          <Input
            ref={inputRef}
            className="scan-input-hidden"
            aria-label="Leitor de código (NF-e ou caixa)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={scheduleRefocus}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            tabIndex={-1}
          />
        </form>
      </div>
    </div>
  );
}
