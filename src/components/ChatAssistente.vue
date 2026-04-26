<template>
  <Teleport to="body">
    <Transition name="chat-slide">
      <div v-if="aberto" class="chat-overlay" @click.self="toggleChat">
        <div class="chat-sheet">

          <!-- Cabeçalho -->
          <div class="chat-header">
            <div class="chat-header-info">
              <span class="chat-avatar">👩‍⚕️</span>
              <div>
                <div class="chat-nome">Clara</div>
                <div class="chat-subtitulo">Assistente de Enfermagem</div>
              </div>
            </div>
            <div class="chat-header-acoes">
              <button v-if="mensagens.length > 0" class="chat-btn-limpar" @click="limparConversa" title="Limpar conversa">🗑</button>
              <button class="chat-btn-fechar" @click="toggleChat">✕</button>
            </div>
          </div>

          <div class="chat-disclaimer">
            🤖 Clara é uma inteligência artificial. Sempre verifique as informações com profissionais de saúde.
          </div>

          <!-- Mensagens -->
          <div class="chat-mensagens" ref="listaMensagens">
            <!-- Boas-vindas -->
            <div v-if="mensagens.length === 0" class="chat-boas-vindas">
              <div class="msg-bolha msg-assistente">
                Olá! Sou a Clara, sua assistente de plantão. Como posso ajudar?
              </div>
              <!-- Chips de sugestão -->
              <div class="chat-chips">
                <button class="chat-chip" @click="sugerir('Me ajude a redigir uma anotação de queda de paciente')">📋 Anotação de queda</button>
                <button class="chat-chip" @click="sugerir('Me ajude a estruturar a passagem de plantão')">🔄 Passagem de plantão</button>
                <button class="chat-chip" @click="sugerir('Me ajude a redigir uma evolução de enfermagem')">📝 Evolução</button>
                <button class="chat-chip" @click="sugerir('Como calcular o gotejamento de soro?')">💊 Calcular gotejamento</button>
                <button class="chat-chip" @click="sugerir('Como descrever uma intercorrência no prontuário?')">⚠️ Intercorrência</button>
                <button class="chat-chip" @click="sugerir('Paciente com sinais vitais alterados, como registrar?')">🩺 Sinais vitais</button>
              </div>
            </div>

            <!-- Histórico -->
            <div
              v-for="(msg, i) in mensagens"
              :key="i"
              :class="['msg-bolha', msg.role === 'user' ? 'msg-usuario' : msg.role === 'system' ? 'msg-sistema' : 'msg-assistente']"
            >
              <span class="msg-texto">{{ msg.content }}</span>
              <button
                v-if="msg.role === 'assistant'"
                class="msg-copiar"
                @click="copiar(msg.content)"
                title="Copiar"
              >📋</button>
            </div>

            <!-- Loading -->
            <div v-if="carregando" class="msg-bolha msg-assistente msg-loading">
              <span></span><span></span><span></span>
            </div>

            <!-- Erro -->
            <div v-if="erro" class="msg-erro">{{ erro }}</div>
          </div>

          <!-- Input -->
          <div class="chat-input-area">
            <textarea
              ref="inputRef"
              v-model="texto"
              class="chat-input"
              placeholder="Mensagem para Clara..."
              rows="1"
              :disabled="carregando"
              @keydown.enter.exact.prevent="enviar"
              @input="ajustarAltura"
            ></textarea>
            <button
              class="chat-enviar"
              :disabled="!texto.trim() || carregando"
              @click="enviar"
            >➤</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChat } from '../composables/useChat.js'

const { aberto, mensagens, carregando, erro, toggleChat, limparConversa, enviarMensagem } = useChat()

const texto = ref('')
const listaMensagens = ref(null)
const inputRef = ref(null)

async function enviar() {
  const t = texto.value.trim()
  if (!t || carregando.value) return
  texto.value = ''
  await enviarMensagem(t)
  await nextTick()
  scrollParaBaixo()
}

async function sugerir(msg) {
  texto.value = msg
  await enviar()
}

