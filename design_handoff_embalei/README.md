# Handoff: Embalei · Estação de Embalagem

## Overview
**Embalei** é uma estação de embalagem para operadores de centro de distribuição. O fluxo principal é:

1. Operador faz **login** escolhendo seu usuário, confirmando data de nascimento e selecionando uma estação física.
2. Em seguida, a tela de **embalagem** abre e o operador **bipa o cupom do pedido** com um leitor.
3. O sistema exibe a **caixa recomendada**, a **transportadora**, a **temperatura no destino**, um **GIF mostrando como colar a etiqueta** e a **lista de itens** do pedido (já pré-conferidos).
4. Ao terminar, o operador bipa o próximo pedido.

Existem duas telas: `Login.html` e `Embalagem.html` (rota principal).

---

## About the Design Files
Os arquivos neste pacote são **referências de design construídas em HTML/React+Babel inline** — protótipos que mostram o look, layout e comportamentos pretendidos. **Não devem ser copiados diretamente para produção.**

A tarefa é **recriar essas telas no ambiente do codebase alvo** (React + TypeScript com HeroUI, Next.js, Vite, etc.), usando os padrões e a biblioteca de componentes que já existem. Se o projeto ainda não tem um stack definido, recomendamos **React + TypeScript + HeroUI v3 + Tailwind**, pois o design foi inspirado no HeroUI Figma Kit.

---

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos, sombras, animações e estados estão definidos. O desenvolvedor deve reproduzir pixel-perfect usando os componentes do design system (HeroUI ou equivalente).

---

## Tech Stack Sugerido
- **React 18+ com TypeScript**
- **HeroUI v3** (`@heroui/react`) — para `Input`, `Select`, `Card`, `Button`, `Chip`, `Badge`, `Modal`, etc.
- **Tailwind CSS** com tokens customizados.
- **Framer Motion** para as animações da scanline, GIF de embalagem e barra lateral.
- **React Router** (ou Next.js App Router) para navegação Login → Embalagem.
- **React Query / TanStack Query** para os fetches de pedido, clima e estações disponíveis.
- **Fontes**: Inter (UI) e JetBrains Mono (códigos/SKU/temperatura).

---

## Screens / Views

### 1) `Login.html` — Tela de entrada

**Purpose:** identificar operador e estação antes de abrir a sessão.

**Layout:** Grid 2 colunas — `1fr 520px` em desktop. Colapsa para 1 coluna abaixo de 980px.

#### Coluna esquerda — "visual"
- Background escuro: `linear-gradient(180deg, #0b1220, #111827 60%, #0b1220)` com dois gradientes radiais azul/violeta nos cantos e um padrão sutil de grid (`linear-gradient` 48px).
- Padding `48px`.
- Conteúdo:
  - Logo **Embalei** (marca quadrada 38×38 com gradiente azul + nome em peso 800, `-0.02em`).
  - Eyebrow `JetBrains Mono`, `letter-spacing: 0.18em`, uppercase, 12px, `rgba(255,255,255,.55)`: "ESTAÇÃO DE EMBALAGEM".
  - **Headline** 44px (`-0.025em`, peso 700): "Bipa, embala e **manda ver.**" — última palavra com gradiente `#38bdf8 → #a5f3fc` em `background-clip: text`.
  - Parágrafo lede 16px, `rgba(255,255,255,.7)`, descrevendo o que a estação faz.
  - **Mini-scanner** ilustrativo (aspect 2.2:1): retângulo escuro com:
    - LED verde piscante (`@keyframes blink`, 1.8s).
    - Janela vermelha central com scanline animada (`@keyframes scan`, 2.4s — translateY ±30px).
    - Labels mono "SYM · LS2208" e "ONLINE".
  - Footer com versão e quantidade de estações ativas.

#### Coluna direita — formulário
- Background branco, `padding: 56px`, max-width do card `380px`.
- Title 26px peso 700 `-0.02em`: "Entrar na estação".
- Sub 14px `var(--ink-2)`: "Selecione seu usuário, confirme sua data de nascimento e escolha em qual estação você vai embalar hoje."

**Campos (ordem):**

1. **Usuário** — `<Select>`:
   - Label 12px peso 600 `var(--ink-2)`.
   - Ícone `User` (lucide / heroicons) à esquerda, chevron à direita.
   - Height 48px, radius 12px, border `1.5px solid #e6e7eb`.
   - Foco: borda `#006fee` + box-shadow `0 0 0 4px rgba(0,111,238,.12)`.
   - Opções: 6 operadores mockados — `{id, name, role}` (ex.: "Lara Mendes — Embaladora · turno tarde").
   - Erro: "Selecione um usuário."

