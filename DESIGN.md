# Design System — Plantão

## Product Context
- **What this is:** PWA mobile de anotações de enfermagem para uso durante plantão hospitalar. Gera textos formatados prontos para copiar no sistema do hospital.
- **Who it's for:** Técnicos de enfermagem usando o celular pessoal durante o plantão — sob pressão, frequentemente com uma mão, em ambientes com iluminação variável.
- **Space/industry:** Health tech / workflow tools para equipes de enfermagem no Brasil.
- **Project type:** PWA mobile-first (max-width 480px, single column).

## Aesthetic Direction
- **Direction:** Industrial/Clínico — Precision Dark
- **Decoration level:** Minimal — tipografia e espaçamento fazem todo o trabalho. Nenhum ornamento. Cada elemento justificado pela função.
- **Mood:** Confiável como um equipamento hospitalar. Rápido como uma ferramenta profissional. Discreto o suficiente para não distrair durante um plantão real.
- **Reference sites:** N/A — sistema desenvolvido a partir da vivência do fundador como técnico de enfermagem.

## Typography
- **Display/Hero (app title):** DM Sans 700 — humanista, profissional, diferencia o app de soluções genéricas
- **Body:** DM Sans 400/500 — legível em telas pequenas, não cansa em sessões longas
- **UI/Labels:** DM Sans 600, uppercase, letter-spacing 0.04em — hierarquia clara sem gritar
- **Data/Tables:** DM Sans 400, tabular-nums — para horários e dados numéricos
- **Code:** N/A (nenhuma interface de código no app)
- **Loading:** Google Fonts CDN — `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap`
- **Scale:**
  ```
  --text-xs:   0.75rem  / 12px  — hints, badges, meta
  --text-sm:   0.85rem  / 13.6px — labels, hints, botões small
  --text-base: 1rem     / 16px  — corpo, inputs, botões
  --text-lg:   1.1rem   / 17.6px — header do app, card titles
  --text-xl:   1.25rem  / 20px  — section headers
  --text-2xl:  1.5rem   / 24px  — títulos de tela
  --text-3xl:  2rem     / 32px  — hero (não usado atualmente)
  ```

## Color
- **Approach:** Restrained — 1 acento principal (azul) + neutros escuros + semânticos. Cor é rara e significativa.

### Backgrounds
```css
--bg:          #0A1628;  /* fundo base — navy profundo */
--bg-card:     #111d32;  /* cards, headers, bottom nav */
--bg-input:    #162033;  /* inputs, radio/checkbox background */
--bg-hover:    #1a2844;  /* hover state, btn-secondary */
```

### Brand / Primary Action
```css
--blue:        #1E88E5;  /* ação primária, foco, links */
--blue-dark:   #1565C0;  /* active state do btn-primary */
--blue-muted:  rgba(30, 136, 229, 0.12);  /* background de badges/highlights */
```

### Text
```css
--text:        #EAEEF3;  /* texto principal */
--text-dim:    #8899AA;  /* texto secundário, labels */
--text-muted:  #556677;  /* hints, placeholders, meta */
```

### Semantic
```css
--danger:         #E53935;              /* erros, excluir, urgente */
--danger-muted:   rgba(229, 57, 53, 0.1);
--success:        #43A047;              /* confirmação, copiado, sincronizado */
--success-muted:  rgba(67, 160, 71, 0.1);
--warning:        #FFC107;              /* avisos não-críticos (FCM inativo, modo privado) */
--warning-muted:  rgba(255, 193, 7, 0.1);
--info:           #29B6F6;              /* informativo neutro */
--info-muted:     rgba(41, 182, 246, 0.1);
```

### Structure
```css
--border:      #1e3050;  /* bordas sutis */
```

