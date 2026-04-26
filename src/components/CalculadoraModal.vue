<template>
  <Teleport to="body">
    <Transition name="calc-slide">
      <div v-if="aberta" class="calc-overlay" @click.self="toggleCalculadora">
        <div class="calc-sheet" role="dialog" aria-modal="true" aria-label="Calculadora de medicação">

          <!-- Drag handle -->
          <div class="calc-handle-wrap" @click="toggleCalculadora">
            <div class="calc-handle"></div>
          </div>

          <!-- Header -->
          <div class="calc-header">
            <div class="calc-header-main">
              <div class="calc-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
                  <rect x="5" y="3" width="14" height="18" rx="3" />
                  <path d="M8 7.5h8" />
                  <path d="M8 12h2" />
                  <path d="M12 12h2" />
                  <path d="M16 12h0.01" />
                  <path d="M8 16h2" />
                  <path d="M12 16h2" />
                  <path d="M16 16h0.01" />
                </svg>
              </div>
              <div class="calc-header-copy">
                <span class="calc-eyebrow">Ferramenta rápida</span>
                <span class="calc-titulo">Calculadora de medicação</span>
                <span class="calc-subtitulo">Dosagem, gotejamento, diluição e conversões no mesmo lugar.</span>
              </div>
            </div>
            <button class="calc-btn-fechar" @click="toggleCalculadora" aria-label="Fechar">✕</button>
          </div>

          <!-- Abas -->
          <div class="calc-abas-shell">
            <div class="calc-abas">
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'dosagem' }"     @click="abaAtiva = 'dosagem'">Dosagem</button>
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'gotejamento' }" @click="abaAtiva = 'gotejamento'">Gotejamento</button>
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'diluicao' }"   @click="abaAtiva = 'diluicao'">Diluição</button>
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'conversoes' }"  @click="abaAtiva = 'conversoes'">Conversões</button>
            </div>
          </div>

          <!-- ── ABA DOSAGEM ── -->
          <div v-if="abaAtiva === 'dosagem'" class="calc-corpo">
            <p class="calc-descricao">Regra de três — quanto aspirar do frasco</p>

            <div class="calc-campo">
              <label>Dose prescrita</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="dosagem.prescrita"
                  placeholder="Ex: 60"
                  class="calc-input"
                />
                <select v-model="dosagem.unidade" class="calc-select">
                  <option v-for="u in unidadesDose" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
            </div>

            <div class="calc-campo">
              <label>Dose disponível no frasco</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="dosagem.disponivel"
                  placeholder="Ex: 125"
                  class="calc-input"
                />
                <span class="calc-unid-fixo">{{ dosagem.unidade }}</span>
              </div>
            </div>

            <div class="calc-campo">
              <label>Volume disponível no frasco</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="dosagem.volume"
                  placeholder="Ex: 5"
                  class="calc-input"
                />
                <span class="calc-unid-fixo">ml</span>
              </div>
            </div>

            <div class="calc-resultado" :class="{ 'calc-resultado-vazio': resultDosagemFmt === '--' }">
              <span class="calc-resultado-label">Aspirar</span>
              <span class="calc-resultado-valor">{{ resultDosagemFmt }}</span>
            </div>

            <div class="calc-exemplo">
              <strong>Exemplo:</strong> Prescrição 60mg · Frasco 125mg/5ml
              <span class="calc-exemplo-resp">→ 60÷125×5 = <strong>2,4 ml</strong></span>
            </div>

            <button
              v-if="resultDosagem !== null"
              class="calc-btn-salvar"
              @click="salvarNoHistorico"
            >Salvar no histórico</button>
          </div>

          <!-- ── ABA GOTEJAMENTO ── -->
          <div v-if="abaAtiva === 'gotejamento'" class="calc-corpo">
            <p class="calc-descricao">Velocidade de infusão em gotas por minuto</p>

            <div class="calc-chips-row">
              <button class="chip" :class="{ 'chip-on': gotej.equipo === 'macro' }" @click="gotej.equipo = 'macro'">Macrogotas</button>
              <button class="chip" :class="{ 'chip-on': gotej.equipo === 'micro' }" @click="gotej.equipo = 'micro'">Microgotas</button>
            </div>

            <div class="calc-campo">
              <label>Volume total</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="gotej.volume"
                  placeholder="Ex: 500"
                  class="calc-input"
                />
                <span class="calc-unid-fixo">ml</span>
              </div>
            </div>

            <div class="calc-campo">
              <label>Tempo de infusão</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="gotej.tempo"
                  placeholder="Ex: 4"
                  class="calc-input"
                />
                <select v-model="gotej.unidTempo" class="calc-select">
                  <option value="horas">horas</option>
                  <option value="minutos">minutos</option>
                </select>
              </div>
            </div>

            <div class="calc-resultado" :class="{ 'calc-resultado-vazio': resultGotejamentoFmt === '--' }">
              <span class="calc-resultado-label">Velocidade</span>
              <span class="calc-resultado-valor">{{ resultGotejamentoFmt }}</span>
            </div>

            <div class="calc-formula-info">
              <span v-if="gotej.equipo === 'macro' && gotej.unidTempo === 'horas'">Fórmula: Vt ÷ (T × 3)</span>
              <span v-if="gotej.equipo === 'macro' && gotej.unidTempo === 'minutos'">Fórmula: (Vt × 20) ÷ T</span>
              <span v-if="gotej.equipo === 'micro' && gotej.unidTempo === 'horas'">Fórmula: Vt ÷ T  (= ml/h)</span>
              <span v-if="gotej.equipo === 'micro' && gotej.unidTempo === 'minutos'">Fórmula: (Vt × 60) ÷ T</span>
            </div>

            <button
              v-if="resultGotejamento !== null"
              class="calc-btn-salvar"
              @click="salvarNoHistorico"
            >Salvar no histórico</button>
          </div>

          <!-- ── ABA DILUIÇÃO ── -->
          <div v-if="abaAtiva === 'diluicao'" class="calc-corpo">
            <p class="calc-descricao">Reconstituição de medicamento em pó</p>

            <div class="calc-campo">
              <label>Medicamento no frasco</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="diluicao.qtdMed"
                  placeholder="Ex: 1000"
                  class="calc-input"
                />
                <select v-model="diluicao.unidMed" class="calc-select">
                  <option v-for="u in unidadesDose" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
            </div>

            <div class="calc-campo">
              <label>Diluente adicionado</label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="diluicao.diluente"
                  placeholder="Ex: 10"
                  class="calc-input"
                />
                <span class="calc-unid-fixo">ml</span>
              </div>
            </div>

            <!-- Volume do pó — colapsável, default escondido -->
            <div class="calc-campo">
              <label class="calc-label-opcional">
                Volume do pó liofilizado
                <span class="calc-dica">(só preencha se a bula informar — ex: Penicilina Cristalina)</span>
              </label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="diluicao.volumePo"
                  placeholder="0"
                  class="calc-input"
                />
                <span class="calc-unid-fixo">ml</span>
              </div>
            </div>

            <div v-if="resultDiluicao" class="calc-resultado-diluicao">
              <div class="calc-resultado-linha">
                <span>Volume total</span>
                <strong>{{ resultDiluicaoFmt.volTotal }}</strong>
              </div>
              <div class="calc-resultado-linha">
                <span>Concentração</span>
                <strong>{{ resultDiluicaoFmt.concentracao }}</strong>
              </div>
            </div>
            <div v-else class="calc-resultado calc-resultado-vazio">
              <span class="calc-resultado-label">Concentração</span>
              <span class="calc-resultado-valor">--</span>
            </div>

            <!-- Dose prescrita (opcional — para calcular volume a aspirar) -->
            <div class="calc-campo" style="margin-top:12px;">
              <label>Dose prescrita <span class="calc-dica">(opcional — para calcular volume a aspirar)</span></label>
              <div class="calc-input-row">
                <input
                  type="text" inputmode="decimal"
                  v-model="diluicao.dosePrescrita"
                  placeholder="Ex: 150"
                  class="calc-input"
                />
                <span class="calc-unid-fixo">{{ diluicao.unidMed }}</span>
              </div>
            </div>

            <div v-if="resultDiluicao && resultDiluicaoFmt.volAspira" class="calc-resultado">
              <span class="calc-resultado-label">Aspirar</span>
              <span class="calc-resultado-valor">{{ resultDiluicaoFmt.volAspira }}</span>
            </div>

            <div class="calc-exemplo">
              <strong>Exemplo (Pen. Cristalina 5M UI):</strong>
              Frasco 5.000.000 UI · Diluente 8ml · Vol. do pó 2ml → Vol. total 10ml
              <span class="calc-exemplo-resp">→ 500.000 UI/ml</span>
            </div>

            <button
              v-if="resultDiluicao"
              class="calc-btn-salvar"
              @click="salvarNoHistorico"
            >Salvar no histórico</button>
          </div>

          <!-- ── ABA CONVERSÕES ── -->
          <div v-if="abaAtiva === 'conversoes'" class="calc-corpo">
            <p class="calc-descricao">Referência rápida — sem cálculo</p>

            <div class="calc-tabela">
              <div class="calc-tabela-grupo">
                <div class="calc-tabela-titulo">Massa</div>
                <div class="calc-tabela-linha"><span>1 g</span><span>= 1.000 mg</span></div>
                <div class="calc-tabela-linha"><span>1 mg</span><span>= 1.000 mcg</span></div>
              </div>
              <div class="calc-tabela-grupo">
                <div class="calc-tabela-titulo">Gotejamento</div>
                <div class="calc-tabela-linha"><span>1 ml</span><span>= 20 gotas (macro)</span></div>
                <div class="calc-tabela-linha"><span>1 ml</span><span>= 60 microgotas</span></div>
                <div class="calc-tabela-linha"><span>1 gota</span><span>= 3 microgotas</span></div>
              </div>
              <div class="calc-tabela-grupo">
                <div class="calc-tabela-titulo">Medidas caseiras</div>
                <div class="calc-tabela-linha"><span>1 col. de chá</span><span>= 5 ml</span></div>
                <div class="calc-tabela-linha"><span>1 col. de sopa</span><span>= 15 ml</span></div>
                <div class="calc-tabela-linha"><span>1 copo</span><span>= 200 ml</span></div>
              </div>
            </div>

            <div class="calc-exemplo">
              <strong>Ampicilina 150mg prescrita</strong> · Frasco: 1g (1000mg) em 10ml
              <span class="calc-exemplo-resp">→ 150÷1000×10 = <strong>1,5 ml</strong></span>
            </div>
          </div>

          <!-- ── HISTÓRICO ── -->
          <div v-if="historico.length > 0" class="calc-historico">
            <div class="calc-historico-header">
              <span class="calc-historico-titulo">Últimos cálculos</span>
              <button class="calc-historico-limpar" @click="limparHistorico">Limpar</button>
            </div>
            <div
              v-for="(h, i) in historico"
              :key="i"
              class="calc-historico-item"
            >
              <span class="calc-historico-tipo">{{ tipoLabel(h.tipo) }}</span>
              <span class="calc-historico-resumo">{{ h.resumo }}</span>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useCalculadora } from '../composables/useCalculadora.js'

