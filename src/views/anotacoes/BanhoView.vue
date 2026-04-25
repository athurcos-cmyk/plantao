<template>
  <div class="screen banho-screen">
    <header class="app-header banho-header">
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

    <!-- Barra de progresso -->
    <div v-if="!gerado" class="progress-wrap banho-progress">
      <div class="progress-fill" :style="{ width: (passo / 2 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 2</span>
    </div>

    <main class="container banho-page">

      <!-- Banner de rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info"><span>📝</span><span>Você tem um rascunho salvo</span></div>
        <div class="rascunho-acoes">
          <button class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

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
          <img :src="iconHigienizacao" alt="Higienização" />
        </div>
        <div class="module-hero-copy">
          <h1>Higienização</h1>
          <p>Registre banho, troca de fralda e cuidados de higiene.</p>
        </div>
      </section>

      <!-- ═══ BLOCO 1 — Identificação ═══ -->
      <div v-if="!gerado && passo === 1" class="banho-card">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input type="time" v-model="form.horario">
        </div>

        <div class="campo">
          <label>Gênero do paciente</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.genero === 'M' }" @click="form.genero = 'M'">M</button>
            <button class="chip" :class="{ 'chip-on': form.genero === 'F' }" @click="form.genero = 'F'">F</button>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Detalhes da higienização ═══ -->
      <div v-if="!gerado && passo === 2" class="banho-card">
        <h2 class="bloco-titulo">Detalhes da higienização</h2>

        <div class="campo">
          <label>Tipo</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.tipo === 'aspersao' }" @click="form.tipo = 'aspersao'">🚿 Banho de aspersão</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'leito' }" @click="form.tipo = 'leito'">🛁 Banho de leito</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'fralda' }" @click="form.tipo = 'fralda'">🧻 Troca de fralda</button>
          </div>
        </div>

        <!-- ── Banho de aspersão ── -->
        <template v-if="form.tipo === 'aspersao'">
          <div class="campo">
            <label>Deslocamento</label>
            <div class="chips-wrap">
              <button class="chip" :class="{ 'chip-on': !form.cadeiraBanho }" @click="form.cadeiraBanho = false">Deambulando</button>
              <button class="chip" :class="{ 'chip-on': form.cadeiraBanho }" @click="form.cadeiraBanho = true">Em cadeira de banho</button>
            </div>
          </div>

          <div class="campo">
            <label>Opções</label>
            <div class="radio-group vertical">
              <label class="checkbox-label" :class="{ checked: form.comAuxilio }">
                <input type="checkbox" v-model="form.comAuxilio">
                <span>Com auxílio</span>
              </label>
              <label class="checkbox-label" :class="{ checked: form.protecaoCateter }">
                <input type="checkbox" v-model="form.protecaoCateter">
                <span>Proteção de cateter</span>
              </label>
              <label class="checkbox-label" :class="{ checked: form.trocaRoupa }">
                <input type="checkbox" v-model="form.trocaRoupa">
                <span>Troca de roupa de cama</span>
              </label>
            </div>
          </div>

          <div v-if="form.comAuxilio" class="campo">
            <label>Acompanhante técnico <span class="opc">(opcional)</span></label>
            <div class="chips-wrap" style="margin-bottom:8px">
              <button class="chip chip-sm" :class="{ 'chip-on': form.acompGenero === 'M' }" @click="form.acompGenero = 'M'">Téc.</button>
              <button class="chip chip-sm" :class="{ 'chip-on': form.acompGenero === 'F' }" @click="form.acompGenero = 'F'">Téc.ª</button>
            </div>
            <input type="text" v-model="form.acompNome" placeholder="Nome do técnico(a)">
          </div>
        </template>

        <!-- ── Banho de leito ── -->
        <template v-if="form.tipo === 'leito'">
          <div class="campo">
            <label>Higiene realizada</label>
            <div class="chips-wrap">
              <button
                v-for="h in higieneOpcoes" :key="h"
                class="chip"
                :class="{ 'chip-on': form.higiene.includes(h) }"
                @click="toggleHigiene(h)"
              >{{ h }}</button>
              <span
                v-for="h in higieneExtras" :key="h"
                class="chip chip-has-action"
                :class="{ 'chip-on': form.higiene.includes(h) }"
                @click="toggleHigiene(h)"
              >
                {{ h }}
                <button class="chip-del-btn" @click.stop="removerHigieneExtra(h)">×</button>
              </span>
              <button class="chip" :class="{ 'chip-on': adicionandoHigiene }" @click="adicionandoHigiene = !adicionandoHigiene">Outro</button>
            </div>
            <div v-if="adicionandoHigiene" class="add-row" style="margin-top:8px">
              <input
                class="add-input"
                type="text"
                v-model="novaHigieneTxt"
                placeholder="Ex: coto umbilical, ostomia..."
                @keyup.enter="adicionarHigieneExtra"
                @keyup.esc="adicionandoHigiene = false"
                ref="refNovaHigiene"
              >
              <button class="chip chip-on" @click="adicionarHigieneExtra" :disabled="!novaHigieneTxt.trim()">+ Adicionar</button>
            </div>
          </div>

          <div class="campo">
            <label>Opções</label>
            <div class="radio-group vertical">
              <label class="checkbox-label" :class="{ checked: form.trocaRoupa }">
                <input type="checkbox" v-model="form.trocaRoupa">
                <span>Troca de roupa de cama</span>
              </label>
              <label class="checkbox-label" :class="{ checked: form.trocaFralda }">
                <input type="checkbox" v-model="form.trocaFralda">
                <span>Troca de fralda</span>
              </label>
            </div>
          </div>
        </template>

        <!-- ── Troca de fralda ── -->
        <template v-if="form.tipo === 'fralda'">
          <div class="campo">
            <label>Eliminação</label>
            <div class="chips-wrap">
              <button class="chip" :class="{ 'chip-on': form.eliminacao === 'diurese' }" @click="form.eliminacao = 'diurese'">Diurese</button>
              <button class="chip" :class="{ 'chip-on': form.eliminacao === 'evacuacao' }" @click="form.eliminacao = 'evacuacao'">Evacuação</button>
              <button class="chip" :class="{ 'chip-on': form.eliminacao === 'ambos' }" @click="form.eliminacao = 'ambos'">Ambos</button>
            </div>
          </div>

          <div v-if="form.eliminacao === 'diurese' || form.eliminacao === 'ambos'" class="campo">
            <label>Quantidade de diurese</label>
            <div class="chips-wrap">
              <button class="chip" :class="{ 'chip-on': form.qtdDiurese === '+' }" @click="form.qtdDiurese = '+'">+</button>
              <button class="chip" :class="{ 'chip-on': form.qtdDiurese === '++' }" @click="form.qtdDiurese = '++'">++</button>
              <button class="chip" :class="{ 'chip-on': form.qtdDiurese === '+++' }" @click="form.qtdDiurese = '+++'">+++</button>
            </div>
          </div>

          <div v-if="form.eliminacao === 'evacuacao' || form.eliminacao === 'ambos'" class="campo">
            <label>Quantidade de evacuação</label>
            <div class="chips-wrap">
              <button class="chip" :class="{ 'chip-on': form.qtdEvacuacao === '+' }" @click="form.qtdEvacuacao = '+'">+</button>
              <button class="chip" :class="{ 'chip-on': form.qtdEvacuacao === '++' }" @click="form.qtdEvacuacao = '++'">++</button>
              <button class="chip" :class="{ 'chip-on': form.qtdEvacuacao === '+++' }" @click="form.qtdEvacuacao = '+++'">+++</button>
            </div>
          </div>

          <div v-if="form.eliminacao" class="campo">
            <label>Local</label>
            <div class="chips-wrap">
              <button class="chip" :class="{ 'chip-on': form.localElim === 'leito' }" @click="form.localElim = 'leito'">Em leito</button>
              <button class="chip" :class="{ 'chip-on': form.localElim === 'fralda' }" @click="form.localElim = 'fralda'">Em fralda</button>
            </div>
          </div>
        </template>

        <!-- Prescrição de enfermagem -->
        <div v-if="form.tipo && form.tipo !== 'fralda'" class="campo">
          <label>Prescrição <span class="opc">(opcional)</span></label>
          <label class="checkbox-label" :class="{ checked: form.conformePrescricao }">
            <input type="checkbox" v-model="form.conformePrescricao">
            <span>Conforme prescrição de enfermagem</span>
          </label>
        </div>

        <!-- Intercorrências -->
        <div v-if="form.tipo" class="campo">
          <label>Intercorrências</label>
          <div class="radio-group vertical">
            <label class="checkbox-label" :class="{ checked: form.semIntercorrencias }">
              <input type="checkbox" v-model="form.semIntercorrencias">
              <span>Sem intercorrências</span>
            </label>
          </div>
          <div v-if="!form.semIntercorrencias" style="margin-top:10px">
            <textarea v-model="form.intercorrencia" rows="3" placeholder="Descreva a intercorrência..."></textarea>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary btn-generate" @click="gerar"><IconGenerateNote />Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <ResultadoAnotacao
        v-if="gerado"
        :icon="iconHigienizacao"
        v-model:texto="textoGerado"
        v-model:nomePaciente="form.nome"
        v-model:leitoPaciente="form.leito"
        :salvando="salvando"
        label-nova="Nova higienização"
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
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'
import { useCopia } from '../../composables/useCopia.js'
import IconGenerateNote from '../../components/icons/IconGenerateNote.vue'
import ResultadoAnotacao from '../../components/ResultadoAnotacao.vue'
import iconHigienizacao from '../../assets/dashboard-icons-png/higienizacao.png'

