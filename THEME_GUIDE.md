# 🎨 Guia de Temas (Design System)

Este aplicativo utiliza um sistema de temas dinâmico injetado via CSS Variables (`:root`) gerenciado pelo arquivo `src/composables/useTheme.js`.

**É terminantemente proibido o uso de cores hexadecimais, RGB, RGBA, color literals (white/black) ou box-shadows fixos** nos blocos `<style scoped>`. O `:root` do CSS serve apenas para estrutura (ex: `--radius`), cores pertencem exclusivamente ao `useTheme.js`.

---

## 🔤 Dicionário de Variáveis

### 1. Fundos
| Variável | Onde usar |
|----------|-----------|
| `--bg` | Fundo principal da aplicação |
| `--bg-card` | Fundo de elementos elevados (modais, cartões principais) |
| `--bg-input` | Fundo de elementos interativos (caixas de texto, botões secundários, chips) |
| `--bg-hover` | Fundo para hover ou itens ativos |

### 2. Destaques (Acentos)
| Variável | Onde usar |
|----------|-----------|
| `--blue` | Cor principal do tema (botões primários, links, destaque) |
| `--blue-dark` | Variação escura/saturada para `:active` |
| `--blue-muted` | Fundo translúcido (badges, tags, toggle ativo) |
| `--blue-faint` | Fundo translúcido muito suave |

### 3. Tipografia e Bordas
| Variável | Onde usar |
|----------|-----------|
| `--text` | Texto principal (alto contraste) |
| `--text-dim` | Texto secundário (subtítulos, labels) |
| `--text-muted` | Texto terciário (placeholders, dicas, hints) |
| `--text-on-accent` | Cor do texto sobreposto à cor destaque (ex: texto do botão primário) |
| `--border` | Cor padrão para bordas e divisórias |

### 4. Tokens Semânticos
| Variável | Onde usar |
|----------|-----------|
| `--danger` | Erros, validações, botão deletar, offline |
| `--success` | Mensagens de sucesso, confirmações |
| `--warning` | Alertas, avisos |
| `--info` | Informações, dicas |

### 5. Sombras (Shadows)
| Variável | Onde usar |
|----------|-----------|
| `--shadow-sm` | Elevação leve (chips, pequenos botões, radio checked) |
| `--shadow-md` | Elevação média (botões principais como `.btn-generate`) |
| `--shadow-lg` | Elevação alta (cards, painéis, bottom nav) |
| `--shadow-modal` | Elevação máxima (modais, overlays, toasts) |

---

## 🎯 Temas Disponíveis (12)

### 🌙 Temas Escuros (6)
| Tema | Acabamento | Fundo | Card | Destaque |
|------|-----------|-------|------|----------|
| **Noturno** | Azul escuro clássico | `#0A1628` | `#111d32` | `#1E88E5` |
| **Carbono** | Cinza/preto minimalista | `#0f0f12` | `#1a1a1f` | `#00bcd4` |
| **Cobalto** | Azul marinho profundo | `#070d1f` | `#0d1530` | `#2979ff` |
| **Ametista** | Roxo escuro envolvente | `#1a1028` | `#241638` | `#b388ff` |
| **Grafite** | Cinza azulado frio | `#16161a` | `#222228` | `#7a8ba8` |
| **Vinho** | Borgonha elegante | `#1c0e12` | `#28151b` | `#c25a6c` |

### ☀️ Temas Claros (6)
| Tema | Acabamento | Fundo | Card | Destaque |
|------|-----------|-------|------|----------|
| **Rosa** | Rosa vibrante | `#fce4ec` | `#fff5f7` | `#e84f7a` |
| **Pérola** | Cinza azulado suave | `#edf2f7` | `#FFFFFF` | `#5b7fa5` |
| **Floresta** | Verde sálvia fresco | `#ECF8F4` | `#FFFFFF` | `#229E87` |
| **Lavanda** | Lilás suave | `#F2EEFA` | `#FFFFFF` | `#7A5CCF` |
| **Pêssego** | Coral alaranjado | `#fef2ed` | `#FFFFFF` | `#e8825a` |
| **Areia** | Bege quente neutro | `#FAF6F0` | `#FFFFFF` | `#C8A566` |


---

## 🛠️ Como Usar no Código

### No CSS global (`style.css`)
Sempre use `var(--variavel)`:
```css
.btn-primary {
  background: var(--blue);
  color: var(--text-on-accent);
}
```

### No `<style scoped>` de componentes
```css
.minha-classe {
  background: var(--bg-card);
  color: var(--text-dim);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
```

### Gradientes com variáveis
```css
background: linear-gradient(180deg, var(--blue-faint), var(--blue-muted));
```

### Cores semânticas
```css
.erro { color: var(--danger); }
.sucesso { color: var(--success); }
```

### RGBA → color-mix (nunca use rgba fixo)
```css
/* ❌ RUIM */
background: rgba(239, 83, 80, 0.12);

/* ✅ BOM */
background: color-mix(in srgb, var(--danger) 14%, transparent);
```

---

## ✅ Checklist para Novos Componentes
- [ ] Nenhum hexadecimal (#fff, #000, #123456)
- [ ] Nenhum `rgba()` fixo
- [ ] Nenhuma `color: white` ou `color: black`
- [ ] Nenhum `background: white` ou `background: black`
- [ ] Sombras usam `var(--shadow-*)`
- [ ] Textos usam `var(--text)`, `var(--text-dim)`, `var(--text-muted)` ou `var(--text-on-accent)`
- [ ] Fundos usam `var(--bg)`, `var(--bg-card)`, `var(--bg-input)` ou `var(--bg-hover)`
- [ ] Bordas usam `var(--border)`
