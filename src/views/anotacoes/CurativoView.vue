<template>
  <div class="screen curativo-screen">
    <header class="app-header curativo-header">
      <button class="btn-icon" @click="voltarOuSair">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>
      <div style="width:34px"/>
    </header>

    <div v-if="!gerado" class="progress-wrap curativo-progress">
      <div class="progress-fill" :style="{ width: (passo / 2 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 2</span>
    </div>

    <main class="container curativo-page" @click.capture="desfocarChipAposClique">

      <!-- Banner rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info"><span>📝</span><span>Você tem um rascunho salvo</span></div>
        <div class="rascunho-acoes">
          <button class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <!-- ═══ BLOCO 1 — Identificação ═══ -->
      <section v-if="!gerado && pacientesStore.pacientes.length > 0" class="paciente-atalho">
        <label>Paciente registrado</label>
        <div class="chips-scroll">
          <button
            v-for="p in pacientesStore.pacientes"
            :key="p._key"
            class="chip"
            :class="{ 'chip-on': form.nome === p.nome && form.leito === (p.leito || '') }"
            @click="selecionarPaciente(p)"
          >{{ p.leito ? p.leito + ' ' : '' }}<span v-if="p.leito" aria-hidden="true">&middot;</span>{{ p.leito ? ' ' : '' }}{{ p.nome }}</button>
        </div>
      </section>

      <section v-if="!gerado && passo === 1" class="module-hero">
        <div class="module-hero-icon">
          <img :src="iconCurativo" alt="Curativo" />
        </div>
        <div class="module-hero-copy">
          <h1>Curativos</h1>
          <p>Registre curativos, coberturas, drenos e avaliação da lesão.</p>
        </div>
      </section>

      <div v-if="!gerado && passo === 1" class="curativo-card">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input type="time" v-model="form.horario">
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 20px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Detalhes ═══ -->
      <div v-if="!gerado && passo === 2" class="curativo-card">
        <h2 class="bloco-titulo">Detalhes do curativo</h2>

        <!-- Tipo -->
        <div class="campo">
          <label>Tipo</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.tipo === 'curativo' }" @click="form.tipo = 'curativo'">🩹 Curativo</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'troca' }" @click="form.tipo = 'troca'">🔄 Troca de curativo</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'placa' }" @click="form.tipo = 'placa'">🟦 Troca de placa de hidrocoloide</button>
          </div>
        </div>

        <!-- Dreno (só para curativo/troca) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label class="checkbox-label" :class="{ checked: form.ehDreno }">
            <input type="checkbox" v-model="form.ehDreno">
            <span>Curativo de dreno</span>
          </label>
          <div v-if="form.ehDreno" style="margin-top:10px">
            <input type="text" v-model="form.dreno" placeholder="Ex: da nefrostomia D e E, de tórax em flanco E">
          </div>
        </div>

        <!-- Local (quando não é dreno) — MULTI-SELECT -->
        <div v-if="form.tipo && !form.ehDreno" class="campo">
          <label>Local</label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button v-for="l in locaisChips" :key="l" class="chip chip-sm"
              :class="{ 'chip-on': form.local.includes(l) }"
              @click="toggleLocal(l)">{{ l }}</button>
            <span v-for="l in locaisCustom" :key="l._key" class="chip chip-sm chip-has-action"
              :class="{ 'chip-on': form.local.includes(l.texto) }"
              @click="toggleLocal(l.texto)">
              {{ l.texto }}
              <button class="chip-del-btn" @click.stop="removerLocalCustom(l._key)">×</button>
            </span>
            <span v-for="l in locaisTemporarios" :key="`tmp-${l}`" class="chip chip-sm chip-has-action chip-temp"
              :class="{ 'chip-on': form.local.includes(l) }"
              @click="toggleLocal(l)">
              {{ l }}
              <button class="chip-del-btn" @click.stop="removerLocalTemporario(l)">×</button>
            </span>
            <button v-if="!adicionandoLocal" class="chip chip-sm chip-add" @click="abrirAddLocal">+ Adicionar local</button>
          </div>
          <div v-if="adicionandoLocal" class="add-row" style="margin-top:8px">
            <input class="add-input" type="text" v-model="novoLocalTxt"
              placeholder="Ex: região cervical esquerda, joelho D..."
              @keyup.enter="adicionarLocalTemporario" @keyup.esc="fecharAddLocal"
              ref="refNovoLocal">
            <div class="material-actions">
              <button class="chip chip-on" @click="salvarLocalCustom" :disabled="!novoLocalTxt.trim()">Salvar no banco de dados</button>
              <button class="chip chip-temp" @click="adicionarLocalTemporario" :disabled="!novoLocalTxt.trim()">Só nesta anotação</button>
              <button class="chip" @click="fecharAddLocal">✕</button>
            </div>
          </div>
        </div>

        <!-- Cobertura (o que vai na ferida) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Cobertura <span class="opc">(o que vai na ferida — opcional)</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button
              v-for="m in coberturaOpcoes"
              :key="m"
              class="chip chip-material"
              :class="{ 'chip-on': materialSelecionado(m) }"
              @click="toggleMaterial(m)"
            >{{ m }}</button>

            <span
              v-for="m in materiaisCustom"
              :key="m._key"
              class="chip chip-material chip-has-action"
              :class="{ 'chip-on': materialSelecionado(m.texto) }"
              @click="toggleMaterial(m.texto)"
            >
              {{ m.texto }}
              <button class="chip-del-btn" @click.stop="removerMaterialCustom(m._key)">×</button>
            </span>

            <span
              v-for="m in materiaisTemporarios"
              :key="`tmp-${m}`"
              class="chip chip-material chip-has-action chip-temp"
              :class="{ 'chip-on': materialSelecionado(m) }"
              @click="toggleMaterial(m)"
            >
              {{ m }}
              <button class="chip-del-btn" @click.stop="removerMaterialTemporario(m)">×</button>
            </span>
          </div>

          <div v-if="!adicionandoMaterial" style="margin-top:8px">
            <button class="chip chip-add" @click="abrirAddMaterial">+ Adicionar cobertura</button>
          </div>
          <div v-else class="add-row" style="margin-top:8px">
            <input
              class="add-input"
              type="text"
              v-model="novoMaterialTxt"
              placeholder="Ex: Vaselina, Sulfadiazina de prata..."
              @keyup.enter="adicionarMaterialTemporario"
              @keyup.esc="fecharAddMaterial"
              ref="refNovoMaterial"
            >
            <div class="material-actions">
              <button class="chip chip-on" @click="salvarMaterialCustom" :disabled="!novoMaterialTxt.trim()">Salvar no banco</button>
              <button class="chip chip-temp" @click="adicionarMaterialTemporario" :disabled="!novoMaterialTxt.trim()">Só nesta anotação</button>
              <button class="chip" @click="fecharAddMaterial">✕</button>
            </div>
          </div>
        </div>

        <!-- Oclusão (o que fecha o curativo) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Oclusão <span class="opc">(o que fecha o curativo — opcional)</span></label>
          <div class="chips-wrap">
            <button
              v-for="m in oclusaoOpcoes"
              :key="m"
              class="chip chip-material"
              :class="{ 'chip-on': materialSelecionado(m) }"
              @click="toggleMaterial(m)"
            >{{ m }}</button>
            <span v-for="item in outroOclusao.items" :key="`oc-${item}`"
              class="chip chip-material chip-has-action chip-on"
              >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroOclusao, item)">×</button></span>
            <button class="chip chip-material"
              :class="{ 'chip-on': outroOclusao.aberto }"
              @click="toggleOutro(outroOclusao)">Outro</button>
          </div>
          <div v-if="outroOclusao.aberto" class="outro-input-row">
            <input type="text" v-model="outroOclusao.input"
              placeholder="Ex: Micropore, Crepom..."
              @keyup.enter="addOutroItem(outroOclusao)">
            <button class="chip chip-sm chip-on" @click="addOutroItem(outroOclusao)" :disabled="!outroOclusao.input.trim()">+</button>
          </div>
        </div>

        <!-- Solução de limpeza -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Solução de limpeza <span class="opc">(opcional)</span></label>
          <div class="chips-wrap">
            <button v-for="s in solucoesOpcoes" :key="s" class="chip chip-sm"
              :class="{ 'chip-on': form.solucaoLimpeza.includes(s) }"
              @click="toggleSolucao(s)">{{ s }}</button>
            <span v-for="item in outroSolucao.items" :key="`sol-${item}`"
              class="chip chip-sm chip-has-action chip-on"
              >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroSolucao, item)">×</button></span>
            <button class="chip chip-sm"
              :class="{ 'chip-on': outroSolucao.aberto }"
              @click="toggleOutro(outroSolucao)">Outro</button>
          </div>
          <div v-if="outroSolucao.aberto" class="outro-input-row">
            <input type="text" v-model="outroSolucao.input"
              placeholder="Ex: Clorexidina 0,5%..."
              @keyup.enter="addOutroItem(outroSolucao)">
            <button class="chip chip-sm chip-on" @click="addOutroItem(outroSolucao)" :disabled="!outroSolucao.input.trim()">+</button>
          </div>
        </div>

        <!-- Condição (não para placa) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Condição</label>
          <label class="checkbox-label" :class="{ checked: form.condicao }">
            <input type="checkbox" v-model="form.condicao">
            <span>Ocluído, limpo e seco externamente</span>
          </label>
        </div>

        <!-- Referência à prescrição -->
        <div v-if="form.tipo" class="campo">
          <label>Referência <span class="opc">(opcional)</span></label>
          <div class="chips-wrap">
            <button class="chip chip-sm"
              :class="{ 'chip-on': form.referencia === 'prescricao' }"
              @click="form.referencia = form.referencia === 'prescricao' ? '' : 'prescricao'">
              Conforme prescrição de enfermagem
            </button>
            <button class="chip chip-sm"
              :class="{ 'chip-on': form.referencia === 'orientacao' }"
              @click="form.referencia = form.referencia === 'orientacao' ? '' : 'orientacao'">
              Conforme orientação Enf.
            </button>
            <button class="chip chip-sm"
              :class="{ 'chip-on': form.referencia === 'ambos' }"
              @click="form.referencia = form.referencia === 'ambos' ? '' : 'ambos'">
              Prescrição + orientação Enf.
            </button>
          </div>
          <div v-if="form.referencia === 'orientacao' || form.referencia === 'ambos'" style="margin-top:10px">
            <input type="text" v-model="form.referenciaEnf"
              placeholder="Nome do(a) Enf. (opcional)">
          </div>
        </div>

        <!-- ── Avaliação COREN (só curativo/troca sem dreno) ── -->
        <template v-if="form.tipo && form.tipo !== 'placa' && !form.ehDreno">

          <!-- Toggle de expansão -->
          <button class="btn-expandir" @click="avaliacaoExpandida = !avaliacaoExpandida">
            <span>Avaliação da lesão</span>
            <span class="expandir-icone">{{ avaliacaoExpandida ? '▲' : '▼' }}</span>
          </button>

          <template v-if="avaliacaoExpandida">

          <!-- Tipo de lesão -->
          <div class="campo">
            <label>Tipo de lesão <span class="opc">(opcional)</span></label>
            <div class="chips-wrap">
              <button v-for="t in tiposLesaoOpcoes" :key="t"
                class="chip chip-sm"
                :class="{ 'chip-on': form.tipoLesao === t }"
                @click="form.tipoLesao = form.tipoLesao === t ? '' : t">{{ t }}</button>
              <button class="chip chip-sm"
                :class="{ 'chip-on': form.tipoLesaoOutro }"
                @click="form.tipoLesaoOutro = !form.tipoLesaoOutro">Outro</button>
            </div>
            <input v-if="form.tipoLesaoOutro" type="text" v-model="form.tipoLesaoCustom"
              placeholder="Ex: lesão por fricção, úlcera arterial..." style="margin-top:8px">
          </div>

          <!-- Tamanho -->
          <div class="campo">
            <label>Tamanho da lesão <span class="opc">(opcional)</span></label>
            <div class="tamanho-row">
              <div class="input-cm">
                <input type="number" v-model="form.largura" placeholder="0" min="0" step="0.1">
                <span class="cm-label">cm larg.</span>
              </div>
              <span class="cm-sep">×</span>
              <div class="input-cm">
                <input type="number" v-model="form.comprimento" placeholder="0" min="0" step="0.1">
                <span class="cm-label">cm comp.</span>
              </div>
            </div>
          </div>

          <!-- Leito da ferida -->
          <div class="campo">
            <label>Leito da ferida <span class="opc">(opcional)</span></label>
            <div class="chips-wrap">
              <button v-for="l in leitoOpcoes" :key="l" class="chip chip-sm"
                :class="{ 'chip-on': form.leitoFerida.includes(l) }"
                @click="toggleLeitoFerida(l)">{{ l }}</button>
              <span v-for="item in outroLeito.items" :key="`lei-${item}`"
                class="chip chip-sm chip-has-action chip-on"
                >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroLeito, item)">×</button></span>
              <button class="chip chip-sm"
                :class="{ 'chip-on': outroLeito.aberto }"
                @click="toggleOutro(outroLeito)">Outro</button>
            </div>
            <div v-if="outroLeito.aberto" class="outro-input-row">
              <input type="text" v-model="outroLeito.input"
                placeholder="Descreva o leito da ferida..."
                @keyup.enter="addOutroItem(outroLeito)">
              <button class="chip chip-sm chip-on" @click="addOutroItem(outroLeito)" :disabled="!outroLeito.input.trim()">+</button>
            </div>
          </div>

          <!-- Exsudato — quantidade + aspecto -->
          <div class="campo">
            <label>Exsudato <span class="opc">(opcional)</span></label>
            <div class="chips-wrap" style="margin-bottom:8px">
              <button v-for="q in ['ausente', 'pequena quantidade', 'média quantidade', 'grande quantidade']" :key="q"
                class="chip chip-sm"
                :class="{ 'chip-on': form.exsudatoQtd === q }"
                @click="form.exsudatoQtd = form.exsudatoQtd === q ? '' : q">{{ q }}</button>
            </div>
            <div class="chips-wrap" style="margin-bottom:8px">
              <button v-for="a in aspectoChips" :key="a" class="chip chip-sm"
                :class="{ 'chip-on': form.aspecto === a }"
                @click="setAspecto(a)">{{ a }}</button>
              <span v-for="item in outroAspecto.items" :key="`asp-${item}`"
                class="chip chip-sm chip-has-action chip-on"
                >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroAspecto, item)">×</button></span>
              <button class="chip chip-sm"
                :class="{ 'chip-on': outroAspecto.aberto }"
                @click="toggleOutro(outroAspecto)">Outro</button>
            </div>
            <div v-if="outroAspecto.aberto" class="outro-input-row">
              <input type="text" v-model="outroAspecto.input"
                placeholder="Ex: exsudato fibrinoso, odor fétido..."
                @keyup.enter="addOutroItem(outroAspecto)">
              <button class="chip chip-sm chip-on" @click="addOutroItem(outroAspecto)" :disabled="!outroAspecto.input.trim()">+</button>
            </div>
          </div>

          <!-- Pele perilesão -->
          <div class="campo">
            <label>Pele perilesão <span class="opc">(opcional)</span></label>
            <div class="chips-wrap">
              <button v-for="p in perilesaoOpcoes" :key="p"
                class="chip chip-sm"
                :class="{ 'chip-on': form.perilesao === p }"
                @click="form.perilesao = form.perilesao === p ? '' : p">{{ p }}</button>
              <span v-for="item in outroPerilesao.items" :key="`peri-${item}`"
                class="chip chip-sm chip-has-action chip-on"
                >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroPerilesao, item)">×</button></span>
              <button class="chip chip-sm"
                :class="{ 'chip-on': outroPerilesao.aberto }"
                @click="toggleOutro(outroPerilesao)">Outro</button>
            </div>
            <div v-if="outroPerilesao.aberto" class="outro-input-row">
              <input type="text" v-model="outroPerilesao.input"
                placeholder="Ex: endurecida, com bolhas..."
                @keyup.enter="addOutroItem(outroPerilesao)">
              <button class="chip chip-sm chip-on" @click="addOutroItem(outroPerilesao)" :disabled="!outroPerilesao.input.trim()">+</button>
            </div>
          </div>

          <!-- Bordas -->
          <div class="campo">
            <label>Bordas <span class="opc">(opcional)</span></label>
            <div class="chips-wrap">
              <button v-for="b in bordasOpcoes" :key="b"
                class="chip chip-sm"
                :class="{ 'chip-on': form.bordas === b }"
                @click="form.bordas = form.bordas === b ? '' : b">{{ b }}</button>
              <span v-for="item in outroBordas.items" :key="`bor-${item}`"
                class="chip chip-sm chip-has-action chip-on"
                >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroBordas, item)">×</button></span>
              <button class="chip chip-sm"
                :class="{ 'chip-on': outroBordas.aberto }"
                @click="toggleOutro(outroBordas)">Outro</button>
            </div>
            <div v-if="outroBordas.aberto" class="outro-input-row">
              <input type="text" v-model="outroBordas.input"
                placeholder="Ex: descoladas, enroladas..."
                @keyup.enter="addOutroItem(outroBordas)">
              <button class="chip chip-sm chip-on" @click="addOutroItem(outroBordas)" :disabled="!outroBordas.input.trim()">+</button>
            </div>
          </div>

        </template>
        </template>

        <!-- Aspecto (só dreno — caso específico) -->
        <div v-if="form.tipo && form.tipo !== 'placa' && form.ehDreno" class="campo">
          <label>Aspecto da ferida <span class="opc">(opcional)</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button v-for="a in aspectoChips" :key="a" class="chip chip-sm"
              :class="{ 'chip-on': form.aspecto === a }"
              @click="setAspecto(a)">{{ a }}</button>
            <span v-for="item in outroAspecto.items" :key="`asp2-${item}`"
              class="chip chip-sm chip-has-action chip-on"
              >{{ item }}<button class="chip-del-btn" @click.stop="removeOutroItem(outroAspecto, item)">×</button></span>
            <button class="chip chip-sm"
              :class="{ 'chip-on': outroAspecto.aberto }"
              @click="toggleOutro(outroAspecto)">Outro</button>
          </div>
          <div v-if="outroAspecto.aberto" class="outro-input-row">
            <input type="text" v-model="outroAspecto.input"
              placeholder="Ex: exsudato fibrinoso, odor fétido..."
              @keyup.enter="addOutroItem(outroAspecto)">
            <button class="chip chip-sm chip-on" @click="addOutroItem(outroAspecto)" :disabled="!outroAspecto.input.trim()">+</button>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary btn-generate" @click="gerar"><IconGenerateNote />Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <ResultadoAnotacao
        v-if="gerado"
        :icon="iconCurativo"
        v-model:texto="textoGerado"
        v-model:nomePaciente="form.nome"
        v-model:leitoPaciente="form.leito"
        :salvando="salvando"
        label-nova="Novo curativo"
        @copiar="copiar"
        @salvar="salvar"
        @compartilhar="compartilhar"
        @nova="novaAnotacao"
        @editar="gerado = false; passo = 2"
      />

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'
import { useCopia } from '../../composables/useCopia.js'
import IconGenerateNote from '../../components/icons/IconGenerateNote.vue'
import ResultadoAnotacao from '../../components/ResultadoAnotacao.vue'
import iconCurativo from '../../assets/dashboard-icons-png/curativo.png'
import { db } from '../../firebase.js'
import { ref as dbRef, push, onValue, off, remove } from 'firebase/database'

