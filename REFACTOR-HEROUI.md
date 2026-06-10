# Refatoração HeroUI v3 — CONCLUÍDA (2026-05-19)

Status: **feita e validada** (`npm run build` verde; ambas as rotas respondem 200
em runtime, SSR renderiza os componentes HeroUI, sem erros de hidratação).

## O que mudou

- **Upgrade obrigatório:** React 18.3.1 → 19, Next 14 → 15, + Tailwind v4
  (`@tailwindcss/postcss` em `postcss.config.mjs`) + `@heroui/styles`/`@heroui/react`
  (HeroUI v3 exige React 19 + Tailwind v4).
- **Tema:** `src/app/globals.css` agora importa `tailwindcss` e `@heroui/styles`;
  o bloco `:root` mapeia os tokens Embalei (`--brand`→`--accent`, `--success`,
  `--warn`→`--warning`, `--danger`, raios, sombras) para o tema HeroUI, então os
  primitivos ficam visualmente próximos do design original (não o tema default).
  `<html class="light" data-theme="light">` em `layout.tsx`.
- **Login:** `<select>` → `Select`+`ListBox` (trigger tematizado via
  `.hero-select-trigger`); `<input date>` → `Input`; cards de estação →
  `ToggleButton`; botão → `Button` (estado `isPending`/`isDisabled`).
- **Embalagem:** botões da topbar → `Button`; `scan-input` → `Input`;
  badges → `Chip`; sistema de toast custom → `toast()` + `<Toast.Provider />`.
- Classes CSS originais foram mantidas nos componentes HeroUI; como o CSS custom
  é *unlayered* ele vence o `@layer components` do HeroUI, preservando o visual.

## Decisões / desvios do plano original

- **Painéis (`.panel`) NÃO viraram `Card`**: são contêineres de layout com
  conteúdo bespoke (SVG da caixa, dial de temperatura); `Card` (compound
  Header/Content) mudaria o DOM e arriscaria o grid sem ganho visual.
- **`DatePicker` não usado**: a composição v3 (`@internationalized/date` +
  `DateField`/`Calendar`) afastaria do visual atual; mantido `Input type="date"`.
- Ilustrações bespoke mantidas em CSS puro: `ScannerIllus`, `LabelGif`,
  dial do `TempCard`, SVG do `BoxCard`, scanline.
- `src/components/embalagem/Toasts.tsx` removido (morto após o `toast` HeroUI).
  A interface `Toast` em `src/types.ts` ficou sem uso (mantida, inócua).

## Verificação visual pendente (manual)

Build/runtime OK, mas conferência pixel é no navegador: `npm run dev` e revisar
`/` e `/embalagem` — em especial o trigger do `Select`, o popover da lista,
o foco dos inputs e o estilo dos toasts HeroUI.