const router         = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const { showToast }  = useToast()
const { copiar: _copiar } = useCopia()

// ── Estado ──
const passo       = ref(1)
const gerado      = ref(false)
const textoGerado = ref('')
const erro        = ref('')
const salvando    = ref(false)

// ── Formulário ──
const form = reactive({
  horario:            '',
  genero:             'M',
  nome:               '',
  leito:              '',
  tipo:               '',      // 'aspersao' | 'leito' | 'fralda'
  // Fralda
  eliminacao:         '',     // 'diurese' | 'evacuacao' | 'ambos'
  qtdDiurese:         '',     // '+' | '++' | '+++'
  qtdEvacuacao:       '',     // '+' | '++' | '+++'
  localElim:          '',     // 'leito' | 'fralda'
  cadeiraBanho:       false,
  comAuxilio:         false,
  acompGenero:        'M',
  acompNome:          '',
  protecaoCateter:    false,
  trocaRoupa:         false,
  higiene:            [],
  trocaFralda:        false,
  semIntercorrencias:    true,
  intercorrencia:        '',
  conformePrescricao:    false,
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_banho', form, () => !!(form.horario || form.nome))

// ── Opções ──
const higieneOpcoes = ['Capilar', 'Facial', 'Corporal', 'Íntima', 'Oral']

// ── Higiene extras ──
const higieneExtras    = ref([])
const adicionandoHigiene = ref(false)
const novaHigieneTxt   = ref('')
const refNovaHigiene   = ref(null)

function adicionarHigieneExtra() {
  const txt = novaHigieneTxt.value.trim()
  if (!txt || higieneExtras.value.includes(txt)) return
  higieneExtras.value.push(txt)
  form.higiene.push(txt)
  novaHigieneTxt.value = ''
  adicionandoHigiene.value = false
}

function removerHigieneExtra(h) {
  higieneExtras.value = higieneExtras.value.filter(x => x !== h)
  const idx = form.higiene.indexOf(h)
  if (idx >= 0) form.higiene.splice(idx, 1)
}

watch(adicionandoHigiene, async (v) => {
  if (v) { await nextTick(); refNovaHigiene.value?.focus() }
})

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  iniciarRascunho()
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

function toggleHigiene(h) {
  const idx = form.higiene.indexOf(h)
  if (idx >= 0) form.higiene.splice(idx, 1)
  else form.higiene.push(h)
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
    form.horario = ''; form.genero = 'M'
  } else {
    form.tipo = ''
    form.cadeiraBanho = false; form.comAuxilio = false
    form.acompGenero = 'M'; form.acompNome = ''
    form.protecaoCateter = false; form.trocaRoupa = false
    form.higiene = []; form.trocaFralda = false
    higieneExtras.value = []; adicionandoHigiene.value = false; novaHigieneTxt.value = ''
    form.eliminacao = ''; form.qtdDiurese = ''; form.qtdEvacuacao = ''; form.localElim = ''
    form.semIntercorrencias = true; form.intercorrencia = ''
    form.conformePrescricao = false
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

// ── Gerar texto ──
function gerar() {
  erro.value = ''

  const hora = formatHora(form.horario)
  const enc  = form.genero === 'F' ? 'encaminhada' : 'encaminhado'
  let texto  = ''

  if (form.tipo === 'aspersao') {
    // Início da frase
    const inicio = form.protecaoCateter
      ? `${hora} – realizado proteção de cateter, paciente ${enc} ao banho de aspersão`
      : `${hora} – paciente ${enc} ao banho de aspersão`

    // Detalhes em sequência
    const detalhes = []
    if (form.cadeiraBanho) detalhes.push('em cadeira de banho')
    if (form.comAuxilio)   detalhes.push('com auxílio')
    if (form.comAuxilio && form.acompNome.trim()) {
      const tec = form.acompGenero === 'F' ? 'Téc.ª de enfermagem' : 'Téc. de enfermagem'
      detalhes.push(`junto com ${tec} ${form.acompNome.trim()}`)
    }
    if (form.conformePrescricao) detalhes.push('conforme prescrição de enfermagem')
    if (form.semIntercorrencias) {
      detalhes.push('sem intercorrências')
    } else {
      detalhes.push(form.intercorrencia.trim())
    }

    texto = inicio
    if (detalhes.length > 0) texto += ', ' + detalhes.join(', ')
    texto += '.'

    if (form.trocaRoupa) texto += ' Realizado troca de roupa de cama.'

  } else if (form.tipo === 'fralda') {
    // Troca de fralda
    let elimPart = ''
    if (form.eliminacao === 'diurese') {
      elimPart = `diurese ${form.qtdDiurese}`
    } else if (form.eliminacao === 'evacuacao') {
      elimPart = `evacuação ${form.qtdEvacuacao}`
    } else {
      elimPart = `evacuação ${form.qtdEvacuacao} e diurese ${form.qtdDiurese}`
    }

    const local = form.localElim === 'leito' ? 'em leito' : 'em fralda'
    texto = `${hora} – Paciente apresentou ${elimPart} ${local}, realizado higiene íntima`

    if (form.localElim === 'leito') {
      texto += ', troca de roupa de cama e troca de fralda'
    } else {
      texto += ' e troca de fralda'
    }

    if (form.semIntercorrencias) {
      texto += ', sem intercorrências.'
    } else {
      texto += `. ${form.intercorrencia.trim()}.`
    }

  } else {
    // Banho de leito — higiene em ordem canônica
    const higieneOrdem = ['Capilar', 'Facial', 'Corporal', 'Íntima', 'Oral']
    const higieneFeita = higieneOrdem
      .filter(h => form.higiene.includes(h))
      .map(h => h.toLowerCase())
    higieneExtras.value
      .filter(h => form.higiene.includes(h))
      .forEach(h => higieneFeita.push(h.toLowerCase()))

    texto = `${hora} – realizado banho de leito`
    if (higieneFeita.length > 0) {
      const last  = higieneFeita.length - 1
      const lista = higieneFeita.length === 1
        ? higieneFeita[0]
        : higieneFeita.slice(0, last).join(', ') + ' e ' + higieneFeita[last]
      texto += `: higiene ${lista}`
    }

    if (form.conformePrescricao) texto += ', conforme prescrição de enfermagem'
    if (form.semIntercorrencias) {
      texto += ', sem intercorrências.'
    } else {
      texto += `. ${form.intercorrencia.trim()}.`
    }

    const trocas = []
    if (form.trocaRoupa)  trocas.push('troca de roupa de cama')
    if (form.trocaFralda) trocas.push('troca de fralda')
    if (trocas.length > 0) texto += ` Realizado ${trocas.join(' e ')}.`
  }

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

async function compartilhar() {
  if (navigator.share) {
    try {
      await navigator.share({ text: textoGerado.value })
      return
    } catch {}
  }
  await copiar()
}


// ── Salvar ──
async function salvar() {
  salvando.value = true
  try {
    const r = await anotacoesStore.salvar({
      tipo:  'banho',
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
    horario: '', genero: 'M', nome: '', leito: '',
    tipo: '',
    cadeiraBanho: false, comAuxilio: false,
    acompGenero: 'M', acompNome: '',
    protecaoCateter: false, trocaRoupa: false,
    higiene: [], trocaFralda: false,
    eliminacao: '', qtdDiurese: '', qtdEvacuacao: '', localElim: '',
    semIntercorrencias: true, intercorrencia: '',
    conformePrescricao: false,
  })
  higieneExtras.value = []; adicionandoHigiene.value = false; novaHigieneTxt.value = ''
  textoGerado.value = ''; gerado.value = false; passo.value = 1
  erro.value = ''
  descartarRascunho()
}
</script>

<style scoped>
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

/* ── Chips ── */
.chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }
.chip-sm { padding: 6px 12px; font-size: 0.85rem; }

.chip-has-action { padding-right: 6px; }
.chip-del-btn {
  background: none; border: none; cursor: pointer;
  color: inherit; font-size: 1rem; line-height: 1;
  padding: 0 2px; opacity: 0.7; font-family: inherit;
}
.chip-del-btn:hover { opacity: 1; }

.add-row { display: flex; gap: 8px; align-items: center; }
.add-input {
  flex: 1; padding: 8px 12px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 0.9rem; outline: none;
}
.add-input:focus { border-color: var(--blue); }

/* ── Toggle row ── */
.toggle-row {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 0.9rem; color: var(--text-dim);
  user-select: none;
  /* sobrescreve .campo label global */
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
  margin-bottom: 0;
}
.toggle-row input[type="checkbox"] { cursor: pointer; width: 16px; height: 16px; flex-shrink: 0; }

/* ── Nav ── */
.bloco-nav { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bloco-nav .btn-primary { flex: 1; }

/* ── Rascunho banner ── */
.rascunho-banner {
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius); padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
}
.rascunho-info { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-dim); }
.rascunho-acoes { display: flex; gap: 8px; }
.btn-sm { padding: 7px 14px !important; font-size: 0.82rem !important; }

/* ── Resultado ── */
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

/* Remove a borda colorida no estado marcado (global usa var(--blue)) */
.checkbox-label:has(input:checked),
.checkbox-label.checked {
  border-color: var(--border);
}

.banho-screen {
  background:
    radial-gradient(circle at top right, var(--blue-faint), transparent 28%),
    var(--bg);
  min-height: 100vh;
}

.banho-header {
  border-bottom: 1px solid rgba(86, 154, 178, 0.24);
  background: rgba(7, 18, 34, 0.82);
  backdrop-filter: blur(16px);
}

.banho-page {
  padding-top: 20px;
  padding-bottom: 40px;
}

.banho-progress {
  background: rgba(45, 84, 100, 0.55);
}

.banho-progress .progress-fill {
  background: linear-gradient(90deg, #45d4d6, #5c98ff);
  box-shadow: 0 0 12px rgba(69, 212, 214, 0.22);
}

.paciente-atalho {
  padding: 14px 16px;
  margin-bottom: 14px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: 0 14px 28px rgba(3, 10, 22, 0.16);
}

.paciente-atalho label {
  display: block;
  color: #a6c4d8;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.paciente-atalho .chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.module-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  margin-bottom: 16px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: 0 18px 36px rgba(2, 7, 16, 0.24);
}

.module-hero-icon {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(130, 226, 229, 0.4);
  background: radial-gradient(circle at top, rgba(95, 232, 232, 0.34), rgba(42, 128, 178, 0.42));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
}

.module-hero-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.module-hero-copy h1 {
  margin: 0;
  color: #f5f8ff;
  font-size: 1.75rem;
  line-height: 1.02;
  font-weight: 850;
}

.module-hero-copy p {
  margin: 8px 0 0;
  color: #a6c4d8;
  font-size: 0.96rem;
  line-height: 1.35;
}

.banho-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: 0 16px 32px rgba(3, 10, 22, 0.22);
}

.banho-card + .banho-card {
  margin-top: 14px;
}

.bloco-titulo {
  color: #f3f7ff;
  border-bottom-color: rgba(77, 130, 160, 0.5);
  font-size: 1.22rem;
}

.chip {
  min-height: 42px;
  border-radius: 14px;
  border-color: var(--border);
  background: var(--bg-input);
  color: #c2d8ea;
}

.chip-on {
  border-color: rgba(92, 215, 226, 0.86);
  background: linear-gradient(180deg, #23aeca, #1d72c8);
  color: #fff;
  box-shadow: 0 7px 15px rgba(35, 150, 200, 0.15);
}

.checkbox-label {
  border-color: var(--border);
  background: var(--bg-input);
}

.checkbox-label.checked,
.checkbox-label:has(input:checked) {
  border-color: rgba(92, 215, 226, 0.78);
  background: rgba(38, 142, 179, 0.18);
}

.add-input,
input,
textarea {
  border-color: var(--border);
  background: var(--bg-input);
}

.btn-generate {
  min-height: 58px;
  border-radius: 18px;
  box-shadow: 0 10px 20px rgba(25, 126, 201, 0.16);
}

.btn-limpar {
  width: auto;
  padding: 12px 18px;
}

@media (max-width: 380px) {
  .module-hero {
    padding: 16px;
    gap: 12px;
  }

  .module-hero-icon {
    width: 58px;
    height: 58px;
    border-radius: 18px;
  }

  .module-hero-icon img {
    width: 40px;
    height: 40px;
  }

  .module-hero-copy h1 {
    font-size: 1.45rem;
  }
}
</style>