const router         = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const authStore      = useAuthStore()
const { showToast }  = useToast()
const { copiado, copiar: _copiar } = useCopia()
// ── Estado ──
const passo            = ref(1)
const gerado           = ref(false)
const textoGerado      = ref('')
const erro             = ref('')
const salvando         = ref(false)
const materiaisTemporarios = ref([])

// ── Chips temporários "Outro" (sem banco) ──
const outroOclusao    = reactive({ aberto: false, input: '', items: [] })
const outroSolucao    = reactive({ aberto: false, input: '', items: [] })
const outroLeito      = reactive({ aberto: false, input: '', items: [] })
const outroAspecto    = reactive({ aberto: false, input: '', items: [] })
const outroPerilesao  = reactive({ aberto: false, input: '', items: [] })
const outroBordas     = reactive({ aberto: false, input: '', items: [] })

function toggleOutro(outro) {
  outro.aberto = !outro.aberto
}
function addOutroItem(outro) {
  const txt = outro.input.trim()
  if (!txt || outro.items.includes(txt)) return
  outro.items.push(txt)
  outro.input = ''
}
function removeOutroItem(outro, item) {
  outro.items = outro.items.filter(i => i !== item)
}
function resetOutro(outro) {
  outro.aberto = false; outro.input = ''; outro.items = []
}

