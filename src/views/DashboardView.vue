<template>
  <div class="screen">
    <header class="app-header">
      <div style="width:34px"/>
      <div class="header-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 2c0 0-1 3-1 6s1 4 1 4-1 1-1 4 1 6 1 6"/>
          <path d="M9 7c-2 1-3 2-3 3s2 2 6 2 6-1 6-2-1-2-3-3"/>
          <path d="M9 17c-2-1-3-2-3-3s2-2 6-2 6 1 6 2-1 2-3 3"/>
        </svg>
        <span>Plantão</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn-ajuda" @click="helpAberto = true">? Ajuda</button>
        <button  data-testid="auto-btn-dashboardview-1" class="btn-icon" @click="router.push({ name: 'historico' })" title="Histórico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="container" style="padding-top:24px;padding-bottom:40px">
      <div class="saudacao">
        <p class="saudacao-hora">{{ saudacaoTexto }}</p>
        <h2 v-if="auth.userName">{{ auth.userName }}</h2>
      </div>

      <p class="secao-label">Nova anotação</p>

      <div class="tipos-grid">
        <button  data-testid="auto-btn-dashboardview-2" v-for="tipo in tipos" :key="tipo.id" class="tipo-card" @click="navegar(tipo)">
          <span class="tipo-icon">{{ tipo.icon }}</span>
          <span class="tipo-nome">{{ tipo.nome }}</span>
          <span v-if="!tipo.rota" class="tipo-badge">em breve</span>
        </button>
      </div>

      <button class="btn-pacientes" @click="router.push({ name: 'pacientes' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        Meus Pacientes do plantão
      </button>

      <button class="btn-organizador" @click="router.push({ name: 'organizador' })">
        <div class="btn-org-inner">
          <span class="btn-org-icon">📋</span>
          <div class="btn-org-info">
            <span class="btn-org-titulo">Organizador do Plantão</span>
            <span class="btn-org-sub" v-if="!orgStore.plantao">Nenhum plantão ativo</span>
            <span class="btn-org-sub" v-else>
              {{ orgStore.plantao.tarefas.filter(t => t.feito).length }}/{{ orgStore.plantao.tarefas.length }} tarefas
              · {{ orgStore.plantao.tarefas.filter(t => !t.feito).length }} pendente{{ orgStore.plantao.tarefas.filter(t => !t.feito).length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </button>

      <button  data-testid="auto-btn-dashboardview-3" class="btn-historico" @click="router.push({ name: 'historico' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Ver histórico de anotações
      </button>

      <button  data-testid="auto-btn-dashboardview-4" class="btn btn-ghost" style="margin-top:10px" @click="sair">
        Sair da conta
      </button>
    </main>

    <HelpModal :aberto="helpAberto" @fechar="helpAberto = false" titulo="Como usar o Plantão" :itens="helpItens" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useOrganizadorStore } from '../stores/organizador.js'
import HelpModal from '../components/HelpModal.vue'

const router   = useRouter()
const auth     = useAuthStore()
const orgStore = useOrganizadorStore()

const helpAberto = ref(false)

const helpItens = [
  { icone: '🩺', titulo: 'Anotação Inicial', desc: 'Registre o estado do paciente: posição da cama, dispositivos, neurológico, respiratório e eliminações. Gere o texto formatado e copie para o sistema.' },
  { icone: '📊', titulo: 'Sinais Vitais', desc: 'Registre PA, FC, FR, Tax e SpO₂ com horário. O texto é gerado automaticamente com os valores e suas referências.' },
  { icone: '💊', titulo: 'Medicação', desc: 'Documente os medicamentos administrados com dose, via, diluição e dupla checagem. Suporta múltiplos medicamentos no mesmo horário.' },
  { icone: '🚑', titulo: 'Encaminhamento', desc: 'Gere a anotação de encaminhamento do paciente: destino (com chips personalizados por conta), tipo de transporte, acompanhante e dispositivos em uso.' },
  { icone: '🧼', titulo: 'Higienização', desc: 'Registre banho de aspersão, banho de leito ou troca de fralda. Na troca de fralda, selecione o tipo de eliminação (diurese, evacuação ou ambos), a quantidade e o local — troca de roupa de cama é incluída automaticamente quando em leito.' },
  { icone: '🩹', titulo: 'Curativo', desc: 'Documente curativo simples, troca de curativo ou troca de placa de hidrocoloide. Selecione o local por chips predefinidos (MSD, MIE...) ou chips salvos por conta, ou escreva livremente. Materiais podem ser marcados da lista, salvos por conta ou digitados rapidamente. Para curativo de dreno, descreva o tipo do dreno.' },
  { icone: '🔄', titulo: 'Passagem de plantão', desc: 'Gere a anotação de passagem de plantão: registre refeição ofertada, queixas, posição da cama, rodas, grades e decúbito. Inclua opcionalmente dieta enteral, infusão venosa, SVD e observações livres.' },
  { icone: '📝', titulo: 'Notas Livres', desc: 'Crie seus próprios modelos de anotação e use com um toque. Adicione horário e texto livre, acumule várias notas e gere o texto formatado. Modelos salvos por conta no Firebase. Funciona offline.' },
  { icone: '🛏️', titulo: 'Meus Pacientes', desc: 'Cadastre os pacientes do seu plantão por leito. Adicione pendências para cada um e marque conforme resolve. Aparecem como atalho nas anotações.' },
  { icone: '📋', titulo: 'Organizador', desc: 'Checklist de tarefas do seu turno com horários e alertas. Anote o que precisa ser passado para o próximo plantão.' },
  { icone: '🕐', titulo: 'Histórico', desc: 'Acesse, busque, edite e compartilhe todas as anotações já geradas. Filtre por tipo ou por paciente.' },
  { icone: '🔑', titulo: 'Código de sincronização', desc: 'Seu código único sincroniza os dados em qualquer dispositivo. Use o mesmo código e PIN no celular, tablet ou computador.' },
]

onMounted(() => {
  orgStore.iniciar()
})

const saudacaoTexto = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
})

