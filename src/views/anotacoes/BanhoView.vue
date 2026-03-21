<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="voltarOuSair">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 2c0 0-1 3-1 6s1 4 1 4-1 1-1 4 1 6 1 6"/>
          <path d="M9 7c-2 1-3 2-3 3s2 2 6 2 6-1 6-2-1-2-3-3"/>
          <path d="M9 17c-2-1-3-2-3-3s2-2 6-2 6 1 6 2-1 2-3 3"/>
        </svg>
        <span>Plantão</span>
      </button>
      <div style="width:34px"/>
    </header>

    <!-- Barra de progresso -->
    <div v-if="!gerado" class="progress-wrap">
      <div class="progress-fill" :style="{ width: (passo / 2 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 2</span>
    </div>

    <main class="container" style="padding-top:20px;padding-bottom:40px">

      <!-- Banner de rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info"><span>📝</span><span>Você tem um rascunho salvo</span></div>
        <div class="rascunho-acoes">
          <button class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <!-- ═══ BLOCO 1 — Identificação ═══ -->
      <div v-if="!gerado && passo === 1">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário</label>
          <input type="time" v-model="form.horario">
        </div>

        <div class="campo">
          <label>Gênero do paciente</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.genero === 'M' }" @click="form.genero = 'M'">M</button>
            <button class="chip" :class="{ 'chip-on': form.genero === 'F' }" @click="form.genero = 'F'">F</button>
          </div>
        </div>

        <div v-if="pacientesStore.pacientes.length > 0" class="campo">
          <label>Paciente registrado</label>
          <div class="chips-wrap">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="chip"
              :class="{ 'chip-on': form.nome === p.nome && form.leito === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >{{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}</button>
          </div>
        </div>

        <div class="campo">
          <label>Nome do paciente <span class="obrigatorio">*</span></label>
          <input type="text" v-model="form.nome" placeholder="Ex: João da Silva">
        </div>

        <div class="campo">
          <label>Leito <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.leito" placeholder="Ex: 4B">
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 20px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Detalhes da higienização ═══ -->
      <div v-if="!gerado && passo === 2">
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
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.comAuxilio">
                <span>Com auxílio</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.protecaoCateter">
                <span>Proteção de cateter</span>
              </label>
              <label class="checkbox-label">
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
            <div class="radio-group vertical">
              <label v-for="h in higieneOpcoes" :key="h" class="checkbox-label">
                <input type="checkbox" :value="h" v-model="form.higiene">
                <span>{{ h }}</span>
              </label>
            </div>
          </div>

          <div class="campo">
            <label>Opções</label>
            <div class="radio-group vertical">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.trocaRoupa">
                <span>Troca de roupa de cama</span>
              </label>
              <label class="checkbox-label">
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

        <!-- Intercorrências -->
        <div v-if="form.tipo" class="campo">
          <label>Intercorrências</label>
          <div class="radio-group vertical">
            <label class="checkbox-label">
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
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="gerar">Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <div v-if="gerado">
        <textarea v-model="textoGerado" class="resultado-box" rows="6"></textarea>

        <button class="btn-copy" @click="copiar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          {{ copiado ? 'Copiado!' : 'Copiar texto' }}
        </button>

        <div class="nav-row">
          <button class="btn btn-secondary" style="flex:1" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
          </button>
          <button class="btn btn-secondary" style="flex:1" @click="novaAnotacao">Nova anotação</button>
        </div>

        <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false; passo = 2">← Editar</button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'
import { useCopia } from '../../composables/useCopia.js'

const router         = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const { showToast }  = useToast()
const { copiado, copiar: _copiar } = useCopia()

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
  semIntercorrencias: true,
  intercorrencia:     '',
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_banho', form, () => !!(form.horario || form.nome))

// ── Opções ──
const higieneOpcoes = ['Capilar', 'Facial', 'Corporal', 'Íntima', 'Oral']

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  iniciarRascunho()
})

// ── Helpers ──
function selecionarPaciente(p) {
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
    form.horario = ''; form.genero = 'M'; form.nome = ''; form.leito = ''
  } else {
    form.tipo = ''
    form.cadeiraBanho = false; form.comAuxilio = false
    form.acompGenero = 'M'; form.acompNome = ''
    form.protecaoCateter = false; form.trocaRoupa = false
    form.higiene = []; form.trocaFralda = false
    form.eliminacao = ''; form.qtdDiurese = ''; form.qtdEvacuacao = ''; form.localElim = ''
    form.semIntercorrencias = true; form.intercorrencia = ''
  }
}

function avancar() {
  erro.value = ''
  if (!form.nome.trim()) {
    erro.value = 'Informe o nome do paciente.'
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

    texto = `${hora} – realizado banho de leito`
    if (higieneFeita.length > 0) {
      const last  = higieneFeita.length - 1
      const lista = higieneFeita.length === 1
        ? higieneFeita[0]
        : higieneFeita.slice(0, last).join(', ') + ' e ' + higieneFeita[last]
      texto += `: higiene ${lista}`
    }

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
  })
  textoGerado.value = ''; gerado.value = false; passo.value = 1
  erro.value = ''; copiado.value = false
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
.checkbox-label:has(input:checked) {
  border-color: var(--border);
}
</style>