// ── Formulário ──
const form = reactive({
  horario:        '',
  nome:           '',
  leito:          '',
  tipo:           '',      // 'curativo' | 'troca' | 'placa'
  ehDreno:        false,
  dreno:          '',      // ex: "da nefrostomia D e E"
  local:          [],      // array de locais selecionados
  materiais:      [],
  condicao:       true,
  aspecto:        '',
  solucaoLimpeza: [],    // SF 0,9% | Água destilada | PHMB 0,1% | etc.
  referencia:     '',    // 'prescricao' | 'orientacao' | 'ambos' | ''
  referenciaEnf:  '',    // nome do Enf. (quando orientacao ou ambos)
  // Avaliação COREN
  tipoLesao:      '',      // LPP | ferida operatória | escoriação | úlcera venosa | etc.
  tipoLesaoCustom: '',     // texto livre para tipo de lesão customizado
  tipoLesaoOutro: false,   // toggle chip "Outro" tipo lesão
  largura:        '',
  comprimento:    '',
  leitoFerida:    [],      // granulação | epitelização | necrose | esfacelo...
  leitoOutro:     '',
  exsudatoQtd:   '',      // pequena | média | grande | ausente
  perilesao:      '',      // íntegra | hiperemiada | macerada | queratose | outro
  perilesaoOutro: '',
  bordas:         '',      // regular | irregular | aproximadas | abertas
})