function ajustarAltura() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 80) + 'px'
}

function scrollParaBaixo() {
  const el = listaMensagens.value
  if (el) el.scrollTop = el.scrollHeight
}

function copiar(conteudo) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(conteudo).catch(() => copiarFallback(conteudo))
  } else {
    copiarFallback(conteudo)
  }
}

function copiarFallback(conteudo) {
  const el = document.createElement('textarea')
  el.value = conteudo
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

watch(mensagens, async () => {
  await nextTick()
  scrollParaBaixo()
}, { deep: true })

watch(aberto, async (val) => {
  if (val) {
    await nextTick()
    scrollParaBaixo()
    inputRef.value?.focus()
  }
})
</script>

<style scoped>
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.chat-sheet {
  width: 100%;
  max-height: 80vh;
  background: var(--bg-card);
  border-radius: 18px 18px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border);
}
.chat-header-info { display: flex; align-items: center; gap: 10px; }
.chat-avatar { font-size: 1.8rem; }
.chat-nome { font-weight: 700; font-size: 1rem; color: var(--text); }
.chat-subtitulo { font-size: 0.72rem; color: var(--text-dim); }
.chat-header-acoes { display: flex; gap: 8px; }
.chat-btn-fechar, .chat-btn-limpar {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}
.chat-btn-fechar:hover, .chat-btn-limpar:hover { background: var(--bg-hover); }

.chat-disclaimer {
  background: var(--success-muted);
  color: var(--success);
  font-size: 0.7rem;
  text-align: center;
  padding: 5px 12px;
}

.chat-mensagens {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
}

.chat-boas-vindas { display: flex; flex-direction: column; gap: 10px; }

.chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chat-chip {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}
.chat-chip:active { background: var(--bg-hover); }

.msg-bolha {
  max-width: 88%;
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.45;
  position: relative;
  word-break: break-word;
}
.msg-usuario {
  background: linear-gradient(180deg, var(--blue), var(--blue-dark));
  color: var(--text-on-accent);
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.msg-assistente {
  background: var(--bg-input);
  color: var(--text);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.msg-sistema {
  background: var(--warning-muted);
  color: var(--warning);
  align-self: center;
  font-size: 0.78rem;
  border-radius: 10px;
  max-width: 95%;
}

.msg-texto { white-space: pre-wrap; }

.msg-copiar {
  background: transparent;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.5;
  padding: 2px 4px;
  margin-left: 6px;
  vertical-align: middle;
}
.msg-copiar:hover { opacity: 1; }

.msg-loading {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px 16px;
}
.msg-loading span {
  width: 7px;
  height: 7px;
  background: var(--blue);
  border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
}
.msg-loading span:nth-child(2) { animation-delay: 0.2s; }
.msg-loading span:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.msg-erro {
  background: var(--danger-muted);
  color: var(--danger);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.8rem;
  text-align: center;
}

.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 14px 16px;
  border-top: 1px solid var(--border);
}
.chat-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.9rem;
  padding: 9px 12px;
  resize: none;
  line-height: 1.4;
  max-height: 80px;
  overflow-y: auto;
}
.chat-input::placeholder { color: var(--text-muted); }
.chat-input:focus { outline: none; border-color: var(--blue); }

.chat-enviar {
  background: var(--blue);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: var(--text-on-accent);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.chat-enviar:disabled { background: var(--bg-hover); color: var(--text-muted); cursor: not-allowed; }
.chat-enviar:not(:disabled):active { background: var(--blue-dark); }

.chat-slide-enter-active,
.chat-slide-leave-active { transition: opacity 0.25s ease; }
.chat-slide-enter-from,
.chat-slide-leave-to { opacity: 0; }
.chat-slide-enter-active .chat-sheet,
.chat-slide-leave-active .chat-sheet { transition: transform 0.25s ease; }
.chat-slide-enter-from .chat-sheet,
.chat-slide-leave-to .chat-sheet { transform: translateY(100%); }
</style>