2. **Data de nascimento** — `<Input type="date">`:
   - Mesmo styling do select. Ícone `Cake`.
   - `min="1940-01-01" max="2010-12-31"`.
   - Help text 12px `var(--ink-3)`: "Confirmação de identidade."
   - Erro: "Informe sua data de nascimento."

3. **Estação** — grid 2 colunas de cards:
   - Cada card: border `1.5px`, radius 12px, padding `12px 14px`, gap 10px, com:
     - Número da estação 32×32 em `JetBrains Mono` peso 800 dentro de um quadrado `var(--line-2)`.
     - Nome + sub (ex.: "Estação 03 · Refrigerados").
     - Bolinha de status à direita: verde (disponível) ou cinza (ocupada).
   - **Selecionado:** borda `var(--brand)`, background `#e6f1fe`, número branco em fundo `#006fee`, shadow `0 0 0 4px rgba(0,111,238,.10)`.
   - **Ocupada:** `opacity: .55`, `cursor: not-allowed`, não clica.
   - Help text: "Estações em cinza estão ocupadas por outros operadores."
   - Em <380px: grid colapsa para 1 coluna.

**Submit:**
- Botão 50px, radius 12px, background `var(--ink)` (#11181c), texto branco peso 700.
- Em loading: spinner 14×14 + texto "Abrindo estação…".
- Em validação: marca campos inválidos só após primeiro submit.
- Sucesso: redireciona para `Embalagem.html` após 700ms.

**Footer pequeno:** "Não consegue entrar? Fale com o supervisor." + link "Ajuda" em `var(--brand)`.

**Build line (rodapé absoluto):** `EMBALEI · STATION OS` à esquerda, `v3.4.1 · 2026` à direita, em `JetBrains Mono`.

---

### 2) `Embalagem.html` — Estação de embalagem

**Purpose:** receber bipagem de pedido, exibir contexto de embalagem e lista de itens já conferidos.

#### Top bar (sticky, 64px, fundo branco, border-bottom 1px)
- Logo Embalei + breadcrumbs: `Estação 03 / Embalagem / PED-XXXXX`.
- Chip de operador: bolinha verde com pulso + "Lara M. · turno tarde".
- Botão **"Novo pedido"** (ghost) — visível apenas quando há pedido.
- Botão **"SAIR"** vermelho danger — redireciona para `Login.html`.

#### Scan card (top do conteúdo)
Card branco com 2 colunas (`220px 1fr`):

**Coluna esquerda — Ilustração do leitor.** 3 variantes (tweakable):
- **A · Mesa**: retângulo preto com janela vermelha radial + scanline horizontal.
- **B · Pistola**: pistol-grip com cabeça angular, gatilho rotacionado -12deg, LED verde, feixe vermelho lendo um barcode.
- **C · Túnel**: barra superior com leque laser triangular descendo sobre uma caixa kraft com barcode.

Todas usam `JetBrains Mono` 10px com letter-spacing alto pro label do modelo.

**Coluna direita:**
- Headline (peso 700, 18px) com bolinha verde pulsante: "POR FAVOR, ESCANEIE O CUPOM DO PEDIDO NO LEITOR" (ou "PEDIDO CARREGADO · ESCANEIE O PRÓXIMO QUANDO TERMINAR").
- Input grande (height 56px, radius 14px, fonte mono 16px) com placeholder "Escaneie seu pedido aqui!".
- Stats chips abaixo:
  - "Hoje: **32** pedidos bipados"
  - "Hoje: **124** itens confirmados"
  - Cor do número: `var(--success)` #17c964.

#### Estado vazio
Quando nenhum pedido bipado:
- Card dashed, padding 56px, centralizado.
- Ícone `Package` em quadrado `var(--line-2)`.
- Heading "Aguardando bipagem do cupom".
- Texto "Encoste o cupom do pedido no leitor para começar."
- Botões pílula com sugestões de códigos demo (apenas para o protótipo — remover em produção).

#### Estado com pedido
Layout vertical:

**A) Grid de 4 cards de contexto** (em linha, `repeat(4, 1fr)`, gap 16px; colapsa para 2 colunas <1280px e 1 coluna <720px):

1. **Caixa recomendada**
   - Title eyebrow mono 12px `0.12em` uppercase: "CAIXA RECOMENDADA".
   - Ilustração SVG 3D isométrica de caixa kraft (cores: top `#d4a574`, faces `#b8895a`/`#a07444`, stroke `#9a6e3f`).
   - Nome (peso 700, 16px) + dimensões em `JetBrains Mono` 13px.
   - Barra de ocupação: faixa 6px com preenchimento azul `var(--brand)` + percentual.

2. **Transportadora**
   - Logo quadrado 56×56, radius 12px, gradiente da cor da transportadora, letra inicial branca peso 800 22px.
   - Nome 16px peso 700 + serviço 13px `var(--ink-2)` + **ETA** mono 12px.

