<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.push({ name: 'dashboard' })">
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

    <!-- ═══ FORMULÁRIO ═══ -->
    <main v-if="!gerado" class="container" style="padding-top:20px;padding-bottom:56px">

      <div class="page-header">
        <span class="page-icon">📝</span>
        <div>
          <h2 class="page-titulo">Notas Livres</h2>
          <p class="page-sub">Seus modelos de anotação, do jeito que você usa</p>
        </div>
      </div>

      <!-- ── Paciente ── -->
      <div class="card-secao">
        <div v-if="pacientesStore.pacientes.length > 0" class="campo">
          <label>Paciente registrado</label>
          <div class="chips-scroll">
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

        <div class="campo" style="margin-bottom:0">
          <label>Leito <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.leito" placeholder="Ex: 4B">
        </div>
      </div>

      <!-- ── Adicionar Nota ── -->
      <div class="secao-header" style="margin-top:20px">
        <span class="secao-label-lg">Notas</span>
        <span v-if="notas.length > 0" class="badge-count azul">{{ notas.length }}</span>
      </div>

      <div class="nota-composer">
        <div class="nota-composer-row">
          <input type="time" v-model="notaHora" class="nc-hora">
          <div class="nc-divider"></div>
          <textarea
            ref="notaTextoEl"
            v-model="notaTexto"
            class="nc-texto"
            rows="1"
            placeholder="Escreva a nota..."
            @input="ajustarAlturaNota"
            @keydown.enter.exact.prevent="adicionarNota"
          ></textarea>
        </div>
        <div class="nc-footer">
          <button
            v-if="notaTexto && notaTexto.length >= 5"
            class="btn-clara"
            :disabled="claraCarregando"
            @click="completarComClara(notaTexto)"
          >{{ claraCarregando ? '...' : '✨ Clara' }}</button>
          <span class="nc-hint">Enter adiciona · Shift+Enter quebra linha</span>
          <button
            class="nc-btn-add"
            @click="adicionarNota"
            :disabled="!notaTexto.trim()"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar
          </button>
        </div>
      </div>

      <!-- Timeline -->
      <div v-if="notas.length > 0" class="timeline">
        <div v-for="(n, i) in notas" :key="i" class="timeline-item">
          <div class="timeline-line" v-if="i < notas.length - 1"></div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-hora">{{ n.hora }}</span>
            <span class="timeline-sep">–</span>
            <span class="timeline-texto">{{ n.texto }}</span>
          </div>
          <button class="btn-del-nota" @click="removerNota(i)">×</button>
        </div>
      </div>

      <!-- ── Meus Modelos (parte inferior) ── -->
      <div class="secao-header" style="margin-top:16px">
        <span class="secao-label-lg">Modelos</span>
        <span v-if="modelos.length > 0" class="badge-count">{{ modelos.length }}</span>
        <div class="modelos-acoes">
          <button class="btn-gerenciar" @click="abrirModalModelos">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Gerenciar
          </button>
          <button class="btn-novo-modelo-topo" @click="abrirModalNovoModelo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo
          </button>
        </div>
      </div>
      <p class="modelos-debug">
        Carregados: {{ modelos.length }} | Banco: {{ modelosBancoCount }}
      </p>

      <div v-if="modelos.length > 0" class="modelos-chips-row">
        <button
          v-for="m in modelos"
          :key="m._key"
          class="chip-modelo"
          :class="{ 'chip-modelo-on': modeloSelecionadoKey === m._key }"
          @click="selecionarModelo(m)"
        >{{ m.titulo }}</button>
      </div>
      <div v-else class="modelos-vazio-row">
        <span>Nenhum modelo —</span>
        <button class="btn-link" @click="abrirModalNovoModelo">criar agora</button>
      </div>

      <p v-if="erro" class="erro-msg">{{ erro }}</p>
      <button class="btn btn-primary" style="margin-top:20px" @click="gerar">Gerar anotação</button>

    </main>

    <!-- ═══ RESULTADO ═══ -->
    <main v-if="gerado" class="container" style="padding-top:20px;padding-bottom:40px">
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

      <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false">← Editar</button>
    </main>

    <!-- ═══ MODAL: Gerenciar Modelos ═══ -->
    <div v-if="modalModelos" class="modal-overlay" @click.self="fecharModalModelos">
      <div class="modal-modelos">

        <div class="modal-modelos-header">
          <h3>Meus Modelos</h3>
          <button class="btn-fechar-modal" @click="fecharModalModelos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-modelos-body">

          <!-- Lista completa -->
          <div v-if="modelos.length > 0" class="modal-lista">
            <div v-for="m in modelos" :key="m._key" class="modal-modelo-item">
              <span class="modal-modelo-txt">{{ m.titulo }}</span>
              <button class="btn-del-modal" @click="deletarModelo(m._key)" title="Remover">×</button>
            </div>
          </div>
          <p v-else-if="!carregandoModelos" class="modal-vazio">
            Nenhum modelo ainda. Crie o primeiro em "Novo".
          </p>
          <p v-else class="modal-vazio">Carregando...</p>

        </div>

        <div class="modal-modelos-footer">
          <button class="btn btn-secondary" style="width:100%" @click="fecharModalModelos">Fechar</button>
        </div>

      </div>
    </div>

    <!-- ═══ MODAL: Novo Modelo ═══ -->
    <div v-if="modalNovoModelo" class="modal-overlay" @click.self="fecharModalNovoModelo">
      <div class="modal-modelos">
        <div class="modal-modelos-header">
          <h3>Novo Modelo</h3>
          <button class="btn-fechar-modal" @click="fecharModalNovoModelo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-modelos-body">
          <div class="campo">
            <label>Título do modelo <span class="obrigatorio">*</span></label>
            <input
              ref="novoModeloTituloInput"
              v-model="novoModeloTitulo"
              type="text"
              maxlength="60"
              placeholder="Ex: Banho no leito"
            >
          </div>
          <div class="campo" style="margin-bottom:0">
            <label>Texto do modelo <span class="obrigatorio">*</span></label>
            <textarea
              v-model="novoModeloTexto"
              rows="4"
              maxlength="400"
              placeholder="Ex: Paciente em seu leito, banho no leito realizado sem intercorrências."
            ></textarea>
          </div>
        </div>

        <div class="modal-modelos-footer">
          <div style="display:flex; gap:8px">
            <button class="btn btn-secondary" style="flex:1" @click="fecharModalNovoModelo">Cancelar</button>
            <button class="btn btn-primary" style="flex:1" @click="salvarModelo" :disabled="!podeSalvarModelo || salvandoModelo">
              {{ salvandoModelo ? 'Salvando...' : 'Salvar modelo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../firebase.js'
import { ref as dbRef, push, remove, onValue, get } from 'firebase/database'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useOnlineStatus } from '../../composables/useOnlineStatus.js'
import { useCopia } from '../../composables/useCopia.js'
import { useClara } from '../../composables/useClara.js'

const router          = useRouter()
const anotacoesStore  = useAnotacoesStore()
const pacientesStore  = usePacientesStore()
const authStore       = useAuthStore()
const { showToast }   = useToast()
const { isOnline }    = useOnlineStatus()
const { copiado, copiar: _copiar } = useCopia()
const { claraCarregando, completarComClara } = useClara()

// ── Estado ──
const gerado            = ref(false)
const textoGerado       = ref('')
const erro              = ref('')
const salvando          = ref(false)
const carregandoModelos = ref(true)
const salvandoModelo    = ref(false)
const modalModelos      = ref(false)
const modalNovoModelo   = ref(false)
const sincronizandoModelos = ref(false)
const modelosBancoCount = ref(0)

// ── Modelos ──
const modelos             = ref([])
const modeloSelecionadoKey = ref('')
const novoModeloTitulo    = ref('')
const novoModeloTexto     = ref('')
const novoModeloTituloInput = ref(null)
let modelosOff = null
let syncModelosTimer = null

// ── Notas ──
const notas     = ref([])
const notaHora  = ref('')
const notaTexto = ref('')
const notaTextoEl = ref(null)
const podeSalvarModelo = computed(() =>
  novoModeloTitulo.value.trim().length > 0 && novoModeloTexto.value.trim().length > 0
)

// ── Form ──
const form = reactive({ nome: '', leito: '' })

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  notaHora.value = horaAtual()
  iniciarModelos()
  ajustarAlturaNota()
  if (navigator.onLine) sincronizarModelosPendentes()
  syncModelosTimer = setInterval(() => {
    if (navigator.onLine) sincronizarModelosPendentes()
  }, 15000)
})