const {
  aberta, abaAtiva,
  dosagem, gotej, diluicao,
  historico,
  resultDosagem, resultDosagemFmt,
  resultGotejamento, resultGotejamentoFmt,
  resultDiluicao, resultDiluicaoFmt,
  toggleCalculadora,
  salvarNoHistorico, limparHistorico,
  useScrollLock,
} = useCalculadora()

useScrollLock()

const unidadesDose = ['mg', 'g', 'mcg', 'UI', 'mEq']

function tipoLabel(tipo) {
  return { dosagem: 'Dose', gotejamento: 'Gotej.', diluicao: 'Dilui.' }[tipo] || tipo
}
</script>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────────────────── */
.calc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.calc-sheet {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  will-change: transform;
}

/* ── Handle + Header ─────────────────────────────────────────────────────── */
.calc-handle-wrap {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
  cursor: pointer;
}
.calc-handle {
  width: 40px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
}
.calc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 20px 12px;
}
.calc-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}
.calc-btn-fechar {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 1rem;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Abas ────────────────────────────────────────────────────────────────── */
.calc-abas {
  display: flex;
  gap: 6px;
  padding: 0 16px 14px;
  overflow-x: auto;
  scrollbar-width: none;
}
.calc-abas::-webkit-scrollbar { display: none; }
.calc-aba {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  min-height: 36px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.calc-aba-on {
  background: var(--blue);
  border-color: var(--blue);
  color: white;
}

/* ── Corpo ───────────────────────────────────────────────────────────────── */
.calc-corpo {
  padding: 0 16px 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.calc-descricao {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.calc-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.calc-campo label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dim);
}
.calc-label-opcional {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.calc-dica {
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--text-muted);
}

.calc-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.calc-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 1rem;
  padding: 10px 12px;
  font-family: inherit;
  min-height: 44px;
  outline: none;
}
.calc-input:focus { border-color: var(--blue); }
.calc-select {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.88rem;
  padding: 10px 8px;
  font-family: inherit;
  min-height: 44px;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
}
.calc-unid-fixo {
  font-size: 0.82rem;
  color: var(--text-muted);
  flex-shrink: 0;
  min-width: 28px;
}

.calc-chips-row {
  display: flex;
  gap: 8px;
}

/* ── Resultado ───────────────────────────────────────────────────────────── */
.calc-resultado {
  background: var(--blue-muted);
  border: 1px solid var(--blue);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.calc-resultado-vazio {
  background: var(--bg-card);
  border-color: var(--border);
}
.calc-resultado-label {
  font-size: 0.82rem;
  color: var(--text-dim);
  font-weight: 600;
}
.calc-resultado-valor {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--blue);
}
.calc-resultado-vazio .calc-resultado-valor {
  color: var(--text-muted);
}

/* Resultado diluição (múltiplas linhas) */
.calc-resultado-diluicao {
  background: var(--blue-muted);
  border: 1px solid var(--blue);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.calc-resultado-linha {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.calc-resultado-linha span {
  font-size: 0.82rem;
  color: var(--text-dim);
}
.calc-resultado-linha strong {
  font-size: 1rem;
  font-weight: 800;
  color: var(--blue);
}

/* ── Fórmula + Exemplo ───────────────────────────────────────────────────── */
.calc-formula-info {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}
.calc-exemplo {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: var(--bg-input);
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.6;
}
.calc-exemplo-resp {
  display: block;
  margin-top: 2px;
  color: var(--text-dim);
}

/* ── Botão salvar histórico ──────────────────────────────────────────────── */
.calc-btn-salvar {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-dim);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
  min-height: 36px;
  align-self: flex-start;
  transition: border-color 0.15s, color 0.15s;
}
.calc-btn-salvar:hover { border-color: var(--blue); color: var(--text); }

/* ── Tabela Conversões ───────────────────────────────────────────────────── */
.calc-tabela {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.calc-tabela-grupo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.calc-tabela-titulo {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.calc-tabela-linha {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.calc-tabela-linha span:first-child { color: var(--text-dim); font-weight: 600; }
.calc-tabela-linha span:last-child  { color: var(--text); }

/* ── Histórico ───────────────────────────────────────────────────────────── */
.calc-historico {
  margin: 16px 16px 0;
  border-top: 1px solid var(--border);
  padding-top: 14px;
}
.calc-historico-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.calc-historico-titulo {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.calc-historico-limpar {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  min-height: 36px;
  padding: 0 8px;
}
.calc-historico-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
}
.calc-historico-tipo {
  flex-shrink: 0;
  background: var(--bg-input);
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
}
.calc-historico-resumo {
  color: var(--text-dim);
  line-height: 1.4;
}

/* ── Chips ───────────────────────────────────────────────────────────────── */
.chip {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.88rem;
  padding: 7px 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: var(--text-on-accent); font-weight: 600; }

/* ── Transição ───────────────────────────────────────────────────────────── */
.calc-slide-enter-active,
.calc-slide-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.calc-slide-enter-from,
.calc-slide-leave-to     { transform: translateY(100%); }

.calc-overlay {
  padding: 16px 12px 0;
  background: rgba(3, 9, 19, 0.78);
}

.calc-sheet {
  width: min(100%, 760px);
  max-height: min(88vh, 920px);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 30px 30px 0 0;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg) 100%);
  box-shadow:
    0 -18px 60px rgba(2, 8, 20, 0.58),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
}

.calc-handle-wrap {
  padding: 14px 0 8px;
}

.calc-handle {
  width: 54px;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--border), var(--text-dim), var(--border));
}

.calc-header {
  align-items: flex-start;
  gap: 16px;
  padding: 6px 22px 18px;
}

.calc-header-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.calc-header-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  background: linear-gradient(180deg, var(--blue-muted), var(--bg-input));
  border: 1px solid var(--border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 26px rgba(6, 13, 28, 0.3);
  flex-shrink: 0;
}

.calc-header-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.calc-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.calc-titulo {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text);
}