3. **Temperatura no destino**
   - **Mostrador analógico circular** 92×92:
     - `conic-gradient(from 220deg, #0ea5e9 0%, #38bdf8 20%, #fbbf24 60%, #ef4444 100%)`.
     - Anel branco interno (`inset: 8px`).
     - Ponteiro 3×38px preto rotacionado conforme valor (mapeado de -10..40°C para -120deg..120deg).
   - Número 32px mono peso 700 + °C em 18px `var(--ink-3)`.
   - Cidade em peso 600 + condição em 12px `var(--ink-3)`.
   - Linha de recomendação com ícone tematizado (frio/quente/temperado).

4. **Como colar a etiqueta** (com GIF animado)
   - Eyebrow mono "COMO COLAR A ETIQUETA" com ícone Play.
   - Frame 16:10 escuro com:
     - Caixa kraft em perspectiva (rotateX 28deg).
     - Etiqueta branca caindo e grudando: `@keyframes stick` 3s — entra do topo direita, rotaciona até zero e fica.
     - Labels "GIF · ETIQUETA" e "LIVE" (mono 10px) nos cantos.
     - Stepper de 4 barras com a última ativa (passo 4/4).
   - Caption: "**Passo 4** · Cole na face superior, centralizada" + "04 / 04".

**B) Card de pedido (full width abaixo dos 4 cards)**

- **Header colapsável (cursor pointer, hover background `var(--line-2)`):**
  - Chevron 32×32 quadrado à esquerda, rotaciona 180deg quando aberto.
  - PID em mono 28px peso 700 com prefixo "PED-" em `var(--ink-3)`.
  - Meta linha: `<b>Mariana Cordeiro</b> · Curitiba · PR · Hoje, 09:24`.
  - Badges à direita:
    - "⚡ Expresso" amarelo (`bg #fef4e4 color #a36500`) — só se prioridade=express.
    - "5 itens · 8 unidades" azul (`bg #e6f1fe color #006fee`).
    - "✓ Tudo bipado" verde (`bg #e8faf0 color #0c8242`) — sempre, já que pré-conferido.

- **Lista de itens (visível quando colapse aberto):**
  - Grid `72px 1fr auto`, padding `14px 22px`, border-bottom `var(--line-2)`.
  - Cada item tem **fundo verde claro** (`linear-gradient(90deg, rgba(23,201,100,.06), transparent 60%)`) pois inicia confirmado.
  - **Foto** 72×72 radius 12px com placeholder colorido (linear-gradient da cor temática do produto + label mono 10px uppercase tipo "CHÁ", "IOG", "MEL").
  - **Meta**: nome 15px peso 600 + SKU mono 12px + tags pequenas ("refrigerado" azul claro, "frágil" amarelo claro).
  - **Quantidade pill** (direita): pill verde `var(--success)` com texto branco peso 700 16px tipo `2×`.

#### Toasts
Bottom-center, fundo `#0f172a`, texto branco, radius 12px, sombra. Variantes:
- Success: `bg #06723a`
- Warn: `bg #92400e`
- Error: `bg #9f1239`
Animação de entrada: `translateY(8px)` → `translateY(0)`, 250ms.

---

## Interactions & Behavior

### Login
- Validação dispara apenas após primeiro submit (não em tempo real).
- Estações ocupadas têm `pointer-events: none` via `disabled` no botão.
- Sucesso → loading 700ms → `window.location.href = "Embalagem.html"`.

### Embalagem
- Input de scan **não toma foco automaticamente** (foi explicitamente desabilitado).
- Ao submeter um código:
  - Se for um código de pedido válido → carrega pedido com **todos os itens já marcados como confirmados** (pré-conferência).
  - Se for um SKU de item do pedido atual → incrementa o picked desse item.
  - Caso contrário → toast de erro "Pedido X não encontrado".
- Clicar num item incrementa manualmente o picked daquele item.
- Header do pedido é colapse (toggle on click).
- "Novo pedido" e "SAIR" no topbar: o primeiro limpa o estado, o segundo redireciona pro login após 600ms.

### Animações
- Scanline laser: 2.2s ease-in-out infinite.
- Pulso verde do "ONLINE": 1.6s.
- Etiqueta caindo: 3s, com fases 0→35%→55%→90%.
- Toast: 250ms ease-out.
- Chevron de colapse: 200ms transform.

### Responsividade
- Topbar: breadcrumbs somem <1180px, station chip <900px, logo-texto <640px.
- Scan card: vira 1 coluna <1100px.
- Grid de info: 4 cols → 2 cols <1280px → 1 col <720px.
- Lista de itens: foto reduzida para 56×56 <900px.

---

## State Management