onUnmounted(() => {
  if (modelosOff) {
    modelosOff()   // unsubscribe corretamente (retorno do onValue)
    modelosOff = null
  }
  if (syncModelosTimer) {
    clearInterval(syncModelosTimer)
    syncModelosTimer = null
  }
})

watch(
  () => authStore.syncCode,
  (novo, antigo) => {
    if (novo !== antigo) iniciarModelos()
  }
)
watch(isOnline, (online) => {
  if (online) sincronizarModelosPendentes()
})

// ── Helpers ──
function horaAtual() {
  const d = new Date()
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

function _code() {
  return (authStore.syncCode || '').trim()
}

function _tituloPadrao(texto = '') {
  const base = String(texto || '').replace(/\s+/g, ' ').trim()
  if (!base) return 'Modelo'
  return base.length > 34 ? `${base.slice(0, 34)}...` : base
}

function _textoModeloSeguro(m) {
  const base = [
    m?.texto,
    m?.modelo,
    m?.body,
    m?.template,
    m?.conteudo,
    m?.titulo,
    m?.nome,
  ]
    .map(v => String(v || '').trim())
    .find(Boolean)

  return base || 'Modelo sem texto'
}

function _normalizarModelos(lista) {
  const arr = (lista || [])
    .map((m) => (m || {}))
    .map((m, idx) => {
      const texto = _textoModeloSeguro(m)
      const titulo = String(m.titulo || m.nome || '').trim() || _tituloPadrao(texto)
      const criadoEm = Number(m.criadoEm || m.createdAt || 0)
      const keyBase = String(m._key || m.key || `${criadoEm || Date.now()}-${idx}`)
      return {
        ...m,
        _key: keyBase,
        texto,
        titulo,
        criadoEm,
      }
    })

  arr.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))
  return arr
}

