# Plantão — Documento de Planejamento

Sistema de anotações de enfermagem hospitalar.
Substitui e expande o app `anotacao` atual.

---

## Stack Tecnológica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | Vue 3 (Composition API) | Legível, escalável, próximo de HTML |
| Build | Vite | Rápido, simples, sem configuração complexa |
| Estado global | Pinia | Oficial do Vue, simples |
| Rotas | Vue Router | Oficial do Vue |
| Banco de dados | Firebase Realtime Database | Já em uso no app atual |
| Autenticação | Sistema próprio (código + PIN) | Já funciona, sem email/senha |
| PWA | vite-plugin-pwa | Offline, instalável no celular |
| Estilo | CSS próprio (mesmo design atual) | Sem framework CSS — controle total |

---

## Estrutura de Pastas

```
plantao/
├── public/
│   ├── icons/           ← ícones do PWA
│   └── manifest.json
├── src/
│   ├── assets/
│   │   └── style.css    ← design system (cores, tipografia)
│   ├── components/      ← componentes reutilizáveis
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── RadioGroup.vue
│   │   ├── CheckboxGroup.vue
│   │   └── ToastMessage.vue
│   ├── views/           ← telas completas
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── HistoricoView.vue
│   │   └── anotacoes/
│   │       ├── AnotacaoInicialView.vue
│   │       ├── MedicacaoView.vue
│   │       ├── EncaminhamentoView.vue
│   │       ├── BanhoView.vue
│   │       ├── CurativoView.vue
│   │       ├── PassagemPlantaoView.vue
│   │       ├── TrocaFraldaView.vue
│   │       ├── SinaisVitaisView.vue
│   │       ├── IntercorrenciaView.vue
│   │       └── HemocomponenteView.vue
│   ├── stores/          ← estado global (Pinia)
│   │   ├── auth.js      ← sessão, login, PIN
│   │   └── anotacoes.js ← CRUD de anotações
│   ├── router/
│   │   └── index.js     ← rotas do sistema
│   ├── firebase.js      ← configuração Firebase
│   └── App.vue          ← entrada da aplicação
├── index.html
├── vite.config.js
└── package.json
```

---

## Modelo de Dados (Firebase)

```
usuarios/
  {codigo}/
    pin: "hash"
    nome: "Ana Lima"
    criadoEm: timestamp

anotacoes/
  {codigo}/
    {timestamp}/
      tipo: "inicial" | "medicacao" | "encaminhamento" | "banho" |
            "curativo" | "passagem" | "sv" | "intercorrencia" |
            "troca_fralda" | "hemocomponente"
      texto: "texto gerado"
      nome: "Maria Silva"
      leito: "4B"
      timestamp: 1234567890
      criadoEm: timestamp
```

---

## Tipos de Anotação

### 1. Anotação Inicial *(migrar do app atual)*
A mais complexa. Blocos: identificação, estado geral, dispositivos, eliminações, fechamento.
**Texto gerado:** estrutura MAR (Mantém → Apresenta → Refere)

### 2. Medicação *(simples, muito frequente)*
- Horário
- Lista de medicamentos (adicionar quantos quiser)
  - Para cada medicamento: nome + dose + unidade + via
  - Se via EV: diluído em (volume + solução), tempo de infusão, bomba? sim/não
- Texto gerado:
  ```
  10h00 - Administrado Dipirona 500mg VO, Ondansetrona 8mg +
          100ml SF0,9% EV em 30min em bomba de infusão,
          conforme prescrição médica
  ```
  ⚠️ Vírgula separa medicamentos. "+" indica diluição (med + soro).

### 3. Encaminhamento
- Horário
- Destino (texto livre — ex: INRAD 3º andar)
- Motivo/exame (texto livre — ex: tomografia)
- Transporte: cadeira de rodas / maca / leito / a pé
- Acompanhante: nome + função (TécEnf, Enf, etc.)
- Texto gerado:
  ```
  10h00 - Paciente encaminhado em cadeira de rodas para INRAD 3º andar
          para realização de tomografia, acompanhado do TécEnf Arthur
  ```