// ── Locais customizados (Firebase) ──
const locaisCustom      = ref([])
const locaisTemporarios = ref([])
const adicionandoLocal  = ref(false)
const novoLocalTxt      = ref('')
const refNovoLocal      = ref(null)
let unsubLocais = null

// ── Materiais customizados (Firebase) ──
const materiaisCustom     = ref([])
const adicionandoMaterial = ref(false)
const novoMaterialTxt     = ref('')
const refNovoMaterial     = ref(null)
let unsubMateriais = null

function _code() { return authStore.syncCode }
const _locCacheKey = code => `cache_curativo_locais_${code}`
const _matCacheKey = code => `cache_curativo_materiais_${code}`

function iniciarLocais() {
  const code = _code()
  if (!code) return
  try {
    const cached = JSON.parse(localStorage.getItem(_locCacheKey(code)) || '[]')
    if (cached.length) locaisCustom.value = cached
  } catch {}
  const path = dbRef(db, `curativo/${code}/locais`)
  unsubLocais = onValue(path, (snap) => {
    const lista = []
    snap.forEach(c => { lista.push({ ...c.val(), _key: c.key }) })
    lista.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    locaisCustom.value = lista
    try { localStorage.setItem(_locCacheKey(code), JSON.stringify(lista)) } catch {}
  })
}

async function abrirAddLocal() {
  adicionandoLocal.value = true
  await nextTick()
  refNovoLocal.value?.focus()
}

function fecharAddLocal() {
  adicionandoLocal.value = false
  novoLocalTxt.value = ''
}

async function salvarLocalCustom() {
  const texto = novoLocalTxt.value.trim()
  if (!texto) return
  if (!navigator.onLine) { showToast('Sem internet — local não foi salvo'); return }
  await push(dbRef(db, `curativo/${_code()}/locais`), { texto, criadoEm: Date.now() })
  if (!form.local.includes(texto)) form.local.push(texto)
  fecharAddLocal()
}

function adicionarLocalTemporario() {
  const texto = novoLocalTxt.value.trim()
  if (!texto) return
  if (!locaisTemporarios.value.includes(texto) && !locaisCustom.value.some(l => l.texto === texto) && !locaisChips.includes(texto)) {
    locaisTemporarios.value.push(texto)
  }
  if (!form.local.includes(texto)) form.local.push(texto)
  fecharAddLocal()
}

function removerLocalTemporario(texto) {
  locaisTemporarios.value = locaisTemporarios.value.filter(l => l !== texto)
  const idx = form.local.indexOf(texto)
  if (idx >= 0) form.local.splice(idx, 1)
}

async function removerLocalCustom(key) {
  const loc = locaisCustom.value.find(l => l._key === key)
  if (loc) {
    const idx = form.local.indexOf(loc.texto)
    if (idx >= 0) form.local.splice(idx, 1)
  }
  await remove(dbRef(db, `curativo/${_code()}/locais/${key}`))
}

function iniciarMateriais() {
  const code = _code()
  if (!code) return
  try {
    const cached = JSON.parse(localStorage.getItem(_matCacheKey(code)) || '[]')
    if (cached.length) materiaisCustom.value = cached
  } catch {}
  const path = dbRef(db, `curativo/${code}/materiais`)
  unsubMateriais = onValue(path, (snap) => {
    const lista = []
    snap.forEach(c => { lista.push({ ...c.val(), _key: c.key }) })
    lista.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    materiaisCustom.value = lista
    try { localStorage.setItem(_matCacheKey(code), JSON.stringify(lista)) } catch {}
  })
}

async function abrirAddMaterial() {
  adicionandoMaterial.value = true
  await nextTick()
  refNovoMaterial.value?.focus()
}

function fecharAddMaterial() {
  adicionandoMaterial.value = false
  novoMaterialTxt.value = ''
}

function _txtEq(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()
}

function _containsText(lista, texto) {
  return lista.some(item => _txtEq(item, texto))
}

function _resolverMaterialExistente(texto) {
  if (_containsText(materiaisOpcoes, texto)) {
    return materiaisOpcoes.find(item => _txtEq(item, texto))
  }
  if (materiaisCustom.value.some(item => _txtEq(item.texto, texto))) {
    return materiaisCustom.value.find(item => _txtEq(item.texto, texto))?.texto || texto
  }
  if (_containsText(materiaisTemporarios.value, texto)) {
    return materiaisTemporarios.value.find(item => _txtEq(item, texto))
  }
  return ''
}