function _salvarCacheModelos(code, lista) {
  try { localStorage.setItem(`modelos_${code}`, JSON.stringify(lista)) } catch {}
}

function _carregarCacheModelos(code) {
  try {
    const cached = JSON.parse(localStorage.getItem(`modelos_${code}`) || '[]')
    return Array.isArray(cached) ? _normalizarModelos(cached) : []
  } catch {
    return []
  }
}

function _queueKeyModelos(code) {
  return `modelos_queue_${code}`
}

function _lerQueueModelos(code) {
  try {
    return JSON.parse(localStorage.getItem(_queueKeyModelos(code)) || '[]')
  } catch {
    return []
  }
}

function _salvarQueueModelos(code, fila) {
  try { localStorage.setItem(_queueKeyModelos(code), JSON.stringify(fila || [])) } catch {}
}

function _enfileirarModelo(code, op) {
  const fila = _lerQueueModelos(code)

  // Se apagar um item que ainda está só no add local, cancela ambas operações.
  if (op.op === 'delete') {
    const tinhaAdd = fila.some(item => item.op === 'add' && item.key === op.key)
    const semAdd = fila.filter(item => !(item.op === 'add' && item.key === op.key))
    if (tinhaAdd) {
      _salvarQueueModelos(code, semAdd)
      return
    }
    semAdd.push(op)
    _salvarQueueModelos(code, semAdd)
    return
  }

  fila.push(op)
  _salvarQueueModelos(code, fila)
}

function _nextLocalKey() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

async function sincronizarModelosPendentes() {
  const code = _code()
  if (!code || !navigator.onLine || sincronizandoModelos.value) return 0

  const fila = _lerQueueModelos(code)
  if (!fila.length) return 0

  sincronizandoModelos.value = true

  const keyMap = {}
  const restantes = []
  let feitos = 0

  for (const item of fila) {
    try {
      if (item.op === 'add') {
        const r = await push(dbRef(db, `livres/${code}/modelos`), item.data)
        keyMap[item.key] = r.key
        modelos.value = modelos.value.map(m =>
          m._key === item.key ? { ...m, _key: r.key, _pending: false } : m
        )
        feitos++
      } else if (item.op === 'delete') {
        const real = keyMap[item.key] || item.key
        if (String(real).startsWith('local-')) {
          feitos++
          continue
        }
        await remove(dbRef(db, `livres/${code}/modelos/${real}`))
        feitos++
      } else {
        restantes.push(item)
      }
    } catch (_) {
      restantes.push(item)
    }
  }

  _salvarQueueModelos(code, restantes)
  _salvarCacheModelos(code, modelos.value)
  sincronizandoModelos.value = false
  return feitos
}

