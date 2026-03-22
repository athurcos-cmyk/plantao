<template>
  <Teleport to="body">
    <!-- FAB -->
    <button
      class="btn-calc"
      :class="{ 'btn-calc-aberta': aberta }"
      @click="toggleCalculadora"
      :aria-label="aberta ? 'Fechar calculadora' : 'Abrir calculadora de medicação'"
    >
      <svg v-if="!aberta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
        <!-- visor -->
        <rect x="4" y="2" width="16" height="5" rx="1.5"/>
        <!-- grade de botões 3×3 -->
        <rect x="4" y="9"  width="4" height="3" rx="1"/>
        <rect x="10" y="9" width="4" height="3" rx="1"/>
        <rect x="16" y="9" width="4" height="3" rx="1"/>
        <rect x="4"  y="14" width="4" height="3" rx="1"/>
        <rect x="10" y="14" width="4" height="3" rx="1"/>
        <rect x="16" y="14" width="4" height="3" rx="1"/>
        <rect x="4"  y="19" width="4" height="3" rx="1"/>
        <rect x="10" y="19" width="9" height="3" rx="1"/>
      </svg>
      <span v-else style="font-size:1.1rem;font-weight:700;">✕</span>
    </button>

    <!-- Bottom sheet -->
    <Transition name="calc-slide">
      <div v-if="aberta" class="calc-overlay" @click.self="toggleCalculadora">
        <div class="calc-sheet" role="dialog" aria-modal="true" aria-label="Calculadora de medicação">

          <!-- Drag handle -->
          <div class="calc-handle-wrap" @click="toggleCalculadora">
            <div class="calc-handle"></div>
          </div>

          <!-- Header -->
          <div class="calc-header">
            <span class="calc-titulo">Calculadora</span>
            <button class="calc-btn-fechar" @click="toggleCalculadora" aria-label="Fechar">✕</button>
          </div>

          <!-- Abas -->
          <div class="calc-abas">
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'dosagem' }"     @click="abaAtiva = 'dosagem'">Dosagem</button>
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'gotejamento' }" @click="abaAtiva = 'gotejamento'">Gotejamento</button>
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'diluicao' }"   @click="abaAtiva = 'diluicao'">Diluição</button>
            <button class="calc-aba" :class="{ 'calc-aba-on': abaAtiva === 'conversoes' }"  @click="abaAtiva = 'conversoes'">Conversões</button>
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
/* ── FAB ─────────────────────────────────────────────────────────────────── */
.btn-calc {
  position: fixed;
  bottom: 88px;
  right: 18px;
  z-index: 900;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #1a5c3a;
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.btn-calc:active,
.btn-calc-aberta { background: #124429; transform: scale(0.92); }

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
  background: var(--bg-input, #0d2137);
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
  background: var(--bg-input, #0d2137);
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
  background: #0d2a1a;
  border: 1px solid #1a5c3a;
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
  color: #4caf82;
}
.calc-resultado-vazio .calc-resultado-valor {
  color: var(--text-muted);
}

/* Resultado diluição (múltiplas linhas) */
.calc-resultado-diluicao {
  background: #0d2a1a;
  border: 1px solid #1a5c3a;
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
  color: #4caf82;
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
  background: var(--bg-input, #0d2137);
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
  background: var(--bg-input, #0d2137);
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
  transition: all 0.15s;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 600; }

/* ── Transição ───────────────────────────────────────────────────────────── */
.calc-slide-enter-active,
.calc-slide-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.calc-slide-enter-from,
.calc-slide-leave-to     { transform: translateY(100%); }
</style>
