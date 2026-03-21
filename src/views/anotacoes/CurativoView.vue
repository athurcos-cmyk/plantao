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

    <div v-if="!gerado" class="progress-wrap">
      <div class="progress-fill" :style="{ width: (passo / 2 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 2</span>
    </div>

    <main class="container" style="padding-top:20px;padding-bottom:40px">

      <!-- Banner rascunho -->
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

      <!-- ═══ BLOCO 2 — Detalhes ═══ -->
      <div v-if="!gerado && passo === 2">
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
          <label class="checkbox-label">
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
          <div class="chips-wrap">
            <!-- Chips predefinidos -->
            <button v-for="l in locaisChips" :key="l" class="chip chip-sm"
              :class="{ 'chip-on': form.local.includes(l) }"
              @click="toggleLocal(l)">{{ l }}</button>
            <!-- Locais customizados salvos no Firebase -->
            <span v-for="l in locaisCustom" :key="l._key" class="chip chip-sm"
              :class="{ 'chip-on': form.local.includes(l.texto) }"
              @click="toggleLocal(l.texto)">
              {{ l.texto }}
              <button class="chip-del-btn" @click.stop="removerLocalCustom(l._key)">×</button>
            </span>
            <!-- Botão salvar no Firebase -->
            <button v-if="!adicionandoLocal" class="chip chip-sm chip-add" @click="abrirAddLocal">+ Adicionar local</button>
          </div>
          <!-- Input inline para salvar no Firebase -->
          <div v-if="adicionandoLocal" class="add-row" style="margin-top:8px">
            <input class="add-input" type="text" v-model="novoLocalTxt"
              placeholder="Ex: região cervical esquerda, joelho D..."
              @keyup.enter="salvarLocalCustom" @keyup.esc="fecharAddLocal"
              ref="refNovoLocal">
            <button class="chip chip-on" @click="salvarLocalCustom" :disabled="!novoLocalTxt.trim()">Salvar</button>
            <button class="chip" @click="fecharAddLocal">✕</button>
          </div>
          <!-- Campo livre sem salvar no Firebase -->
          <input type="text" v-model="localLivre" placeholder="Ou escreva o local aqui (sem salvar)..." style="margin-top:8px">
        </div>

        <!-- Materiais padrão + customizados -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Em uso de <span class="opc">(opcional)</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button
              v-for="m in materiaisOpcoes"
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
            <button class="chip chip-add" @click="abrirAddMaterial">+ Adicionar material</button>
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
              <button class="chip chip-on" @click="salvarMaterialCustom" :disabled="!novoMaterialTxt.trim()">Salvar no banco de dados</button>
              <button class="chip chip-temp" @click="adicionarMaterialTemporario" :disabled="!novoMaterialTxt.trim()">Só nesta anotação</button>
              <button class="chip" @click="fecharAddMaterial">✕</button>
            </div>
          </div>
          <small class="material-tip">Enter adiciona só nesta anotação.</small>
        </div>

        <!-- Condição (não para placa) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Condição</label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.condicao">
            <span>Ocluído, limpo e seco externamente</span>
          </label>
        </div>

        <!-- Aspecto da ferida (não para placa) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Aspecto da ferida <span class="opc">(opcional)</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button v-for="a in aspectoChips" :key="a" class="chip chip-sm"
              :class="{ 'chip-on': form.aspecto === a }"
              @click="setAspecto(a)">{{ a }}</button>
          </div>
          <input type="text" v-model="form.aspecto" placeholder="Ex: tecido de granulação, necrose...">
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
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'
import { useCopia } from '../../composables/useCopia.js'
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
const localLivre    = ref('')
const materiaisTemporarios = ref([])

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
})

// ── Locais customizados (Firebase) ──
const locaisCustom     = ref([])
const adicionandoLocal = ref(false)
const novoLocalTxt     = ref('')
const refNovoLocal     = ref(null)
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
  form.local.push(texto)
  fecharAddLocal()
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

const materiaisOpcoes = [
  'SF 0,9%', 'Gaze', 'Rayon', 'AGE', 'Atadura',
  'Hidrogel', 'Adaptic', 'Clorexidina aquosa',
  'Papaína gel 2%', 'Placa de alginato de cálcio',
  'Placa de alginato de cálcio com prata',
]

const aspectoChips = [
  'exsudato sanguinolento', 'exsudato purolento',
  'exsudato seroso', 'exsudato serossanguinolento',
]

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
  form.nome  = p.nome
  form.leito = p.leito || ''
}

function toggleLocal(value) {
  const idx = form.local.indexOf(value)
  if (idx >= 0) form.local.splice(idx, 1)
  else form.local.push(value)
}


function setAspecto(value) {
  form.aspecto = form.aspecto === value ? '' : value
}

function localTexto() {
  const todos = [...form.local]
  const livre = localLivre.value.trim()
  if (livre) todos.push(livre)
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
    form.local = []; localLivre.value = ''
    form.materiais = []; materiaisTemporarios.value = []
    form.condicao = true; form.aspecto = ''
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

  const localPart = form.ehDreno
    ? ` de dreno ${form.dreno.trim()}`
    : ` em ${localTexto()}`

  if (form.tipo === 'placa') {
    textoGerado.value = `${hora} – Realizado troca de placa de hidrocoloide${localPart}.`
    gerado.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const mats = materiaisTexto()

  const verbo = form.tipo === 'troca' ? 'troca de curativo' : 'curativo'
  let texto = `${hora} – Realizado ${verbo}${localPart}`

  if (mats.length > 0) {
    texto += `, em uso de ${mats.join(' + ')}`
  }
  texto += '.'

  if (form.condicao) {
    texto += ' Ocluído, limpo e seco externamente.'
  }

  if (form.aspecto.trim()) {
    texto += ` Ferida apresentando ${form.aspecto.trim()}.`
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
    condicao: true, aspecto: '',
  })
  localLivre.value = ''
  materiaisTemporarios.value = []
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

.checkbox-label:has(input:checked) {
  border-color: var(--border);
}
</style>