async function iniciarModelos() {
  const code = _code()
  if (modelosOff) {
    modelosOff()
    modelosOff = null
  }
  if (!code) {
    modelos.value = []
    carregandoModelos.value = false
    return
  }

  carregandoModelos.value = true

  // Cache imediato
  const cached = _carregarCacheModelos(code)
  if (cached.length) {
    modelos.value = cached
    carregandoModelos.value = false
  }

  // Snapshot pontual para forçar consistência mesmo se listener atrasar.
  const path = dbRef(db, `livres/${code}/modelos`)
  try {
    const snap = await get(path)
    const lista = []
    snap.forEach(child => {lista.push({ ...child.val(), _key: child.key })})
    modelosBancoCount.value = lista.length
    const normalizada = _normalizarModelos(lista)
    modelos.value = normalizada
    carregandoModelos.value = false
    _salvarCacheModelos(code, normalizada)
  } catch (_) {
    // segue com listener em tempo real
  }

  // Listener Firebase (retorna função de unsubscribe no SDK v9)
  modelosOff = onValue(path, (snap) => {
    const lista = []
    snap.forEach(child => {lista.push({ ...child.val(), _key: child.key })})
    modelosBancoCount.value = lista.length
    const normalizada = _normalizarModelos(lista)
    const pendLocais = modelos.value.filter(m => String(m._key || '').startsWith('local-'))
    const manterPend = pendLocais.filter(p => !normalizada.some(r => r._key === p._key))
    modelos.value = _normalizarModelos([...manterPend, ...normalizada])
    carregandoModelos.value = false
    _salvarCacheModelos(code, modelos.value)
  }, () => { carregandoModelos.value = false })
}

function selecionarPaciente(p) {
  form.nome  = p.nome
  form.leito = p.leito || ''
}

// ── Modal de modelos ──
async function abrirModalModelos() {
  modalModelos.value = true
  await iniciarModelos()
}

function fecharModalModelos() {
  modalModelos.value = false
}

function limparFormModelo() {
  novoModeloTitulo.value = ''
  novoModeloTexto.value = ''
}

async function abrirModalNovoModelo() {
  modalNovoModelo.value = true
  limparFormModelo()
  await nextTick()
  novoModeloTituloInput.value?.focus()
}

function fecharModalNovoModelo() {
  modalNovoModelo.value = false
  limparFormModelo()
}

async function salvarModelo() {
  const code = _code()
  const titulo = novoModeloTitulo.value.trim()
  const texto = novoModeloTexto.value.trim()
  if (!titulo || !texto) return
  if (!code) { showToast('Sessão inválida'); return }
  salvandoModelo.value = true
  const criadoEm = Date.now()
  const data = { titulo, texto, criadoEm }
  try {
    if (!navigator.onLine) {
      const localKey = _nextLocalKey()
      modelos.value = _normalizarModelos([...modelos.value, { ...data, _key: localKey, _pending: true }])
      _salvarCacheModelos(code, modelos.value)
      _enfileirarModelo(code, { op: 'add', key: localKey, data })
      fecharModalNovoModelo()
      showToast('Modelo salvo offline - sincroniza automatico')
      return
    }

    const novoRef = await push(dbRef(db, `livres/${code}/modelos`), data)
    if (!modelos.value.find(m => m._key === novoRef.key)) {
      modelos.value = _normalizarModelos([...modelos.value, { ...data, _key: novoRef.key }])
      _salvarCacheModelos(code, modelos.value)
    }
    await iniciarModelos()
    fecharModalNovoModelo()
    showToast('Modelo salvo!')
  } catch { showToast('Erro ao salvar modelo') }
  finally { salvandoModelo.value = false }
}

async function deletarModelo(key) {
  const code = _code()
  if (!code) { showToast('Sessão inválida'); return }
  try {
    // Remove local imediatamente para feedback instantâneo
    const modelo = modelos.value.find(m => m._key === key)
    modelos.value = modelos.value.filter(m => m._key !== key)
    if (modeloSelecionadoKey.value === key) {
      modeloSelecionadoKey.value = ''
      if (modelo && notaTexto.value === modelo.texto) notaTexto.value = ''
      ajustarAlturaNota()
    }
    _salvarCacheModelos(code, modelos.value)

    if (!navigator.onLine) {
      _enfileirarModelo(code, { op: 'delete', key })
      showToast('Removido offline - sincroniza automatico')
      return
    }

    await remove(dbRef(db, `livres/${code}/modelos/${key}`))
    showToast('Modelo removido')
  } catch {
    _enfileirarModelo(code, { op: 'delete', key })
    showToast('Sem conexão estável - remoção em fila')
  }
}