.calc-subtitulo {
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--text-dim);
}

.calc-btn-fechar {
  width: 42px;
  height: 42px;
  min-width: 42px;
  min-height: 42px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-input);
  color: var(--text-dim);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.calc-btn-fechar:hover {
  border-color: var(--blue);
  background: var(--bg-hover);
  color: var(--text);
}

.calc-abas-shell {
  padding: 0 18px 18px;
}

.calc-abas {
  gap: 8px;
  padding: 6px;
  border-radius: 18px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-inset-soft);
}

.calc-aba {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 14px;
  color: var(--text-dim);
  font-size: 0.84rem;
  font-weight: 700;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.calc-aba:hover {
  color: var(--text);
}

.calc-aba-on {
  color: var(--text-on-accent);
  border-color: var(--blue);
  background: linear-gradient(180deg, var(--blue), var(--blue-dark));
  box-shadow: var(--shadow-glow-blue);
}

.calc-corpo {
  gap: 16px;
  padding: 0 20px 8px;
}

.calc-descricao {
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--text-dim);
}

.calc-campo {
  gap: 8px;
}

.calc-campo label {
  font-size: 0.83rem;
  font-weight: 700;
  color: var(--text);
}

.calc-dica {
  font-size: 0.73rem;
  font-weight: 500;
  color: var(--text-muted);
}

