# Bipagem em coletor / mobile sem abrir o teclado virtual

Guia prático para integrar **scanner de coletor de dados (Zebra, Honeywell, Datalogic, Urovo, etc.) em uma web app** sem que o teclado virtual do Android abra a cada bipagem ou toque na tela.

## Problema

Coletores industriais com scanner integrado funcionam como **teclado HID via IME do Android**: o scanner "digita" os caracteres dentro do input focado e termina com `Enter`.

Isso cria três conflitos clássicos numa web app:

1. **O teclado virtual abre junto** com o foco do input — operador perde metade da tela.
2. **Tentar suprimir o teclado quebra o scanner**:
   - `readonly` → input ignora `keydown`.
   - `inputmode="none"` → em vários coletores o Android decide "não engajar IME" e o scanner para de enviar caracteres.
   - `tabindex` em `<div>` → coletor só envia teclas pra `<input>` reais.
3. **Qualquer toque na tela reabre o teclado**, mesmo com o input já focado, porque o Android trata tap em input focado como "usuário quer digitar".

## Solução: arming pattern + VirtualKeyboard API

A técnica combina três coisas:

1. **VirtualKeyboard API** (Chrome 94+ Android) para esconder o teclado de forma declarativa.
2. **`inputmode="none"` aplicado só durante o foco**, removido logo após — o Android decide não abrir o teclado no momento do `focus()`, mas o input volta ao modo normal a tempo de receber os caracteres do scanner.
3. **Listeners globais de toque** que re-armam o input sempre que o usuário toca na tela.

### Implementação completa (React + TS)

```tsx
import { useCallback, useEffect, useRef, useState } from "react";

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

interface Props {
  onScan: (code: string) => void;
}

export function ScannerInput({ onScan }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const refocusTimer = useRef<number | null>(null);
  const [value, setValue] = useState("");

  // Esconde o teclado virtual via API nativa do Chrome.
  // Repete por alguns frames porque algumas navegações abrem o teclado
  // antes da chamada hide() ser processada.
  const hideVirtualKeyboard = useCallback(() => {
    const vk = getVirtualKeyboard();
    if (!vk) return;
    vk.overlaysContent = true;
    vk.hide?.();
    window.setTimeout(() => vk.hide?.(), 50);
    window.setTimeout(() => vk.hide?.(), 200);
  }, []);

  // Sequência de "arming":
  // 1. Aplica inputmode="none" -> Android decide não abrir o IME no foco.
  // 2. Foca o input.
  // 3. Após 250ms, remove inputmode -> input volta ao modo normal e o
  //    scanner consegue entregar os caracteres.
  const armScannerInput = useCallback(() => {
    const el = inputRef.current;
    if (!el || !el.isConnected || document.visibilityState !== "visible") return;
    el.setAttribute("inputmode", "none");
    hideVirtualKeyboard();
    try {
      el.focus({ preventScroll: true });
    } catch {
      /* foco indisponível neste instante — ignora */
    }
    hideVirtualKeyboard();
    window.setTimeout(() => {
      el.removeAttribute("inputmode");
      hideVirtualKeyboard();
    }, 250);
  }, [hideVirtualKeyboard]);

  const scheduleRefocus = useCallback(() => {
    if (refocusTimer.current !== null) window.clearTimeout(refocusTimer.current);
    refocusTimer.current = window.setTimeout(() => {
      refocusTimer.current = null;
      armScannerInput();
    }, 0);
  }, [armScannerInput]);

  useEffect(() => {
    armScannerInput();

    // Volta da aba: refoca + esconde teclado.
    const onVisibility = () => {
      if (document.visibilityState === "visible") armScannerInput();
    };

    // Tap em qualquer lugar pode reabrir o teclado. Re-armamos sempre.
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
    armScannerInput();
  };

  return (
    <form onSubmit={submit} className="scan-form-hidden">
      <input
        ref={inputRef}
        className="scan-input-hidden"
        aria-label="Leitor de código"
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
  );
}
```

### CSS pra esconder o input

```css
.scan-form-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.scan-input-hidden {
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
```

## Pontos-chave que aprendi tentando

| Tentativa | Resultado |
|---|---|
| `<input readonly>` | Sem teclado, mas input ignora `keydown` do scanner. ❌ |
| `<input inputmode="none">` permanente | Sem teclado, mas alguns coletores param de enviar (Android não engaja IME). ❌ |
| `<div tabIndex={0}>` focável | Sem teclado (não é input), mas coletor só entrega pra `<input>` reais. ❌ |
| Listener global de `keydown` no `window` | Coletor não emite via `dispatchEvent` global, só via IME no input focado. ❌ |
| `inputmode="none"` aplicado só no momento do foco, removido 250ms depois | ✅ Funciona. Teclado não abre, scanner entrega. |
| + `navigator.virtualKeyboard.hide()` | ✅ Reforço pra Chrome Android 94+. |
| + listener `pointerdown`/`touchstart` re-armando | ✅ Cobre o caso "toquei na tela e o teclado voltou". |

## Limitações

1. **Não é 100% universal.** A técnica depende de:
   - Coletor em modo **Keyboard Wedge** (saída como teclado), com **sufixo Enter** configurado.
   - Browser baseado em Chromium (Chrome / WebView).
   - VirtualKeyboard API (Chrome 94+).
2. **Coletores em modo Intent/Broadcast (DataWedge sem keyboard wedge)** não entregam via teclado nenhum — é preciso PWA/TWA + receiver nativo, ou app nativo.
3. **Coletores muito antigos** podem ignorar `inputmode="none"` no foco e abrir o teclado mesmo assim. Nesse caso, recurso final: **desativar o teclado virtual do Android** (Configurações → Sistema → Idiomas e entrada → Teclado virtual → desativar Gboard). É o setup recomendado de fábrica para coletor de operação.
4. **Foco programático no primeiro mount** pode falhar em alguns browsers mobile sem gesto do usuário. Se acontecer, adicione um botão "Toque para ativar o leitor" que chama `armScannerInput()` no `onClick`.
5. **Submit por `Enter` exige** que o scanner esteja configurado pra emitir CR (0x0D) ou Enter como sufixo. Sem isso, dá pra trocar pra auto-submit por timeout (~80ms de silêncio entre teclas indica fim do bip).

## Checklist pra reusar em outra app

- [ ] Copiar o componente acima.
- [ ] Garantir CSS de input escondido (`scan-input-hidden` + `scan-form-hidden`).
- [ ] Validar o coletor está em **Keyboard Wedge** com **sufixo Enter**.
- [ ] Testar no dispositivo real: bipar, navegar entre rotas, tocar em diferentes áreas da tela. Teclado não pode aparecer em nenhuma situação.
- [ ] Fallback: se o teclado ainda aparecer no dispositivo do cliente, instruir desativação do teclado virtual no Android.

## Referências

- [VirtualKeyboard API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API)
- [Input `inputmode` (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
- Zebra DataWedge: [Keystroke Output](https://techdocs.zebra.com/datawedge/latest/guide/output/keystroke/)