// ── Notas ──
function adicionarNota() {
  const texto = notaTexto.value.trim()
  if (!texto) return
  const hora = (notaHora.value || horaAtual()).replace(':', 'h')
  notas.value.push({ hora, texto })
  modeloSelecionadoKey.value = ''
  notaTexto.value = ''
  ajustarAlturaNota()
}

function selecionarModelo(modelo) {
  if (!modelo?._key) return
  if (modeloSelecionadoKey.value === modelo._key) {
    modeloSelecionadoKey.value = ''
    notaTexto.value = ''
  } else {
    modeloSelecionadoKey.value = modelo._key
    notaTexto.value = modelo.texto || ''
  }
  ajustarAlturaNota()
}

function ajustarAlturaNota() {
  nextTick(() => {
    const el = notaTextoEl.value
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  })
}

function removerNota(i) {
  notas.value.splice(i, 1)
}

// ── Gerar ──
function gerar() {
  erro.value = ''
  if (!form.nome.trim()) { erro.value = 'Informe o nome do paciente.'; return }
  if (notas.value.length === 0) { erro.value = 'Adicione pelo menos uma nota.'; return }

  const linhas = notas.value.map(n => {
    let t = n.texto.charAt(0).toUpperCase() + n.texto.slice(1)
    if (!/[.!?]$/.test(t)) t += '.'
    return `${n.hora} – ${t}`
  })

  textoGerado.value = linhas.join('\n')
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
    const r = await anotacoesStore.salvar({ tipo: 'livre', texto: textoGerado.value, nome: form.nome, leito: form.leito })
    if (r?.modo === 'offline') showToast('Salvo offline - sincroniza automatico')
    else showToast('Salvo no histórico!')
  } catch { showToast('Erro ao salvar') }
  finally { salvando.value = false }
}

// ── Nova anotação ──
function novaAnotacao() {
  form.nome = ''; form.leito = ''
  notas.value = []
  notaTexto.value = ''
  notaHora.value = horaAtual()
  textoGerado.value = ''; gerado.value = false
  erro.value = ''; copiado.value = false
}

watch(notaTexto, (txt) => {
  if (!modeloSelecionadoKey.value) return
  const atual = modelos.value.find(m => m._key === modeloSelecionadoKey.value)
  if (!atual || (atual.texto || '') !== txt) modeloSelecionadoKey.value = ''
})
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

.page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.page-icon { font-size: 2rem; line-height: 1; }
.page-titulo { font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 0; }
.page-sub { font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0; }

.card-secao {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 16px;
}

.secao-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.secao-label-lg {
  font-size: 0.75rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.08em;
  flex: 1;
}
.badge-count {
  background: var(--border); color: var(--text-muted);
  font-size: 0.7rem; font-weight: 700;
  border-radius: 10px; padding: 1px 7px;
}
.badge-count.azul { background: var(--blue); color: #fff; }

/* Botão gerenciar modelos */
.modelos-acoes { display: flex; align-items: center; gap: 6px; }
.btn-gerenciar {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--border);
  border-radius: 20px; color: var(--text-muted);
  font-size: 0.75rem; font-family: inherit;
  padding: 4px 10px; cursor: pointer; transition: all 0.15s;
}
.btn-gerenciar:active { background: var(--bg-hover); color: var(--blue); border-color: var(--blue); }
.btn-novo-modelo-topo {
  display: flex; align-items: center; gap: 5px;
  background: var(--blue); border: 1px solid var(--blue);
  border-radius: 20px; color: #fff;
  font-size: 0.75rem; font-family: inherit;
  padding: 4px 10px; cursor: pointer; transition: all 0.15s;
}
.btn-novo-modelo-topo:active { opacity: 0.85; transform: scale(0.98); }

/* Chips paciente */
.chips-scroll { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }

/* Modelos: chips com quebra de linha */
.modelos-chips-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 4px;
}
.chip-modelo {
  max-width: 160px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.85rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.chip-modelo:active { opacity: 0.8; }
.chip-modelo-on {
  background: rgba(59,130,246,0.12); border-color: var(--blue); color: var(--blue); font-weight: 600;
}
.modelos-vazio-row {
  font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;
  margin-bottom: 8px;
}
.modelos-debug {
  margin: -4px 0 8px;
  font-size: 0.72rem;
  color: var(--text-muted);
}
.btn-link {
  background: none; border: none; color: var(--blue);
  font-size: inherit; font-family: inherit; cursor: pointer; padding: 0;
  text-decoration: underline;
}

/* Nota composer */
.nota-composer {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
  margin-bottom: 14px; margin-top: 2px;
}
.nota-composer-row {
  display: flex; align-items: flex-start;
  padding: 4px 4px 0 4px; gap: 0;
}
.nc-hora {
  flex-shrink: 0; width: 94px;
  background: transparent; border: none;
  color: var(--blue); font-family: inherit; font-size: 0.95rem;
  font-weight: 700; padding: 12px 8px 12px 10px;
  outline: none; cursor: pointer;
}
.nc-divider {
  width: 1px; height: 22px; background: var(--border); flex-shrink: 0;
}
.nc-texto {
  flex: 1; background: transparent; border: none;
  color: var(--text); font-family: inherit; font-size: 0.95rem;
  padding: 12px 12px; outline: none;
  min-height: 44px; max-height: 120px; resize: none; overflow-y: auto;
  line-height: 1.35; white-space: pre-wrap; overflow-wrap: anywhere;
}
.nc-texto::placeholder { color: var(--text-muted); }
.nc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 10px 10px 12px;
}
.nc-hint {
  font-size: 0.72rem; color: var(--text-muted);
}
.nc-btn-add {
  display: flex; align-items: center; gap: 5px;
  background: var(--blue); color: #fff; border: none;
  border-radius: 20px; font-family: inherit; font-size: 0.82rem;
  font-weight: 600; padding: 7px 14px; cursor: pointer;
  transition: all 0.15s;
}
.nc-btn-add:active { opacity: 0.85; transform: scale(0.97); }
.nc-btn-add:disabled { background: var(--border); cursor: default; }

/* Timeline */
.timeline { margin-bottom: 4px; }
.timeline-item {
  display: flex; align-items: flex-start; gap: 10px;
  position: relative; padding: 10px 0; padding-left: 20px;
}
.timeline-dot {
  position: absolute; left: 0; top: 16px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--blue); flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.timeline-line {
  position: absolute; left: 4px; top: 26px;
  width: 2px; height: calc(100% - 6px);
  background: var(--border);
}
.timeline-content {
  flex: 1; display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px;
  padding: 8px 12px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; font-size: 0.9rem;
}
.timeline-hora { font-weight: 700; color: var(--blue); white-space: nowrap; font-size: 0.85rem; }
.timeline-sep { color: var(--text-muted); font-size: 0.85rem; }
.timeline-texto { color: var(--text-dim); flex: 1; word-break: break-word; }
.btn-del-nota {
  background: none; border: none; color: var(--text-muted);
  font-size: 1.1rem; cursor: pointer; padding: 4px 6px;
  border-radius: 6px; line-height: 1; flex-shrink: 0; margin-top: 4px;
}
.btn-del-nota:active { color: var(--danger); background: rgba(220,38,38,0.08); }

/* Utilitários */
.obrigatorio { color: var(--danger); font-weight: 700; }
.opc { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 8px; }

/* Resultado */
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

/* ── Modal Modelos ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: flex-end; z-index: 200;
}
.modal-modelos {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 20px 20px 0 0;
  width: 100%; max-height: 80dvh;
  display: flex; flex-direction: column;
}
.modal-modelos-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.modal-modelos-header h3 {
  font-size: 1.05rem; font-weight: 700; color: var(--text);
}
.btn-fechar-modal {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 4px; border-radius: 8px; display: flex; align-items: center;
}
.btn-fechar-modal:active { background: var(--bg-hover); }
.modal-modelos-body {
  flex: 1; overflow-y: auto; padding: 14px 16px;
}
.modal-modelos-footer {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--border); flex-shrink: 0;
}

/* Lista dentro do modal */
.modal-lista { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.modal-modelo-item {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 10px;
}
.modal-modelo-txt {
  flex: 1; font-size: 0.9rem; color: var(--text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.btn-del-modal {
  background: none; border: none; color: var(--text-muted);
  font-size: 1.2rem; cursor: pointer; padding: 4px 8px;
  border-radius: 6px; flex-shrink: 0; line-height: 1;
}
.btn-del-modal:active { color: var(--danger); background: rgba(220,38,38,0.08); }
.modal-vazio {
  font-size: 0.83rem; color: var(--text-muted); line-height: 1.5;
  margin-bottom: 14px; padding: 4px 0;
}

</style>