.calc-input-row {
  gap: 10px;
}

.calc-input,
.calc-select {
  min-height: 50px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 8px 18px rgba(2, 8, 20, 0.18);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.calc-input {
  padding: 0 14px;
}

.calc-select {
  padding: 0 14px;
}

.calc-input:focus,
.calc-select:focus {
  border-color: var(--blue);
  box-shadow:
    0 0 0 4px var(--blue-faint),
    0 10px 22px rgba(8, 19, 37, 0.28);
}

.calc-unid-fixo {
  min-width: 42px;
  min-height: 50px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-hover);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-dim);
}

.calc-chips-row {
  gap: 10px;
  flex-wrap: wrap;
}

.calc-resultado,
.calc-resultado-diluicao {
  border-radius: 18px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 18px 32px rgba(4, 11, 24, 0.2);
}

.calc-resultado {
  padding: 16px 18px;
  gap: 10px;
}

.calc-resultado-vazio {
  border-color: var(--border);
  background: linear-gradient(180deg, var(--bg-card), var(--bg));
}

.calc-resultado-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-dim);
}

.calc-resultado-valor,
.calc-resultado-linha strong {
  color: var(--blue);
}

.calc-resultado-valor {
  font-size: 1.34rem;
}

.calc-resultado-vazio .calc-resultado-valor {
  color: var(--text-muted);
}