function materialSelecionado(texto) {
  return form.materiais.some(item => _txtEq(item, texto))
}

function toggleMaterial(texto) {
  const idx = form.materiais.findIndex(item => _txtEq(item, texto))
  if (idx >= 0) form.materiais.splice(idx, 1)
  else form.materiais.push(texto)
}

function removerMaterialSelecionado(texto) {
  const idx = form.materiais.findIndex(item => _txtEq(item, texto))
  if (idx >= 0) form.materiais.splice(idx, 1)
}

function adicionarMaterialSelecionado(texto) {
  if (!materialSelecionado(texto)) form.materiais.push(texto)
}

function adicionarMaterialTemporario() {
  const texto = novoMaterialTxt.value.trim()
  if (!texto) return

  const existente = _resolverMaterialExistente(texto)
  if (existente) {
    adicionarMaterialSelecionado(existente)
    fecharAddMaterial()
    return
  }

  materiaisTemporarios.value.push(texto)
  adicionarMaterialSelecionado(texto)
  fecharAddMaterial()
}

async function salvarMaterialCustom() {
  const texto = novoMaterialTxt.value.trim()
  if (!texto) return

  const existente = _resolverMaterialExistente(texto)
  if (existente) {
    adicionarMaterialSelecionado(existente)
    fecharAddMaterial()
    return
  }

  if (!navigator.onLine) {
    showToast('Sem internet — material não foi salvo')
    return
  }
  await push(dbRef(db, `curativo/${_code()}/materiais`), { texto, criadoEm: Date.now() })
  adicionarMaterialSelecionado(texto)
  fecharAddMaterial()
}

async function removerMaterialCustom(key) {
  const mat = materiaisCustom.value.find(m => m._key === key)
  if (mat) {
    removerMaterialSelecionado(mat.texto)
  }
  await remove(dbRef(db, `curativo/${_code()}/materiais/${key}`))
}

function removerMaterialTemporario(texto) {
  materiaisTemporarios.value = materiaisTemporarios.value.filter(item => !_txtEq(item, texto))
  removerMaterialSelecionado(texto)
}

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_curativo', form, () => !!(form.horario || form.nome))

// ── Opções ──
const locaisChips = ['MSD', 'MID', 'MSE', 'MIE', 'MMII', 'MMSS', 'região abdominal', 'região sacral', 'região lombar', 'região cervical']

const coberturaOpcoes = [
  'Rayon', 'AGE', 'Hidrogel', 'Adaptic',
  'Placa de alginato de cálcio',
  'Placa de alginato de cálcio com prata',
]

const oclusaoOpcoes = ['Gaze', 'Atadura', 'Filme transparente']

// Todos os materiais (cobertura + oclusão) para lógica interna
const materiaisOpcoes = [...coberturaOpcoes, ...oclusaoOpcoes]

const solucoesOpcoes = [
  'SF 0,9%', 'Água destilada', 'PHMB 0,1%',
  'Ringer Lactato', 'Ácido hipocloroso',
]

const tiposLesaoOpcoes = [
  'LPP', 'ferida operatória', 'escoriação',
  'úlcera venosa', 'úlcera arterial', 'úlcera diabética',
  'queimadura', 'deiscência', 'lesão por fricção',
]

const aspectoChips = [
  'exsudato sanguinolento', 'exsudato purulento',
  'exsudato seroso', 'exsudato serossanguinolento',
]

const perilesaoOpcoes = ['íntegra', 'hiperemiada', 'macerada', 'queratose', 'descamativa', 'edemaciada', 'ressecada']

const bordasOpcoes = ['regular', 'irregular', 'aproximadas', 'abertas']

const leitoOpcoes = ['granulação', 'granulação pálida', 'hipergranulação', 'epitelização', 'esfacelo', 'fibrina', 'necrose seca', 'necrose úmida', 'espaço morto']

const avaliacaoExpandida = ref(false)

function toggleSolucao(v) {
  const i = form.solucaoLimpeza.indexOf(v)
  if (i === -1) form.solucaoLimpeza.push(v)
  else form.solucaoLimpeza.splice(i, 1)
}

function toggleLeitoFerida(v) {
  const i = form.leitoFerida.indexOf(v)
  if (i === -1) form.leitoFerida.push(v)
  else form.leitoFerida.splice(i, 1)
}

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  iniciarLocais()
  iniciarMateriais()
  iniciarRascunho()
})

onUnmounted(() => {
  const code = _code()
  if (code && unsubLocais)   off(dbRef(db, `curativo/${code}/locais`))
  if (code && unsubMateriais) off(dbRef(db, `curativo/${code}/materiais`))
})

// ── Helpers ──
function selecionarPaciente(p) {
  if (form.nome === p.nome && form.leito === (p.leito || '')) {
    form.nome = ''
    form.leito = ''
    return
  }
  form.nome  = p.nome
  form.leito = p.leito || ''
}

function toggleLocal(value) {
  const idx = form.local.indexOf(value)
  if (idx >= 0) form.local.splice(idx, 1)
  else form.local.push(value)
}

function desfocarChipAposClique(event) {
  const alvo = event.target
  if (!alvo || typeof alvo.closest !== 'function') return
  const chip = alvo.closest('button.chip')
  if (!chip) return
  requestAnimationFrame(() => {
    if (document.activeElement === chip) chip.blur()
  })
}


function setAspecto(value) {
  form.aspecto = form.aspecto === value ? '' : value
}

function localTexto() {
  const todos = [...form.local]
  if (todos.length === 0) return ''
  if (todos.length === 1) return todos[0]
  return todos.slice(0, -1).join(', ') + ' e ' + todos[todos.length - 1]
}

function materiaisTexto() {
  const ordenados = []
  const add = (valor) => {
    if (!materialSelecionado(valor)) return
    if (_containsText(ordenados, valor)) return
    ordenados.push(valor)
  }

  materiaisOpcoes.forEach(add)
  materiaisCustom.value.forEach(item => add(item.texto))
  materiaisTemporarios.value.forEach(add)
  form.materiais.forEach(add)

  return ordenados
}

function separarMateriais() {
  const todos = materiaisTexto()
  const cobertura = todos.filter(m => !oclusaoOpcoes.some(o => _txtEq(o, m)))
  const oclusao = todos.filter(m => oclusaoOpcoes.some(o => _txtEq(o, m)))
  outroOclusao.items.forEach(i => { if (!oclusao.includes(i)) oclusao.push(i) })
  return { cobertura, oclusao }
}

function joinMateriais(lista) {
  if (lista.length === 0) return ''
  if (lista.length === 1) return lista[0]
  return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1]
}