const tipos = [
  { id: 'inicial',   icon: '📋', nome: 'Anotação inicial',      rota: 'anotacao-inicial' },
  { id: 'sv',        icon: '📊', nome: 'Sinais vitais',          rota: 'sinais-vitais'   },
  { id: 'medicacao', icon: '💊', nome: 'Medicação',              rota: 'medicacao'   },
  { id: 'encamin',   icon: '🚑', nome: 'Encaminhamento',         rota: 'encaminhamento' },
  { id: 'banho',     icon: '🧼', nome: 'Higienização',            rota: 'banho' },
  { id: 'curativo',  icon: '🩹', nome: 'Curativo',               rota: 'curativo' },
  { id: 'passagem',  icon: '🔄', nome: 'Passagem de plantão',    rota: 'passagem' },
  { id: 'livre',     icon: '📝', nome: 'Notas Livres',             rota: 'livre' },
]

function navegar(tipo) {
  if (tipo.rota) router.push({ name: tipo.rota })
  else alert(tipo.nome + ' em breve!')
}

function sair() {
  if (confirm('Deseja sair da sua conta?')) {
    auth.logout()
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.header-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--blue);
  font-size: 1.05rem;
  font-weight: 700;
}
.btn-icon {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }

.saudacao { margin-bottom: 28px; }
.saudacao-hora { color: var(--text-muted); font-size: 0.9rem; }
.saudacao h2 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-top: 2px; }

.secao-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.tipos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.tipo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.tipo-card:active { background: var(--bg-hover); transform: scale(0.97); }
.tipo-icon { font-size: 1.5rem; }
.tipo-nome { font-size: 0.9rem; font-weight: 600; color: var(--text); line-height: 1.3; }
.tipo-badge {
  font-size: 0.62rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-historico {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-historico:active { background: var(--bg-hover); }

.btn-pacientes {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; margin-top: 16px; padding: 14px;
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius); color: var(--blue);
  font-family: inherit; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-pacientes:active { background: var(--bg-hover); }

.btn-organizador {
  display: block; width: 100%; margin-top: 10px; padding: 14px;
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius);
  font-family: inherit; cursor: pointer; transition: all 0.15s;
  text-align: left;
}
.btn-organizador:active { background: var(--bg-hover); }
.btn-org-inner {
  display: flex; align-items: center; gap: 10px;
}
.btn-org-icon { font-size: 1.4rem; flex-shrink: 0; }
.btn-org-info {
  display: flex; flex-direction: column; gap: 2px;
}
.btn-org-titulo {
  font-size: 0.95rem; font-weight: 600; color: var(--blue);
}
.btn-org-sub {
  font-size: 0.78rem; color: var(--text-muted);
}
</style>