### Login (`Login.html`)
```ts
{ user: string, dob: string, station: number | null, submitted: boolean, loading: boolean }
```

### Embalagem (`Embalagem.html`)
```ts
{
  orderCode: string | null,
  picks: { [itemId: number]: number },  // quantidade já bipada por item
  stats: { products: number, orders: number },
  toasts: { id, msg, kind }[],
  itemsOpen: boolean,                    // colapse do header de pedido
  tweaks: { density, accent, scanner }   // só no protótipo
}
```

Em produção, trocar por:
- **React Query** para `useOrder(code)`, `useTemperature(city)`, `useStations()`, `useOperators()`.
- **Zustand / Context** para sessão (operador + estação selecionada) e fila de toasts.
- Mutation `confirmOrder(code)` para fechar pedido.

---

## Design Tokens

### Cores
```css
--bg:          #f6f6f7;
--panel:       #ffffff;
--ink:         #11181c;   /* texto principal */
--ink-2:       #51565d;   /* texto secundário */
--ink-3:       #889096;   /* texto auxiliar / placeholders */
--line:        #e6e7eb;   /* borda padrão */
--line-2:      #eef0f3;   /* divider / pill background */

--brand:       #006fee;   /* azul HeroUI padrão (também pode ser violet/pink/green) */
--brand-50:    #e6f1fe;
--success:     #17c964;
--success-50:  #e8faf0;
--warn:        #f5a524;
--warn-50:     #fef4e4;
--danger:      #f31260;
--danger-50:   #fee7ef;
--cold:        #0ea5e9;
--cold-50:     #e0f4fd;
```

### Tipografia
- Body: `Inter` 400/500/600/700/800.
- Mono: `JetBrains Mono` 400/500.
- Escala: 11, 12, 13, 14, 15, 16, 18, 22, 26, 28, 32, 44px.
- Eyebrow style: mono 12px, `letter-spacing: 0.12em`, uppercase.

### Espaçamento
- Stage padding: 28px (16px mobile).
- Card padding: 18–22px.
- Gap principal entre cards: 16–24px.
- Item row padding: 14px 22px (10–12px em compact/mobile).

### Radii
```css
--r-sm: 8px;
--r:    12px;
--r-lg: 16px;
--r-xl: 22px;
```

### Sombras
```css
--shadow:    0 1px 2px rgba(17,24,28,.04), 0 6px 20px rgba(17,24,28,.06);
--shadow-lg: 0 12px 40px rgba(17,24,28,.10);
```

---

## Mock Data
6 operadores, 6 estações (2 ocupadas), 3 pedidos demo:
- `PED-48217` — Mariana Cordeiro · Curitiba · 5 itens · normal · Loggi Express · 14°C.
- `PED-99014` — Heitor Sampaio · Salvador · 3 itens · **expresso** · Jadlog · 31°C.
- `PED-73650` — Renata Yoshida · Porto Alegre · 4 itens · normal · Total Express · 9°C.

Estrutura de pedido completa está em `data.jsx`.

---

## Assets
- **Fontes**: Google Fonts — Inter + JetBrains Mono.
- **Ícones**: inline SVG (substituir por `lucide-react` ou `@heroicons/react` no codebase).
- **Imagens de produto**: placeholders gerados em CSS (gradiente + label mono). Em produção, devem vir do catálogo de SKU.
- **GIFs**: por enquanto **animações CSS**; em produção, considerar:
  - Vídeos `.mp4` curtos sem som, ou
  - Animações Lottie (`@lottiefiles/react-lottie-player`), ou
  - WebP animado.
- **Logo Embalei**: usa-se a marca quadrada com letra "E" e gradiente azul; substituir pelo logo final do cliente.

---

## Files
- `Login.html` — tela de login completa (single file com React inline + CSS).
- `Embalagem.html` — shell HTML com CSS da tela de embalagem.
- `app.jsx` — componentes React da tela de embalagem (TopBar, ScanStrip, ScannerIllus, OrderDetail, ItemRow, PackingGif/LabelGif, BoxCard, CarrierCard, TempCard, Toasts).
- `data.jsx` — dados mockados (`window.ORDERS`).
- `tweaks-panel.jsx` — painel de tweaks do protótipo (apenas dev tooling — **não portar para produção**).

---

## Notas finais para o dev
- Os Tweaks são apenas instrumentação de protótipo; remover na implementação.
- O foco automático no input de scan **está desligado de propósito** — não reativar sem confirmar com produto.
- A ideia do "tudo verde por padrão" é refletir que o pedido já foi conferido na separação; o embalador só confirma a embalagem.
- HeroUI v3: usar `Select`, `Input`, `Card`, `Chip`, `Button`, `Tooltip`. As cores semânticas do HeroUI mapeiam diretamente para os tokens listados acima.