function formatHora(h) { return h ? h.replace(':', 'h') : '' }

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) { passo.value--; return }
  router.push({ name: 'dashboard' })
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''; form.nome = ''; form.leito = ''
  } else {
    form.tipo = ''; form.ehDreno = false; form.dreno = ''
    form.local = []; locaisTemporarios.value = []
    form.materiais = []; materiaisTemporarios.value = []
    form.solucaoLimpeza = []; form.referencia = ''; form.referenciaEnf = ''
    form.condicao = true; form.aspecto = ''
    form.tipoLesao = ''; form.tipoLesaoCustom = ''; form.tipoLesaoOutro = false
    form.bordas = ''
    resetOutro(outroOclusao); resetOutro(outroSolucao)
    resetOutro(outroLeito); resetOutro(outroAspecto)
    resetOutro(outroPerilesao); resetOutro(outroBordas)
  }
}

function avancar() {
  erro.value = ''
  if (!form.horario) {
    erro.value = 'Informe o horário.'
    return
  }
  passo.value++
}

// ── Helpers de texto ──
function solucaoTexto() {
  const sols = [...form.solucaoLimpeza, ...outroSolucao.items]
  if (sols.length === 0) return ''
  if (sols.length === 1) return sols[0]
  return sols.slice(0, -1).join(', ') + ' e ' + sols[sols.length - 1]
}

function tipoLesaoTexto() {
  if (form.tipoLesao) return form.tipoLesao
  if (form.tipoLesaoCustom.trim()) return form.tipoLesaoCustom.trim()
  return ''
}

function referenciaTexto() {
  const enf = form.referenciaEnf.trim() ? ` ${form.referenciaEnf.trim()}` : ''
  if (form.referencia === 'prescricao') return 'Conforme prescrição de enfermagem.'
  if (form.referencia === 'orientacao') return `Conforme orientação Enf.${enf}.`
  if (form.referencia === 'ambos') return `Conforme prescrição de enfermagem e orientação Enf.${enf}.`
  return ''
}

// ── Gerar texto ──
function gerar() {
  erro.value = ''

  const hora = formatHora(form.horario)

  if (!form.tipo) {
    erro.value = 'Selecione o tipo de curativo.'
    return
  }

  if (form.tipo !== 'placa' && form.ehDreno && !form.dreno.trim()) {
    erro.value = 'Informe o dreno.'
    return
  }

  if (!form.ehDreno && !localTexto()) {
    erro.value = 'Informe o local do curativo.'
    return
  }

  const localPart = form.ehDreno
    ? ` de dreno ${form.dreno.trim()}`
    : ` em ${localTexto()}`

  if (form.tipo === 'placa') {
    let texto = `${hora} – Realizado troca de placa de hidrocoloide${localPart}.`
    const ref = referenciaTexto()
    if (ref) texto += ` ${ref}`
    textoGerado.value = texto
    gerado.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const { cobertura, oclusao } = separarMateriais()
  const solucao = solucaoTexto()
  const lesaoTipo = tipoLesaoTexto()

  const verbo = form.tipo === 'troca' ? 'troca de curativo' : 'curativo'
  const lesaoPart = lesaoTipo ? ` em ${lesaoTipo}` : ''
  let texto = `${hora} – Realizado ${verbo}${lesaoPart}${localPart}.`

  // Limpeza (solução separada dos materiais)
  if (solucao) {
    texto += ` Realizado limpeza com ${solucao}.`
  }

  // Cobertura (materiais aplicados na ferida)
  if (cobertura.length > 0) {
    texto += ` Aplicado ${joinMateriais(cobertura)}.`
  }

  // Oclusão (o que fecha o curativo)
  if (form.condicao) {
    if (oclusao.length > 0) {
      texto += ` Ocluído com ${joinMateriais(oclusao)}, limpo e seco externamente.`
    } else {
      texto += ' Ocluído, limpo e seco externamente.'
    }
  }

  // Bloco de avaliação COREN
  if (!form.ehDreno) {
    if (form.largura || form.comprimento) {
      const partes = []
      if (form.largura)      partes.push(`${form.largura} cm de largura`)
      if (form.comprimento)  partes.push(`${form.comprimento} cm de comprimento`)
      texto += ` Lesão com ${partes.join(' e ')}.`
    }

    if (form.leitoFerida.length || outroLeito.items.length) {
      const leitos = [...form.leitoFerida, ...outroLeito.items]
      if (leitos.length) texto += ` Leito com tecido de ${leitos.join(', ')}.`
    }

    const exsudatoParts = []
    if (form.aspecto.trim())  exsudatoParts.push(form.aspecto.trim())
    outroAspecto.items.forEach(i => exsudatoParts.push(i))
    if (form.exsudatoQtd)     exsudatoParts.push(form.exsudatoQtd)
    if (exsudatoParts.length) texto += ` ${exsudatoParts.join(', ')}.`

    if (form.perilesao || outroPerilesao.items.length) {
      const periParts = []
      if (form.perilesao) periParts.push(form.perilesao)
      outroPerilesao.items.forEach(i => periParts.push(i))
      texto += ` Pele perilesão ${periParts.join(', ')}.`
    }
    const bordasParts = []
    if (form.bordas) bordasParts.push(form.bordas)
    outroBordas.items.forEach(i => bordasParts.push(i))
    const bordasTxt = bordasParts.join(', ')
    if (bordasTxt) texto += ` Bordas ${bordasTxt}.`
  } else if (form.aspecto.trim()) {
    texto += ` Ferida apresentando ${form.aspecto.trim()}.`
  }

  // Referência à prescrição (sempre no final)
  const ref = referenciaTexto()
  if (ref) texto += ` ${ref}`

  textoGerado.value = texto
  gerado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Copiar ──
async function copiar() {
  const ok = await _copiar(textoGerado.value)
  if (ok) showToast('Texto copiado!')
  else showToast('Erro ao copiar')
}

function compartilhar() {
  const texto = textoGerado.value
  if (navigator.share) {
    navigator.share({ text: texto }).catch(() => {})
  } else {
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// ── Salvar ──
async function salvar() {
  salvando.value = true
  try {
    const r = await anotacoesStore.salvar({
      tipo:  'curativo',
      texto: textoGerado.value,
      nome:  form.nome,
      leito: form.leito,
    })
    descartarRascunho()
    if (r?.modo === 'offline') showToast('Salvo offline - sincroniza automatico')
    else showToast('Salvo no histórico!')
  } catch { showToast('Erro ao salvar') }
  finally { salvando.value = false }
}

// ── Nova anotação ──
function novaAnotacao() {
  Object.assign(form, {
    horario: '', nome: '', leito: '',
    tipo: '', ehDreno: false, dreno: '',
    local: [], materiais: [],
    solucaoLimpeza: [], referencia: '', referenciaEnf: '',
    condicao: true, aspecto: '',
    tipoLesao: '', tipoLesaoCustom: '', tipoLesaoOutro: false,
    largura: '', comprimento: '',
    leitoFerida: [], exsudatoQtd: '',
    perilesao: '', bordas: '',
  })
  locaisTemporarios.value = []
  materiaisTemporarios.value = []
  resetOutro(outroOclusao); resetOutro(outroSolucao)
  resetOutro(outroLeito); resetOutro(outroAspecto)
  resetOutro(outroPerilesao); resetOutro(outroBordas)
  textoGerado.value = ''; gerado.value = false; passo.value = 1
  erro.value = ''; copiado.value = false
  descartarRascunho()
}
</script>

<style scoped>
.outro-input-row {
  display: flex; gap: 8px; margin-top: 8px; align-items: center;
}
.outro-input-row input {
  flex: 1;
}
.outro-input-row button {
  flex-shrink: 0; min-width: 36px; height: 36px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
}

.btn-icon {
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }

.btn-home-logo {
  display: flex; align-items: center; gap: 6px;
  color: var(--blue); font-size: 1.05rem; font-weight: 700;
  background: none; border: none; cursor: pointer; font-family: inherit;
}

.progress-wrap { height: 4px; background: var(--border); position: relative; }
.progress-fill { height: 100%; background: var(--blue); transition: width 0.3s; }
.progress-label { position: absolute; right: 16px; top: 6px; font-size: 0.7rem; color: var(--text-muted); }

.bloco-titulo {
  font-size: 1.1rem; font-weight: 700; color: var(--text);
  margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
}
.opc { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }

.chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.chip:active { opacity: 0.8; }
.chip:focus,
.chip:focus-visible { outline: none; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }
.chip-sm { padding: 6px 12px; font-size: 0.85rem; }
.chip-add { border-style: dashed; color: var(--text-muted); }
.chip-material { padding: 10px 16px; border-radius: 14px; font-size: 0.9rem; }
.chip-temp { border-style: dashed; }
.chip-has-action { padding-right: 8px; user-select: none; }

.chip-del { margin-left: 4px; opacity: 0.7; font-size: 1rem; line-height: 1; }
.chip-del-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); font-size: 1rem; padding: 0 0 0 6px;
  line-height: 1; flex-shrink: 0;
}
.chip-on .chip-del-btn { color: rgba(255, 255, 255, 0.9); }
.chip-del-btn:hover { color: var(--danger); }

.add-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.add-input {
  flex: 1; min-width: 160px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 8px 12px;
  color: var(--text); font-family: inherit; font-size: 0.9rem;
}

.material-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.material-tip { display: inline-block; margin-top: 8px; color: var(--text-muted); font-size: 0.78rem; }

.tamanho-row { display: flex; align-items: center; gap: 10px; }
.input-cm { display: flex; align-items: center; gap: 6px; flex: 1; }
.input-cm input { flex: 1; }
.cm-label { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
.cm-sep { font-size: 1.2rem; color: var(--text-dim); flex-shrink: 0; }

.bloco-nav { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bloco-nav .btn-primary { flex: 1; }

.rascunho-banner {
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius); padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
}
.rascunho-info { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-dim); }
.rascunho-acoes { display: flex; gap: 8px; }
.btn-sm { padding: 7px 14px !important; font-size: 0.82rem !important; }

.resultado-box {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px;
  font-size: 0.9rem; line-height: 1.7; color: var(--text);
  white-space: pre-wrap; font-family: inherit; margin-bottom: 16px;
  width: 100%; box-sizing: border-box; resize: vertical; outline: none;
}
.btn-copy {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-dim);
  font-family: inherit; font-size: 0.95rem; cursor: pointer; margin-bottom: 8px;
}
.btn-copy:active { background: var(--bg-hover); }
.nav-row { display: flex; gap: 10px; margin-top: 8px; }
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 6px; }