### 4. Banho
**Subtipo A — Banho de leito:**
- Horário
- Checkboxes: face, couro cabeludo, tronco, MMSS, MMII, partes íntimas
- Checkboxes extras: troca de fralda, troca de roupa de cama, troca de camisola

**Subtipo B — Banho de aspersão:**
- Horário
- Texto gerado:
  ```
  08h00 - Paciente encaminhado para banho de aspersão sem
          intercorrências, realizado troca de roupa de cama
  ```

### 5. Troca de Fralda *(padrão a definir)*
- Horário
- Condição da fralda (urina / evacuação / ambos)
- Higiene íntima realizada
- ⚠️ Padrão de texto a ser definido com a enfermeira

### 6. Curativo
- Horário
- Local (texto livre — ex: MSD, MMII D)
- Materiais usados (checkboxes):
  SF0,9%, Hidrogel, Rayon, Gaze, Atadura, AGE, Clorexidine aquosa,
  Clorexidine degermante, PVPI, Colagenase, Alginato, Foam, Outros
- Condição: limpo/seco / secretivo / sangrante / necrótico
- Ocluído: sim/não
- Texto gerado:
  ```
  08h40 - Realizado curativo em MSD com SF0,9% + Hidrogel + Rayon +
          Gaze + Atadura, ocluído, limpo e seco externamente
  ```

### 7. Passagem de Plantão
- Horário
- O que foi ofertado (janta / almoço / café / nada)
- Estado do paciente (sem queixas / com queixas — texto livre)
- Checkboxes de segurança: cama baixa, rodas travadas, grades,
  decúbito elevado, campainha próxima
- Texto gerado:
  ```
  18h00 - Ofertado janta. Paciente em seu leito sem queixas,
          mantenho cama baixa, rodas travadas, grades e decúbito
          parcialmente elevados, campainha próxima e oriento a
          chamar sempre que necessário
  ```

### 8. Sinais Vitais *(migrar do app atual)*
Já construído. PA, FC, FR, Temp, Sat, dor/algia.
Suporte a aferição parcial.

### 9. Intercorrência / Anotação Livre
- Horário
- Campo de texto livre
- Aparece no histórico com tipo "Intercorrência"
- Para tudo que não se encaixa em nenhum outro tipo

### 10. Hemocomponente *(implementar por último — crítico)*
- Horário
- Produto (ex: Concentrado de Hemácias, Plaquetas, Plasma)
- Dose / volume
- Lote
- Data de fabricação
- Data de validade
- Marca/fornecedor
- ⚠️ ZERO margem de erro. Revisar antes de salvar.

---

## Ordem de Implementação

```
Fase 1 — Fundação
  [x] Criar projeto Vue + Vite
  [ ] Configurar Firebase
  [ ] Sistema de login (código + PIN)
  [ ] Estrutura de rotas
  [ ] Design system (cores, componentes base)
  [ ] PWA (offline, instalável)

Fase 2 — Migração do app atual
  [ ] Anotação Inicial (5 blocos)
  [ ] Sinais Vitais
  [ ] Histórico de anotações

Fase 3 — Novas anotações simples
  [ ] Medicação
  [ ] Encaminhamento
  [ ] Banho (leito + aspersão)
  [ ] Troca de Fralda
  [ ] Passagem de Plantão

Fase 4 — Anotações complexas
  [ ] Curativo
  [ ] Intercorrência livre

Fase 5 — Crítica
  [ ] Hemocomponente

Fase 6 — Futuro
  [ ] Cadastro de paciente
  [ ] Busca/seleção de paciente
  [ ] Relatórios / exportação
```

---

## Decisões de UX

- **Mobile first** — enfermeira usa no celular durante o plantão
- **Dark mode fixo** — mesma identidade visual do app atual
- **Geração automática de texto** — nunca digitar a anotação completa
- **PIN numérico** — rápido de digitar com uma mão
- **Offline** — hospital pode ter sinal ruim
- **Copiar / WhatsApp** — fluxo de compartilhamento mantido

---

## Firebase — mesmo projeto do app atual

As anotações do app atual continuam funcionando.
O Plantão usará o mesmo Firebase, apenas com estrutura expandida.
Migração de dados: não necessária (histórico antigo fica acessível).

---

*Documento criado em: 2026-03-13*
*Versão: 0.1 — planejamento inicial*