### Dark mode
Modo escuro é o padrão e o modo principal. Não há modo claro implementado no app. Se implementado futuramente: superfícies substituem navy por off-whites frios (#F0F4F8, #FFFFFF), texto inverte para #0D1B2A, saturação do azul reduz 10%.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — botões com min-height 52px (ação primária), 44px (secundário/ghost). Touch targets generosos para uso com luvas ou sob pressão.
- **Scale:**
  ```
  --space-2xs:  2px
  --space-xs:   4px
  --space-sm:   8px
  --space-md:   16px
  --space-lg:   24px
  --space-xl:   32px
  --space-2xl:  48px
  --space-3xl:  64px
  ```
- **Padrões de uso:**
  - Gap entre chips/buttons: 8px (--space-sm)
  - Padding de cards: 20px (entre --space-md e --space-lg)
  - Padding de inputs: 13px 14px (≈ --space-md)
  - Margin-bottom entre campos: 20px
  - Padding de página (container): 16px horizontal

## Layout
- **Approach:** Mobile-first single column — sem alternativa para uso hospitalar com uma mão
- **Grid:** Coluna única em toda a app
- **Max content width:** 480px (`.container { max-width: 480px }`)
- **Border radius:**
  ```
  --radius:      10px   /* inputs, chips, botões, cards menores */
  --radius-lg:   16px   /* cards principais, toasts */
  --radius-full: 9999px /* chips, badges, botões pill */
  ```
- **Safe areas:** `env(safe-area-inset-bottom)` — sempre respeitado no bottom nav e em banners na base da tela

## Motion
- **Approach:** Minimal-functional — apenas transições que auxiliam compreensão de estado
- **Easing:**
  ```
  enter: ease-out (cubic-bezier(0, 0, 0.2, 1))
  exit:  ease-in  (cubic-bezier(0.4, 0, 1, 1))
  move:  ease-in-out (cubic-bezier(0.4, 0, 0.2, 1))
  ```
- **Duration:**
  ```
  micro:  75ms   — micro-interações (feedback imediato)
  short:  200ms  — padrão — hover, focus, botões, border-color
  medium: 300ms  — modais, bottom-sheets
  long:   500ms  — toasts, transições de página
  ```
- **Regras:**
  - Nunca animar layout (layout shift = distração em ambiente hospitalar)
  - `transform: scale(0.98)` no active de btn-primary — feedback tátil mínimo
  - Toast: fade + translate, 200ms enter / 200ms exit

## Componentes — Padrões Estabelecidos

### Botões
```
btn-primary   — azul sólido, ação principal, min-height 52px, width 100%
btn-secondary — bg-hover + border, ação secundária
btn-danger    — danger sólido, ações destrutivas
btn-ghost     — transparente + border, ações terciárias, min-height 44px, width auto
btn-sm        — padding reduzido (6px 14px), font 0.82rem
```

### Formulários
```
.campo > label   — uppercase, 0.9rem, font-weight 600, text-dim
.campo > input   — bg-input, border border, padding 13px 14px, radius 10px
focus state      — border-color: blue
invalid state    — border-color: danger (classe .invalido no .campo pai)
```

### Chips
```
.chip     — estado off: bg-input + border + text-dim
.chip-on  — estado on: blue sólido + white, font-weight 600
```

### Alertas / Avisos
Usar classes semânticas, não cores hardcoded:
```
aviso de modo privado  → background: blue-muted, border: blue rgba(0.25)
aviso FCM inativo      → background: warning-muted, border: warning rgba(0.3)
erro de sincronização  → background: danger-muted, border: danger rgba(0.3)
info de carregamento   → background: info-muted, border: info rgba(0.3)
```

### Bottom Navigation
```
background: bg-card
border-top: 1px solid border
padding-bottom: safe-area-inset-bottom
ativo: color blue
inativo: color text-muted
```

## Acessibilidade
- Touch targets mínimos: 44px height (botões ghost, nav items), 52px (btn-primary)
- Contraste: texto (#EAEEF3) sobre bg-card (#111d32) → ratio ≈ 11:1 ✓
- Contraste azul (#1E88E5) sobre bg (#0A1628) → ratio ≈ 4.8:1 ✓ (AA)
- Inputs: font-size mínimo 16px para evitar zoom automático no iOS
- Modais: `role="dialog"`, `aria-modal="true"`, `aria-label`, fecha com Escape
- `-webkit-text-size-adjust: 100%` no html para evitar reflow em rotação

## Responsividade
App é exclusivamente mobile. Comportamento em telas maiores:
- Container centralizado com max-width 480px
- Fundo bg preenche o restante da viewport
- Nenhum layout responsivo com breakpoints — layout de coluna única em todas as larguras

## Anti-patterns — Nunca fazer
- Gradientes roxos/violetas como acento (off-brand, não clínico)
- Cores hardcoded fora dos tokens (usar sempre `var(--token)`)
- Grid de 3 colunas com ícones em círculos coloridos (AI slop)
- Hero sections genéricas
- `new Notification()` diretamente (Android ignora em background — usar FCM/service worker)
- Cachear rotas Firebase no service worker (dados são tempo real)
- `font-size` abaixo de 16px em inputs (dispara zoom no iOS)
- Min-height abaixo de 44px em elementos interativos

## Decisions Log

| Data       | Decisão                                         | Rationale |
|------------|------------------------------------------------|-----------|
| 2026-03-21 | Sistema criado via /design-consultation        | Formaliza o de-facto design system existente em style.css |
| 2026-03-21 | DM Sans como typeface única                    | Humanista, diferencia de Inter/Roboto do mercado de saúde, ótima legibilidade mobile |
| 2026-03-21 | Navy #0A1628 como background                   | Reduz fadiga ocular em plantões noturnos, identidade visual própria |
| 2026-03-21 | --blue #1E88E5 como único acento               | Convenção de UX de saúde para ação primária, contraste AA sobre o navy |
| 2026-03-21 | Adicionado --warning #FFC107                   | Aviso de FCM inativo e modo privado usavam rgba hardcoded — formalizado |
| 2026-03-21 | Adicionado --info #29B6F6                      | Token complementar ao warning para estados informativos |
| 2026-03-21 | Spacing base 8px formalizado                   | Já era o padrão implícito no código — documentado explicitamente |
| 2026-03-21 | Touch targets: 44px mínimo / 52px ações principais | Uso com luvas e sob pressão em ambiente hospitalar |