.checkbox-label:has(input:checked),
.checkbox-label.checked {
  border-color: var(--border);
}

.btn-expandir {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 12px 16px; margin: 8px 0;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-dim);
  font-family: inherit; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; text-align: left;
}
.btn-expandir:active { background: var(--bg-hover); }
.expandir-icone { font-size: 0.8rem; color: var(--text-muted); }

.curativo-screen {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, var(--blue-faint), transparent 30%),
    var(--bg);
}

.curativo-header {
  background: rgba(6, 22, 15, 0.86);
  border-bottom: 1px solid rgba(92, 185, 139, 0.16);
  backdrop-filter: blur(18px);
}

.curativo-page {
  padding: 18px 16px 120px;
}

.curativo-progress {
  height: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.curativo-progress .progress-fill {
  background: linear-gradient(90deg, #37c58a, #6ee7b7);
  box-shadow: 0 0 18px rgba(55, 197, 138, 0.38);
}

.curativo-progress .progress-label {
  top: 10px;
  color: rgba(209, 250, 229, 0.72);
  font-weight: 700;
}

.paciente-atalho {
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid rgba(92, 185, 139, 0.2);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(11, 33, 25, 0.94), rgba(9, 25, 22, 0.9));
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
}

.paciente-atalho label {
  display: block;
  margin-bottom: 10px;
  color: rgba(236, 253, 245, 0.82);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.chips-scroll::-webkit-scrollbar {
  display: none;
}

.module-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 4px 0 18px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-card);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.26);
}

.module-hero-icon {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: radial-gradient(circle at top, color-mix(in srgb, var(--blue) 18%, transparent), color-mix(in srgb, var(--blue-dark) 36%, var(--bg-input) 64%));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}

.module-hero-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.module-hero-copy h1 {
  margin: 0 0 6px;
  color: #f0fdf4;
  font-size: 1.5rem;
  line-height: 1.05;
  letter-spacing: 0;
}

.module-hero-copy p {
  margin: 0;
  color: rgba(209, 250, 229, 0.72);
  font-size: 0.92rem;
  line-height: 1.35;
}

.curativo-card {
  padding: 18px;
  border: 1px solid rgba(92, 185, 139, 0.2);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(10, 29, 23, 0.98), rgba(8, 20, 18, 0.96)),
    radial-gradient(circle at 12% 0%, rgba(55, 197, 138, 0.08), transparent 26%);
  box-shadow: 0 22px 58px rgba(0, 0, 0, 0.28);
}

.curativo-card + .curativo-card {
  margin-top: 14px;
}

.bloco-titulo {
  color: #f0fdf4;
  border-bottom-color: rgba(92, 185, 139, 0.18);
  font-size: 1.08rem;
}