.calc-resultado-diluicao {
  padding: 16px 18px;
  gap: 10px;
}

.calc-resultado-linha span {
  color: var(--text-dim);
}

.calc-formula-info,
.calc-exemplo {
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-input);
}

.calc-formula-info {
  padding: 12px 14px;
  font-size: 0.76rem;
  line-height: 1.5;
  color: var(--text-dim);
}

.calc-exemplo {
  padding: 12px 14px;
  font-size: 0.79rem;
  line-height: 1.62;
  color: var(--text-dim);
}

.calc-exemplo strong {
  color: var(--text);
}

.calc-exemplo-resp {
  margin-top: 4px;
  color: var(--text);
}

.calc-btn-salvar {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--bg-hover), var(--bg-input));
  color: var(--text);
  font-size: 0.84rem;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.calc-btn-salvar:hover {
  border-color: var(--blue);
  box-shadow: var(--shadow-lg);
}

.calc-tabela {
  gap: 14px;
}

.calc-tabela-grupo {
  gap: 8px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-input);
}

.calc-tabela-titulo {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.calc-tabela-linha {
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.calc-tabela-linha:last-child {
  border-bottom: none;
}

.calc-tabela-linha span:first-child {
  color: var(--text-dim);
}

.calc-tabela-linha span:last-child {
  color: var(--text);
}

.calc-historico {
  margin: 18px 20px 0;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.calc-historico-header {
  gap: 12px;
  margin-bottom: 12px;
}

.calc-historico-titulo {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.calc-historico-limpar {
  min-height: 36px;
  padding: 0 10px;
  color: var(--text-dim);
  font-size: 0.77rem;
  font-weight: 700;
}

.calc-historico-item {
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.82rem;
}

.calc-historico-tipo {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-hover);
  font-size: 0.69rem;
  font-weight: 800;
  color: var(--text-dim);
}

.calc-historico-resumo {
  color: var(--text);
}

.chip {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  color: var(--text-dim);
  font-weight: 700;
  box-shadow: var(--shadow-soft);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.chip:hover {
  color: var(--text);
}

.chip:active {
  transform: scale(0.98);
  opacity: 1;
}

.chip-on {
  border-color: var(--blue);
  background: linear-gradient(180deg, var(--blue), var(--blue-dark));
  color: var(--text-on-accent);
  box-shadow: var(--shadow-glow-blue);
}

.calc-slide-enter-active,
.calc-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.calc-slide-enter-from,
.calc-slide-leave-to {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .calc-overlay {
    padding: 24px 20px 0;
  }

  .calc-header {
    padding: 10px 26px 20px;
  }

  .calc-titulo {
    font-size: 1.18rem;
  }

  .calc-subtitulo {
    font-size: 0.88rem;
  }

  .calc-abas-shell {
    padding: 0 24px 20px;
  }

  .calc-corpo {
    padding: 0 24px 12px;
  }

  .calc-historico {
    margin: 20px 24px 0;
  }
}

@media (max-width: 520px) {
  .calc-overlay {
    padding: 8px 0 0;
  }

  .calc-sheet {
    width: 100%;
    border-radius: 26px 26px 0 0;
  }

  .calc-header {
    padding: 2px 16px 16px;
  }

  .calc-header-main {
    align-items: flex-start;
  }

  .calc-header-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
  }

  .calc-abas-shell {
    padding: 0 14px 16px;
  }

  .calc-corpo {
    padding: 0 14px 6px;
  }

  .calc-input-row {
    flex-wrap: wrap;
  }

  .calc-select {
    min-width: 110px;
  }

  .calc-unid-fixo {
    min-width: unset;
  }

  .calc-historico {
    margin: 18px 14px 0;
  }
}
</style>