.campo {
  margin-bottom: 18px;
}

.campo > label,
.campo .checkbox-label span {
  color: rgba(236, 253, 245, 0.84);
  font-weight: 750;
}

.campo input[type="text"],
.campo input[type="time"],
.campo input[type="number"],
.add-input,
.outro-input-row input {
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(92, 185, 139, 0.2);
  background: rgba(2, 12, 10, 0.5);
  color: #f8fafc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.campo input:focus,
.add-input:focus,
.outro-input-row input:focus {
  border-color: rgba(110, 231, 183, 0.58);
  box-shadow: 0 0 0 3px rgba(55, 197, 138, 0.14);
  outline: none;
}

.chip {
  min-height: 42px;
  border-radius: 13px;
  border-color: rgba(92, 185, 139, 0.18);
  background: rgba(3, 16, 13, 0.58);
  color: rgba(226, 232, 240, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.chip-sm {
  min-height: 38px;
}

.chip:hover {
  border-color: rgba(110, 231, 183, 0.36);
  background: rgba(10, 37, 29, 0.82);
}

.chip-on {
  border-color: rgba(110, 231, 183, 0.72);
  background: linear-gradient(135deg, #16845c, #23b17a);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(35, 177, 122, 0.22);
}

.chip.chip-on:hover {
  border-color: rgba(110, 231, 183, 0.72);
  background: linear-gradient(135deg, #16845c, #23b17a);
  color: #ffffff;
}

.chip-add {
  border-color: rgba(110, 231, 183, 0.38);
  color: #86efac;
  background: rgba(13, 45, 33, 0.5);
}

.chip-temp {
  border-color: rgba(125, 211, 252, 0.34);
}

.checkbox-label {
  padding: 14px;
  border: 1px solid rgba(92, 185, 139, 0.18);
  border-radius: 14px;
  background: rgba(3, 16, 13, 0.52);
}

.checkbox-label:has(input:checked),
.checkbox-label.checked {
  border-color: rgba(110, 231, 183, 0.58);
  background: rgba(20, 83, 45, 0.34);
}

.btn-expandir {
  min-height: 52px;
  border-radius: 16px;
  border-color: rgba(92, 185, 139, 0.22);
  background: linear-gradient(135deg, rgba(11, 33, 25, 0.96), rgba(8, 23, 20, 0.92));
  color: #d1fae5;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.2);
}

.add-row,
.outro-input-row {
  padding: 12px;
  border: 1px solid rgba(92, 185, 139, 0.16);
  border-radius: 16px;
  background: rgba(3, 16, 13, 0.42);
}

.material-actions .chip {
  min-height: 38px;
}

.bloco-nav {
  gap: 10px;
  padding-top: 4px;
}

.bloco-nav .btn {
  border-radius: 14px;
}

.btn-generate {
  min-height: 52px;
  gap: 10px;
  box-shadow: 0 16px 34px rgba(35, 177, 122, 0.28);
}

.erro-msg {
  padding: 10px 12px;
  border: 1px solid rgba(248, 113, 113, 0.26);
  border-radius: 12px;
  background: rgba(127, 29, 29, 0.18);
}

@media (max-width: 430px) {
  .curativo-page {
    padding: 16px 12px 110px;
  }

  .module-hero,
  .curativo-card,
  .paciente-atalho {
    border-radius: 18px;
  }

  .module-hero {
    align-items: flex-start;
    padding: 16px;
  }

  .module-hero-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }

  .module-hero-icon img {
    width: 42px;
    height: 42px;
  }

  .module-hero-copy h1 {
    font-size: 1.32rem;
  }

  .bloco-nav {
    flex-wrap: wrap;
  }

  .bloco-nav .btn-primary {
    min-width: 100%;
  }
}

.curativo-screen {
  background:
    radial-gradient(circle at 14% 0%, var(--blue-faint), transparent 30%),
    var(--bg);
}

.curativo-header {
  background: rgba(8, 20, 37, 0.92);
  border-bottom-color: color-mix(in srgb, var(--border) 70%, var(--blue) 30%);
}

.curativo-progress {
  background: var(--bg-hover);
}

.curativo-progress .progress-fill {
  background: linear-gradient(90deg, var(--blue-dark), var(--blue));
  box-shadow: 0 0 14px var(--blue-faint);
}

.curativo-progress .progress-label {
  color: var(--text-dim);
}

.paciente-atalho {
  border-color: var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
}

.paciente-atalho label {
  color: var(--text-dim);
}

.module-hero {
  border-color: var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  box-shadow: 0 20px 38px rgba(3, 10, 22, 0.26);
}

.module-hero-icon {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: radial-gradient(circle at top, color-mix(in srgb, var(--blue) 18%, transparent), color-mix(in srgb, var(--blue-dark) 36%, var(--bg-input) 64%));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}

.module-hero-copy h1,
.bloco-titulo {
  color: var(--text);
}

.module-hero-copy p {
  color: var(--text-dim);
}

.curativo-card {
  border-color: var(--border);
  background:
    radial-gradient(circle at top left, var(--blue-faint), transparent 34%),
    linear-gradient(180deg, var(--bg-input), var(--bg-card));
}

.bloco-titulo {
  border-bottom-color: var(--border);
}

.campo > label,
.campo .checkbox-label span {
  color: var(--text);
}

.campo input[type="text"],
.campo input[type="time"],
.campo input[type="number"],
.add-input,
.outro-input-row input {
  border-color: var(--border);
  background: var(--bg-input);
  color: var(--text);
}

.campo input:focus,
.add-input:focus,
.outro-input-row input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-faint);
}

.chip {
  border-color: var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
}

.chip:hover {
  border-color: var(--blue);
  background: var(--bg-card);
}

.chip-on {
  border-color: var(--blue);
  background: linear-gradient(135deg, var(--blue-dark), var(--blue));
  color: #fff;
  box-shadow: 0 7px 16px color-mix(in srgb, var(--blue) 16%, transparent);
}

.chip.chip-on:hover {
  border-color: var(--blue);
  background: linear-gradient(135deg, var(--blue-dark), var(--blue));
  color: #fff;
}

.chip-add {
  border-color: var(--blue);
  color: var(--blue);
  background: var(--blue-muted);
}

.chip-temp {
  border-color: var(--border);
}

.checkbox-label {
  border-color: var(--border);
  background: var(--bg-input);
}

.checkbox-label:has(input:checked),
.checkbox-label.checked {
  border-color: var(--blue);
  background: var(--blue-muted);
}

.btn-expandir,
.add-row,
.outro-input-row {
  border-color: var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  color: var(--text);
}

.btn-generate {
  box-shadow: 0 16px 34px color-mix(in srgb, var(--blue) 24%, transparent);
}
</style>
