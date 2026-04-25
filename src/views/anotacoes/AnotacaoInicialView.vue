<template>
  <div class="screen inicial-screen">
    <header class="app-header inicial-header">
      <button  data-testid="auto-btn-anotacaoinicialview-1" class="btn-icon" @click="voltarOuSair">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button  data-testid="auto-btn-anotacaoinicialview-2" class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>
      <button class="btn-icon" @click="mostrarConfigModal = true" title="Personalizar campos">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </header>

    <!-- Barra de progresso -->
    <div v-if="!gerado" class="progress-wrap inicial-progress">
      <div class="progress-fill" :style="{ width: (passo * 20) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 5</span>
    </div>

    <main class="container inicial-page">

      <!-- Banner de rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info">
          <span>📝</span>
          <span>Você tem um rascunho salvo</span>
        </div>
        <div class="rascunho-acoes">
          <button  data-testid="auto-btn-anotacaoinicialview-3" class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-4" class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
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
            :class="{ 'chip-on': form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '') }"
            @click="selecionarPaciente(p)"
          >{{ p.leito ? p.leito + ' ' : '' }}<span v-if="p.leito" aria-hidden="true">&middot;</span>{{ p.leito ? ' ' : '' }}{{ p.nome }}</button>
        </div>
      </section>

      <section v-if="!gerado && passo === 1" class="module-hero">
        <div class="module-hero-icon">
          <img :src="iconAnotacaoInicial" alt="Anotação inicial" />
        </div>
        <div class="module-hero-copy">
          <h1>Anotação inicial</h1>
          <p>Organize admissão, estado geral, dispositivos e eliminações.</p>
        </div>
      </section>

      <div v-if="!gerado && passo === 1" class="inicial-card">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input  data-testid="auto-input-anotacaoinicialview-1" type="time" v-model="form.horario">
        </div>

        <div class="campo">
          <label>Sexo </label>
          <div class="radio-group">
            <label class="radio-btn">
              <input  data-testid="auto-input-anotacaoinicialview-2" type="radio" v-model="form.sexo" value="F">
              <span>Feminino</span>
            </label>
            <label class="radio-btn">
              <input  data-testid="auto-input-anotacaoinicialview-3" type="radio" v-model="form.sexo" value="M">
              <span>Masculino</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Localização </label>
          <div class="radio-group">
            <label class="radio-btn">
              <input type="radio" v-model="form.localizacao" value="leito">
              <span>Leito</span>
            </label>
            <label class="radio-btn">
              <input type="radio" v-model="form.localizacao" value="poltrona">
              <span>Poltrona</span>
            </label>
          </div>
        </div>

        <template v-if="form.localizacao === 'leito'">
          <div class="campo">
            <label>Posição da cama </label>
            <div class="radio-group">
              <label class="radio-btn" v-for="op in ['baixa','média','alta']" :key="op">
                <input type="radio" v-model="form.posicaoCama" :value="op" @change="desativarOutro('posicaoCama')">
                <span>{{ cap(op) }}</span>
              </label>
              <label class="radio-btn">
                <input type="radio" :checked="outroAtivo.posicaoCama" @click.prevent="outroAtivo.posicaoCama ? desativarOutro('posicaoCama') : selecionarOutro('posicaoCama')">
                <span>Outro</span>
              </label>
            </div>
            <input v-if="outroAtivo.posicaoCama" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.posicaoCama || ''" @input="atualizarOutro('posicaoCama', $event.target.value)" placeholder="Descreva a posição...">
          </div>

          <div class="campo">
            <label>Rodas </label>
            <div class="radio-group">
              <label class="radio-btn" v-for="op in ['travadas','soltas']" :key="op">
                <input type="radio" v-model="form.rodas" :value="op" @change="desativarOutro('rodas')">
                <span>{{ cap(op) }}</span>
              </label>
              <label class="radio-btn">
                <input type="radio" :checked="outroAtivo.rodas" @click.prevent="outroAtivo.rodas ? desativarOutro('rodas') : selecionarOutro('rodas')">
                <span>Outro</span>
              </label>
            </div>
            <input v-if="outroAtivo.rodas" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.rodas || ''" @input="atualizarOutro('rodas', $event.target.value)" placeholder="Descreva...">
          </div>

          <div class="campo">
            <label>Grades </label>
            <div class="radio-group vertical">
              <label class="radio-btn" v-for="op in ['totalmente elevadas','parcialmente elevadas','abaixadas']" :key="op">
                <input type="radio" v-model="form.grades" :value="op" @change="desativarOutro('grades')">
                <span>{{ cap(op) }}</span>
              </label>
              <label class="radio-btn">
                <input type="radio" :checked="outroAtivo.grades" @click.prevent="outroAtivo.grades ? desativarOutro('grades') : selecionarOutro('grades')">
                <span>Outro</span>
              </label>
            </div>
            <input v-if="outroAtivo.grades" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.grades || ''" @input="atualizarOutro('grades', $event.target.value)" placeholder="Descreva a posição das grades...">
          </div>

          <div class="campo">
            <label>Decúbito </label>
            <div class="radio-group vertical">
              <label class="radio-btn" v-for="op in ['parcialmente elevado','dorsal','lateral direito','lateral esquerdo','Fowler']" :key="op">
                <input type="radio" v-model="form.decubito" :value="op" @change="desativarOutro('decubito')">
                <span>{{ cap(op) }}</span>
              </label>
              <label class="radio-btn">
                <input type="radio" :checked="outroAtivo.decubito" @click.prevent="outroAtivo.decubito ? desativarOutro('decubito') : selecionarOutro('decubito')">
                <span>Outro</span>
              </label>
            </div>
            <input v-if="outroAtivo.decubito" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.decubito || ''" @input="atualizarOutro('decubito', $event.target.value)" placeholder="Descreva o decúbito...">
          </div>
        </template>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button  data-testid="auto-btn-anotacaoinicialview-5" class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-6" class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Estado Geral ═══ -->
      <div v-if="!gerado && passo === 2" class="inicial-card">
        <h2 class="bloco-titulo">Estado Geral</h2>

        <div class="campo estado-section estado-section-compact">
          <label>Estado mental</label>
          <label class="checkbox-label" :class="{ checked: form.mentalAlterado }">
            <input  data-testid="auto-input-anotacaoinicialview-8" type="checkbox" v-model="form.mentalAlterado">
            <span>Estado mental alterado</span>
          </label>
          <div v-if="form.mentalAlterado" style="margin-top:8px">
            <input  data-testid="auto-input-anotacaoinicialview-9" class="campo-inline" type="text" v-model="form.mentalDesc" placeholder="Ex: desorientada, agitada, confusa">
          </div>
        </div>

        <div class="campo estado-section">
          <label>Colaboração </label>
          <div class="radio-group estado-options estado-options-compact">
            <label class="radio-btn" v-for="op in colaboracaoOpcoes" :key="op.value">
              <input type="radio" v-model="form.colaboracao" :value="op.value" @change="desativarOutro('colaboracao')">
              <span>{{ op.label }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.colaboracao" @click.prevent="outroAtivo.colaboracao ? desativarOutro('colaboracao') : selecionarOutro('colaboracao')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.colaboracao" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.colaboracao || ''" @input="atualizarOutro('colaboracao', $event.target.value)" placeholder="Descreva o estado...">
        </div>

        <div class="campo estado-section">
          <label>Deambulação</label>
          <div class="radio-group vertical estado-options">
            <label class="radio-btn" v-for="op in deambulacaoOpcoes" :key="op.value">
              <input type="radio" :checked="form.deambulacao === op.value && !outroAtivo.deambulacao" @click="form.deambulacao = form.deambulacao === op.value && !outroAtivo.deambulacao ? '' : op.value; desativarOutro('deambulacao')">
              <span>{{ op.label }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.deambulacao" @click.prevent="outroAtivo.deambulacao ? desativarOutro('deambulacao') : selecionarOutro('deambulacao')">
              <span>Outro</span>
            </label>
          </div>
          <div v-if="form.deambulacao === 'deambula com auxílio' && !outroAtivo.deambulacao" style="margin-top:8px">
            <input class="campo-inline" type="text" v-model="form.deambulaAuxilio" placeholder="Ex: bengala, andador, cadeira de rodas">
          </div>
          <input v-if="outroAtivo.deambulacao" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.deambulacao || ''" @input="atualizarOutro('deambulacao', $event.target.value)" placeholder="Descreva a mobilidade...">
        </div>

        <div class="campo estado-section estado-section-resp" v-if="form.respiracao !== 'ventilação mecânica' && !outroAtivo.respiracao">
          <label>Padrão respiratório</label>
          <div class="radio-group estado-options estado-options-compact">
            <label class="radio-btn" v-for="op in respPadraoOpcoes" :key="op.value">
              <input type="radio" v-model="form.respPadrao" :value="op.value">
              <span>{{ op.label }}</span>
            </label>
          </div>
        </div>

        <div class="campo estado-section estado-section-resp estado-section-resp-main">
          <label>Respiração </label>
          <div class="radio-group vertical estado-options">
            <label class="radio-btn" v-for="op in ['em ar ambiente','cateter nasal de O₂','máscara de O₂','ventilação mecânica']" :key="op">
              <input type="radio" v-model="form.respiracao" :value="op" @change="onRespChange(); desativarOutro('respiracao')">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.respiracao" @click.prevent="outroAtivo.respiracao ? desativarOutro('respiracao') : selecionarOutro('respiracao')">
              <span>Outro</span>
            </label>
          </div>
          <div v-if="(form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂') && !outroAtivo.respiracao" style="margin-top:8px">
            <div class="input-suffix-wrap">
              <input type="number" v-model="form.oxigenioLitros" placeholder="2" min="1">
              <span class="input-suffix">L/min</span>
            </div>
          </div>
          <input v-if="outroAtivo.respiracao" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.respiracao || ''" @input="atualizarOutro('respiracao', $event.target.value)" placeholder="Descreva a respiração...">
        </div>

        <div class="campo estado-section estado-section-compact">
          <label>Acompanhante </label>
          <div class="radio-group estado-options estado-options-inline">
            <label class="radio-btn">
              <input  data-testid="auto-input-anotacaoinicialview-16" type="radio" v-model="form.acompanhante" value="nao">
              <span>Não</span>
            </label>
            <label class="radio-btn">
              <input  data-testid="auto-input-anotacaoinicialview-17" type="radio" v-model="form.acompanhante" value="sim">
              <span>Sim</span>
            </label>
          </div>
          <div v-if="form.acompanhante === 'sim'" style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
            <input  data-testid="auto-input-anotacaoinicialview-18" class="campo-inline" type="text" v-model="form.acompanhanteNome" placeholder="Nome do acompanhante">
            <input  data-testid="auto-input-anotacaoinicialview-19" class="campo-inline" type="text" v-model="form.acompanhanteParentesco" placeholder="Parentesco (ex: esposa, filho, mãe)">
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button  data-testid="auto-btn-anotacaoinicialview-7" class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-8" class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-9" class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 3 — Dispositivos ═══ -->
      <div v-if="!gerado && passo === 3" class="inicial-card">
        <div class="disp-head">
          <div>
            <h2 class="bloco-titulo">Dispositivos</h2>
            <p>Adicione acessos, sondas, curativos e outros dispositivos em uso.</p>
          </div>
          <span v-if="form.dispositivos.length > 0" class="disp-count">{{ form.dispositivos.length }}</span>
        </div>

        <div class="disp-lista" v-if="form.dispositivos.length > 0">
          <div class="disp-item"
            v-for="(d, i) in form.dispositivos" :key="i"
            draggable="true"
            @dragstart="onDragStart(i)"
            @dragover.prevent="onDragOver(i)"
            @drop.prevent="onDrop(i)"
            :class="{ 'drag-over': dragOverIdx === i && dragIdx !== i }">
            <span class="disp-texto">{{ d }}</span>
            <div class="disp-acoes">
              <button  data-testid="auto-btn-anotacaoinicialview-10" class="btn-icon-sm" @click="moverDisp(i, -1)" :disabled="i === 0" title="Mover para cima">↑</button>
              <button  data-testid="auto-btn-anotacaoinicialview-11" class="btn-icon-sm" @click="moverDisp(i, 1)" :disabled="i === form.dispositivos.length - 1" title="Mover para baixo">↓</button>
              <button  data-testid="auto-btn-anotacaoinicialview-12" class="btn-icon-sm btn-danger-sm" @click="removerDisp(i)" title="Remover">×</button>
            </div>
          </div>
        </div>
        <div v-else class="disp-empty">
          <strong>Nenhum dispositivo adicionado</strong>
          <span>Use os atalhos abaixo para montar a anotação.</span>
        </div>

        <div class="disp-grid">
          <button  data-testid="auto-btn-anotacaoinicialview-13" class="btn-disp" v-for="tipo in tiposDisp" :key="tipo" @click="abrirModal(tipo)">
            <span aria-hidden="true">+</span>{{ tipo }}
          </button>
        </div>

        <div class="bloco-nav" style="margin-top:24px">
          <button  data-testid="auto-btn-anotacaoinicialview-14" class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 2">← Voltar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-15" class="btn btn-primary" @click="passo = 4">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 4 — Eliminações ═══ -->
      <div v-if="!gerado && passo === 4" class="inicial-card">
        <h2 class="bloco-titulo">Eliminações</h2>

        <div class="campo">
          <label>Última evacuação </label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in evacuacaoOpcoes" :key="op.v">
              <input  data-testid="auto-input-anotacaoinicialview-20" type="radio" v-model="form.evacuacaoOpcao" :value="op.v">
              <span>{{ op.l }}</span>
            </label>
          </div>
          <div v-if="form.evacuacaoOpcao === 'data'" style="margin-top:10px">
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px">Clique para selecionar a data da evacuação</p>
            <input  data-testid="auto-input-anotacaoinicialview-21" type="date" v-model="form.evacuacaoData" class="campo-inline">
          </div>
        </div>

        <div class="campo">
          <label>Diurese </label>
          <div class="radio-group vertical">
            <label class="checkbox-label" v-for="op in diureseOpcoes" :key="op.v" :class="{ checked: form.diurese.includes(op.v) }">
              <input  data-testid="auto-input-anotacaoinicialview-22" type="checkbox" :value="op.v" v-model="form.diurese" @change="onDiureseChange">
              <span>{{ op.l }}</span>
            </label>
          </div>
          <div v-if="form.diurese.includes('SVD')" style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
            <div class="input-suffix-wrap">
              <input  data-testid="auto-input-anotacaoinicialview-23" type="number" v-model="form.svdDebito" placeholder="Débito (ml)" min="0">
              <span class="input-suffix">ml</span>
            </div>
            <input  data-testid="auto-input-anotacaoinicialview-24" class="campo-inline" type="text" v-model="form.svdAspecto" placeholder="Aspecto/coloração (opcional)">
          </div>
          <div style="margin-top:10px">
            <input  data-testid="auto-input-anotacaoinicialview-25" class="campo-inline" type="text" v-model="form.diureseObs" placeholder="Ex: diurese em nefrostomia, ureterostomia...">
          </div>
        </div>

        <div class="campo">
          <label>Queixas / observações</label>
          <textarea v-model="form.queixas" rows="3" placeholder="Ex: dor abdominal, náuseas, tontura..."></textarea>
        </div>

        <div class="campo">
          <label>Apresenta <span style="font-size:0.75rem;font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-muted)">(feridas, lesões, outras obs)</span></label>
          <textarea v-model="form.obsApresenta" rows="2" placeholder="Ex: ferida cirúrgica em cicatrização em abdome..."></textarea>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button  data-testid="auto-btn-anotacaoinicialview-16" class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 3">← Voltar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-17" class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-18" class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 5 — Fechamento ═══ -->
      <div v-if="!gerado && passo === 5" class="inicial-card">
        <h2 class="bloco-titulo">Fechamento</h2>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:14px">Escolha uma base de fechamento ou escreva livremente.</p>

        <div class="fechamento-modos">
          <button
            class="chip"
            :class="{ 'chip-on': form.fechamentoModo === 'identificacao' }"
            @click="selecionarFechamentoModo('identificacao')"
          >Usar dados da identificação</button>
          <button
            class="chip"
            :class="{ 'chip-on': form.fechamentoModo === 'poltrona' }"
            @click="selecionarFechamentoModo('poltrona')"
          >Paciente em poltrona</button>
          <button
            class="chip"
            :class="{ 'chip-on': form.fechamentoModo === 'sem' }"
            @click="selecionarFechamentoModo('sem')"
          >Sem fechamento</button>
          <button
            class="chip"
            :class="{ 'chip-on': form.fechamentoModo === 'personalizado' }"
            @click="selecionarFechamentoModo('personalizado')"
          >Personalizado</button>
        </div>

        <div class="campo fechamento-texto" v-if="form.fechamentoModo !== 'sem'">
          <label>Texto de fechamento</label>
          <textarea
            v-model="form.fechamento"
            rows="5"
            :placeholder="form.fechamentoModo === 'personalizado' ? 'Escreva o fechamento...' : ''"
            @input="form.fechamentoModo = 'personalizado'"
          ></textarea>
        </div>
        <div v-else class="fechamento-vazio">
          Nenhuma frase de fechamento será adicionada ao texto.
        </div>

        <div class="fechamento-modelos-head">
          <div>
            <span class="modelos-subtitle">Modelos de fechamento</span>
            <p>Salve suas frases mais usadas e aplique com um toque.</p>
          </div>
          <div class="modelos-acoes">
            <button class="btn-gerenciar" @click="abrirModalFechamentos">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
              Gerenciar
            </button>
            <button class="btn-novo-modelo-topo" @click="abrirModalNovoFechamento">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo
            </button>
          </div>
        </div>

        <div v-if="fechamentosModelos.length > 0" class="modelos-library fechamento-library">
          <div class="modelo-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7"/>
              <line x1="16.5" y1="16.5" x2="21" y2="21"/>
            </svg>
            <input v-model="fechamentoBusca" type="search" placeholder="Buscar fechamento">
          </div>

          <div v-if="fechamentosFavoritos.length > 0 && !fechamentoBusca.trim()" class="modelos-favoritos">
            <span class="modelos-subtitle">Favoritos</span>
            <div class="modelos-fav-row">
              <button
                v-for="m in fechamentosFavoritos"
                :key="m._key"
                class="modelo-fav-chip"
                :class="{ 'modelo-fav-chip-on': fechamentoSelecionadoKey === m._key }"
                @click="selecionarFechamentoModelo(m)"
              >{{ m.titulo }}</button>
            </div>
          </div>

          <div v-if="fechamentosFiltrados.length > 0" class="modelos-lista">
            <div
              v-for="m in fechamentosFiltrados"
              :key="m._key"
              class="modelo-list-item"
              :class="{ 'modelo-list-item-on': fechamentoSelecionadoKey === m._key }"
            >
              <button class="modelo-main-btn" @click="selecionarFechamentoModelo(m)">
                <span class="modelo-title">{{ m.titulo }}</span>
              </button>
              <button
                class="modelo-fav-btn"
                :class="{ 'modelo-fav-btn-on': m.favorito }"
                :title="m.favorito ? 'Remover dos favoritos' : 'Favoritar'"
                @click="alternarFechamentoFavorito(m)"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 3.5l2.6 5.28 5.82.85-4.21 4.1.99 5.79L12 16.78l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-else class="modelos-vazio-row">
            <span>Nenhum modelo encontrado.</span>
            <button class="btn-link" @click="fechamentoBusca = ''">limpar busca</button>
          </div>
        </div>
        <div v-else class="modelos-vazio-row fechamento-empty-modelos">
          <span>Nenhum modelo salvo.</span>
          <button class="btn-link" @click="abrirModalNovoFechamento">Criar modelo</button>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button  data-testid="auto-btn-anotacaoinicialview-19" class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 4">← Voltar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-20" class="btn btn-primary btn-generate" @click="gerar"><IconGenerateNote />Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <ResultadoAnotacao
        v-if="gerado"
        :icon="iconAnotacaoInicial"
        v-model:texto="textoGerado"
        v-model:nomePaciente="form.nomePaciente"
        v-model:leitoPaciente="form.leitoPaciente"
        :salvando="salvando"
        label-nova="Nova anotação inicial"
        @copiar="copiar"
        @salvar="salvar"
        @compartilhar="compartilhar"
        @nova="novaAnotacao"
        @editar="passo = 5; gerado = false"
      />

    </main>

    <!-- ═══ MODAL — Dispositivos ═══ -->
    <div v-if="modal.aberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3>{{ modal.tipo }}</h3>
            <p>Detalhes do dispositivo</p>
          </div>
          <button  data-testid="auto-btn-anotacaoinicialview-26" class="btn-icon" @click="fecharModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <component
            :is="modalComponentMap[modal.tipo] || ModalOutros"
            :d="modal.d"
            :locaisCentral="locaisCentral"
            :pulseiraOpcoes="pulseiraOpcoes"
          />
        </div>

        <p v-if="modal.erro" class="erro-msg" style="padding:0 16px 8px">{{ modal.erro }}</p>

        <div class="modal-footer">
          <button  data-testid="auto-btn-anotacaoinicialview-27" class="btn btn-secondary modal-cancel" @click="fecharModal">Cancelar</button>
          <button  data-testid="auto-btn-anotacaoinicialview-28" class="btn btn-primary modal-add" @click="confirmarDisp">Adicionar</button>
        </div>
      </div>
    </div>

    <div v-if="modalFechamentos" class="modal-overlay" @click.self="fecharModalFechamentos">
      <div class="modal-box modal-fechamentos">
        <div class="modal-header">
          <div>
            <h3>Modelos de fechamento</h3>
            <p>Gerencie suas frases de fechamento.</p>
          </div>
          <button class="btn-icon" @click="fecharModalFechamentos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="fechamentosModelos.length > 0" class="modelo-search-wrap modal-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7"/>
              <line x1="16.5" y1="16.5" x2="21" y2="21"/>
            </svg>
            <input v-model="fechamentoBuscaModal" type="search" placeholder="Buscar fechamento">
          </div>

          <div v-if="fechamentosGerenciamentoFiltrados.length > 0" class="modal-lista">
            <div v-for="m in fechamentosGerenciamentoFiltrados" :key="m._key" class="modal-modelo-item">
              <button
                class="modelo-fav-btn modal-fav-btn"
                :class="{ 'modelo-fav-btn-on': m.favorito }"
                :title="m.favorito ? 'Remover dos favoritos' : 'Favoritar'"
                @click="alternarFechamentoFavorito(m)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 3.5l2.6 5.28 5.82.85-4.21 4.1.99 5.79L12 16.78l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z"/>
                </svg>
              </button>
              <span class="modal-modelo-txt">{{ m.titulo }}</span>
              <button class="btn-del-modal" @click="deletarFechamentoModelo(m._key)" title="Remover">Ã—</button>
            </div>
          </div>
          <p v-else-if="fechamentosModelos.length > 0" class="modal-vazio">Nenhum modelo encontrado.</p>
          <p v-else-if="!carregandoFechamentos" class="modal-vazio">Nenhum modelo ainda. Crie o primeiro em "Novo".</p>
          <p v-else class="modal-vazio">Carregando...</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel" @click="fecharModalFechamentos">Fechar</button>
          <button class="btn btn-primary modal-add" @click="abrirModalNovoFechamento">Novo</button>
        </div>
      </div>
    </div>

    <div v-if="modalNovoFechamento" class="modal-overlay" @click.self="fecharModalNovoFechamento">
      <div class="modal-box modal-fechamentos">
        <div class="modal-header">
          <div>
            <h3>Novo fechamento</h3>
            <p>Salve uma frase para reutilizar depois.</p>
          </div>
          <button class="btn-icon" @click="fecharModalNovoFechamento">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="campo">
            <label>Título</label>
            <input ref="novoFechamentoTituloInput" v-model="novoFechamentoTitulo" type="text" placeholder="Ex: Leito seguro padrão">
          </div>
          <div class="campo">
            <label>Texto</label>
            <textarea v-model="novoFechamentoTexto" rows="6" placeholder="Escreva o fechamento..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel" @click="fecharModalNovoFechamento">Cancelar</button>
          <button class="btn btn-primary modal-add" :disabled="!podeSalvarFechamentoModelo || salvandoFechamentoModelo" @click="salvarFechamentoModelo">
            {{ salvandoFechamentoModelo ? 'Salvando...' : 'Salvar modelo' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast global renderizado em App.vue -->

    <ConfigAnotacaoInicialModal
      :visible="mostrarConfigModal"
      :camposAtivos="camposAtivos"
      @save="salvarCamposAtivos"
      @close="mostrarConfigModal = false"
    />

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAnotacaoInicial } from '../../composables/useAnotacaoInicial.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import ModalAVP from '../../components/modais/ModalAVP.vue'
import ModalCVC from '../../components/modais/ModalCVC.vue'
import ModalPICC from '../../components/modais/ModalPICC.vue'
import ModalPermcath from '../../components/modais/ModalPermcath.vue'
import ModalShilley from '../../components/modais/ModalShilley.vue'
import ModalSNE from '../../components/modais/ModalSNE.vue'
import ModalSNG from '../../components/modais/ModalSNG.vue'
import ModalPulseira from '../../components/modais/ModalPulseira.vue'
import ModalMonitor from '../../components/modais/ModalMonitor.vue'
import ModalDreno from '../../components/modais/ModalDreno.vue'
import ModalCurativo from '../../components/modais/ModalCurativo.vue'
import ModalOutros from '../../components/modais/ModalOutros.vue'
import ConfigAnotacaoInicialModal from '../../components/ConfigAnotacaoInicialModal.vue'
import IconGenerateNote from '../../components/icons/IconGenerateNote.vue'
import ResultadoAnotacao from '../../components/ResultadoAnotacao.vue'
import iconAnotacaoInicial from '../../assets/dashboard-icons-png/anotacao-inicial.png'

const modalComponentMap = {
  AVP: ModalAVP,
  CVC: ModalCVC,
  PICC: ModalPICC,
  Permcath: ModalPermcath,
  Shilley: ModalShilley,
  SNE: ModalSNE,
  SNG: ModalSNG,
  Pulseira: ModalPulseira,
  Monitor: ModalMonitor,
  Dreno: ModalDreno,
  Curativo: ModalCurativo,
}

const {
  passo, gerado, textoGerado, erro, salvando,
  carregandoFechamentos, salvandoFechamentoModelo,
  dragIdx, dragOverIdx,
  temRascunho, restaurarRascunho, descartarRascunho,
  camposAtivos, mostrarConfigModal, salvarCamposAtivos,
  outroAtivo, outroTexto, selecionarOutro, atualizarOutro, desativarOutro,
  modalFechamentos, modalNovoFechamento,
  fechamentosModelos, fechamentoSelecionadoKey, fechamentoBusca, fechamentoBuscaModal,
  novoFechamentoTitulo, novoFechamentoTexto, novoFechamentoTituloInput,
  podeSalvarFechamentoModelo, fechamentosFavoritos, fechamentosFiltrados,
  fechamentosGerenciamentoFiltrados,
  form, modal,
  locaisCentral, tiposDisp, pulseiraOpcoes, diureseOpcoes, evacuacaoOpcoes,
  colaboracaoOpcoes, deambulacaoOpcoes, respPadraoOpcoes,
  cap,
  voltarOuSair, avancar, limparBloco, selecionarFechamentoModo,
  iniciarFechamentosModelos, abrirModalFechamentos, fecharModalFechamentos,
  abrirModalNovoFechamento, fecharModalNovoFechamento, salvarFechamentoModelo,
  deletarFechamentoModelo, alternarFechamentoFavorito, selecionarFechamentoModelo,
  onRespChange, onDiureseChange,
  abrirModal, fecharModal, confirmarDisp,
  moverDisp, removerDisp, onDragStart, onDragOver, onDrop,
  gerar, salvar, copiar, compartilhar, novaAnotacao,
  router
} = useAnotacaoInicial()


const pacientesStore = usePacientesStore()
onMounted(() => {
  pacientesStore.iniciar()
  iniciarFechamentosModelos()
})

function selecionarPaciente(p) {
  if (form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '')) {
    form.nomePaciente = ''
    form.leitoPaciente = ''
    return
  }
  form.nomePaciente = p.nome
  form.leitoPaciente = p.leito || ''
}
</script>

<style scoped>
.progress-wrap {
  position: relative;
  height: 4px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}
.progress-fill {
  height: 100%;
  background: var(--blue);
  transition: width 0.3s ease;
}
.progress-label {
  position: absolute;
  right: 12px;
  top: 6px;
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.bloco-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.bloco-nav {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  align-items: center;
}
.bloco-nav .btn-primary { flex: 1 }
.btn-limpar {
  width: auto;
  padding: 12px 16px;
  min-width: 96px;
}

/* Input genérico fora de .campo */
.campo-inline {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  padding: 13px 14px;
  outline: none;
  transition: border-color 0.2s;
  -webkit-appearance: none;
}
.campo-inline:focus { border-color: var(--blue); }

.input-suffix-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-suffix-wrap input {
  padding-right: 52px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 1rem;
  padding: 13px 52px 13px 14px;
  outline: none;
  width: 100%;
  font-family: inherit;
  -webkit-appearance: none;
}
.input-suffix-wrap input:focus { border-color: var(--blue); }
.input-suffix {
  position: absolute;
  right: 14px;
  color: var(--text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}

.label-small {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
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
  justify-content: center;
}
.btn-icon:active { background: var(--bg-hover); }

.btn-home-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 4px 8px;
  border-radius: 8px;
}
.btn-home-logo:active { background: var(--bg-hover); }

.drag-over {
  border-color: var(--blue) !important;
  background: rgba(41,98,255,0.08) !important;
}

.pulseira-label {
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  gap: 20px;
  transition: border-color 0.15s, background-color 0.15s;
}

/* Dispositivos */
.disp-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.disp-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-size: 0.88rem;
  color: var(--text-dim);
}
.disp-texto { flex: 1; line-height: 1.4 }
.disp-acoes { display: flex; gap: 4px; flex-shrink: 0 }
.btn-icon-sm {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 0.7rem;
  line-height: 1;
  transition: all 0.15s;
}
.btn-icon-sm:disabled { opacity: 0.3; cursor: default }
.btn-icon-sm:not(:disabled):active { background: var(--bg-hover) }
.btn-danger-sm:not(:disabled):active { color: var(--danger); border-color: var(--danger) }

.disp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.btn-disp {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-size: 0.82rem;
  font-family: inherit;
  padding: 10px 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.btn-disp:active {
  background: var(--bg-hover);
  border-color: var(--blue);
  color: var(--text);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: flex-end;
  z-index: 200;
}
.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 85dvh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 { font-size: 1.05rem; font-weight: 700; color: var(--text); }
.modal-body { overflow-y: auto; padding: 16px 20px; flex: 1 }
.modal-footer {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 10px;
  border-top: 1px solid var(--border);
}

/* Preview */
.preview-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  width: 100%; box-sizing: border-box;
  font-size: 0.95rem; line-height: 1.7; color: var(--text);
  font-family: inherit; white-space: pre-wrap;
  resize: vertical; outline: none;
}
/* ── Rascunho banner ── */
/* rascunho-banner global — ver style.css */
/* .btn-sm global — ver style.css */

/* Toast global — ver App.vue + style.css */

/* Chips para seletor de paciente */
.chips-scroll {
  display: flex; gap: 6px;
  overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;
}
.chips-scroll::-webkit-scrollbar { display: none; }
.chip {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: 20px; color: var(--text-muted);
  font-size: 0.83rem; font-family: inherit;
  padding: 7px 13px; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; transition: all 0.15s;
}
.chip.ativo { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 600; }

.inicial-screen {
  background:
    radial-gradient(circle at top right, var(--blue-faint), transparent 28%),
    var(--bg);
  min-height: 100vh;
}

.inicial-header {
  border-bottom: 1px solid rgba(86, 154, 178, 0.24);
  background: rgba(7, 18, 34, 0.82);
  backdrop-filter: blur(16px);
}

.inicial-page {
  padding-top: 20px;
  padding-bottom: 40px;
}

.inicial-progress {
  background: rgba(45, 84, 100, 0.55);
}

.inicial-progress .progress-fill {
  background: linear-gradient(90deg, #45d4d6, #5c98ff);
  box-shadow: 0 0 12px rgba(69, 212, 214, 0.22);
}

.paciente-atalho {
  padding: 14px 16px;
  margin-bottom: 14px;
  border-radius: 18px;
  border: 1px solid rgba(73, 128, 154, 0.52);
  background: linear-gradient(180deg, rgba(17, 38, 62, 0.92), rgba(12, 27, 47, 0.96));
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
  gap: 8px;
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
  background: radial-gradient(circle at top, rgba(95, 232, 232, 0.28), rgba(42, 128, 178, 0.38));
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
  font-size: 1.72rem;
  line-height: 1.04;
  font-weight: 850;
}

.module-hero-copy p {
  margin: 8px 0 0;
  color: #a6c4d8;
  font-size: 0.95rem;
  line-height: 1.35;
}

.inicial-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(55, 95, 133, 0.55);
  background: linear-gradient(180deg, rgba(18, 38, 64, 0.97), rgba(13, 29, 52, 0.98));
  box-shadow: 0 16px 32px rgba(3, 10, 22, 0.22);
}

.bloco-titulo {
  color: #f3f7ff;
  border-bottom-color: rgba(77, 130, 160, 0.5);
  font-size: 1.22rem;
}

.campo-inline,
.input-suffix-wrap input,
input,
textarea {
  border-color: rgba(76, 116, 150, 0.58);
  background: rgba(11, 25, 46, 0.92);
}

.campo-inline:focus,
.input-suffix-wrap input:focus,
input:focus,
textarea:focus {
  border-color: rgba(92, 215, 226, 0.78);
  box-shadow: 0 0 0 3px rgba(69, 212, 214, 0.12);
}

.radio-btn,
.checkbox-label {
  border-color: rgba(76, 116, 150, 0.58);
  background: rgba(15, 32, 57, 0.82);
  border-radius: 16px;
}

.radio-btn:has(input:checked),
.checkbox-label.checked,
.checkbox-label:has(input:checked) {
  border-color: rgba(92, 215, 226, 0.78);
  background: rgba(38, 142, 179, 0.18);
  box-shadow: 0 7px 15px rgba(35, 150, 200, 0.12);
}

.chip {
  min-height: 42px;
  border-radius: 14px;
  border-color: rgba(76, 116, 150, 0.58);
  background: rgba(15, 32, 57, 0.9);
  color: #c2d8ea;
}

.chip-on,
.chip.ativo {
  border-color: rgba(92, 215, 226, 0.86);
  background: linear-gradient(180deg, #23aeca, #1d72c8);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 7px 15px rgba(35, 150, 200, 0.15);
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

.disp-item {
  border-color: rgba(76, 116, 150, 0.58);
  background: rgba(15, 32, 57, 0.86);
  border-radius: 16px;
}

.disp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(77, 130, 160, 0.5);
}

.disp-head .bloco-titulo {
  margin-bottom: 6px;
  padding-bottom: 0;
  border-bottom: 0;
}

.disp-head p {
  margin: 0;
  color: #9eb9cf;
  font-size: 0.92rem;
  line-height: 1.35;
}

.disp-count {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #eaf8ff;
  font-size: 0.95rem;
  font-weight: 850;
  border: 1px solid rgba(92, 215, 226, 0.68);
  background: rgba(38, 142, 179, 0.22);
}

.disp-empty {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px dashed rgba(92, 153, 186, 0.52);
  background: rgba(11, 25, 46, 0.62);
}

.disp-empty strong {
  color: #eaf3ff;
  font-size: 0.94rem;
}

.disp-empty span {
  color: #9eb9cf;
  font-size: 0.86rem;
}

.disp-lista {
  gap: 10px;
  margin-bottom: 18px;
}

.disp-texto {
  color: #eaf3ff;
  font-weight: 650;
}

.disp-acoes {
  gap: 6px;
}

.btn-icon-sm {
  min-width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 10px;
  border-color: rgba(76, 116, 150, 0.58);
  background: rgba(10, 24, 43, 0.72);
  color: #b8d0e4;
  font-size: 0.9rem;
}

.btn-icon-sm:not(:disabled):active {
  border-color: rgba(92, 215, 226, 0.72);
  background: rgba(38, 142, 179, 0.18);
  color: #f5fbff;
}

.btn-danger-sm:not(:disabled):active {
  color: #ffb4bd;
  border-color: rgba(255, 126, 145, 0.72);
  background: rgba(255, 126, 145, 0.12);
}

.btn-disp {
  min-height: 48px;
  border-radius: 14px;
  border-color: rgba(76, 116, 150, 0.58);
  background: linear-gradient(180deg, rgba(17, 37, 63, 0.92), rgba(11, 26, 49, 0.96));
  color: #c2d8ea;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.btn-disp span {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(69, 212, 214, 0.16);
  color: #8be9f0;
  font-size: 1rem;
  line-height: 1;
}

.btn-disp:active {
  background: rgba(38, 142, 179, 0.18);
  border-color: rgba(92, 215, 226, 0.78);
}

.modal-overlay {
  background: rgba(1, 8, 18, 0.72);
  backdrop-filter: blur(6px);
  padding-top: env(safe-area-inset-top, 0px);
}

.modal-box {
  border-color: rgba(78, 137, 168, 0.54);
  background: linear-gradient(180deg, rgba(17, 37, 62, 0.98), rgba(10, 24, 43, 0.99));
  max-height: min(78dvh, 680px);
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  box-shadow: 0 -18px 42px rgba(1, 6, 16, 0.34);
}

.modal-header {
  padding: 18px 20px 14px;
}

.modal-header h3 {
  margin: 0;
  color: #f5f8ff;
  font-size: 1.2rem;
  font-weight: 850;
}

.modal-header p {
  margin: 4px 0 0;
  color: #9eb9cf;
  font-size: 0.84rem;
  font-weight: 650;
}

.modal-body {
  padding: 18px 20px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(105, 158, 190, 0.7) transparent;
}

.modal-header,
.modal-footer {
  border-color: rgba(76, 116, 150, 0.42);
}

.modal-footer {
  padding: 12px 16px calc(14px + env(safe-area-inset-bottom, 0px));
  background: rgba(9, 21, 38, 0.92);
  box-shadow: 0 -10px 24px rgba(2, 8, 18, 0.2);
}

.modal-cancel {
  flex: 0 0 36%;
  min-height: 52px;
  border-radius: 16px;
}

.modal-add {
  flex: 1;
  min-height: 52px;
  border-radius: 16px;
  box-shadow: 0 9px 18px rgba(25, 126, 201, 0.16);
}

.modal-body :deep(.campo) {
  margin-bottom: 20px;
}

.modal-body :deep(.campo:last-child) {
  margin-bottom: 0;
}

.modal-body :deep(.campo > label:not(.checkbox-label)) {
  color: #a9c2d7;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.05em;
}

.modal-body :deep(.radio-group) {
  gap: 10px;
}

.modal-body :deep(.radio-btn),
.modal-body :deep(.checkbox-label) {
  min-height: 48px;
  border-radius: 14px;
  border-color: rgba(76, 116, 150, 0.58);
  background: rgba(15, 32, 57, 0.86);
}

.modal-body :deep(.radio-btn span),
.modal-body :deep(.checkbox-label span) {
  font-weight: 800;
  color: #bcd3e7;
}

.modal-body :deep(.radio-btn:has(input:checked)),
.modal-body :deep(.checkbox-label.checked),
.modal-body :deep(.checkbox-label:has(input:checked)) {
  border-color: rgba(92, 215, 226, 0.82);
  background: linear-gradient(180deg, rgba(35, 174, 202, 0.34), rgba(29, 114, 200, 0.24));
  box-shadow: 0 7px 15px rgba(35, 150, 200, 0.14);
}

.modal-body :deep(.radio-btn:has(input:checked) span),
.modal-body :deep(.checkbox-label.checked span),
.modal-body :deep(.checkbox-label:has(input:checked) span) {
  color: #ffffff;
}

.estado-section {
  padding: 14px;
  margin-bottom: 14px;
  border-radius: 18px;
  border: 1px solid rgba(76, 116, 150, 0.44);
  background: rgba(11, 25, 46, 0.48);
}

.estado-section:last-of-type {
  margin-bottom: 0;
}

.estado-section > label:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  color: #d9ecfb;
  font-size: 0.86rem;
  font-weight: 850;
  letter-spacing: 0.05em;
}

.estado-section-compact {
  padding: 12px 14px;
}

.estado-section-compact .checkbox-label,
.estado-section-compact .radio-btn {
  min-height: 46px;
}

.estado-section-resp {
  margin-bottom: 0;
}

.estado-section-resp + .estado-section-resp-main {
  margin-top: 10px;
  border-top-color: rgba(92, 215, 226, 0.34);
  background: rgba(15, 32, 57, 0.62);
}

.estado-options {
  gap: 8px;
}

.estado-options-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.estado-options-inline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 112px));
}

.estado-options .radio-btn,
.estado-section .checkbox-label {
  min-height: 46px;
  border-radius: 14px;
}

.estado-section .campo-inline,
.estado-section .input-suffix-wrap {
  margin-top: 10px;
}

.fechamento-modos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(76, 116, 150, 0.44);
  background: rgba(11, 25, 46, 0.48);
}

.fechamento-modos .chip {
  flex: 1 1 150px;
  justify-content: center;
  text-align: center;
}

.fechamento-texto {
  margin-bottom: 0;
}

.fechamento-vazio {
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed rgba(92, 153, 186, 0.52);
  background: rgba(11, 25, 46, 0.62);
  color: #9eb9cf;
  font-size: 0.92rem;
  line-height: 1.35;
}

.fechamento-modelos-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(76, 116, 150, 0.42);
}

.fechamento-modelos-head p {
  margin: 5px 0 0;
  color: #9eb9cf;
  font-size: 0.86rem;
  line-height: 1.35;
}

.modelos-acoes {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-gerenciar,
.btn-novo-modelo-topo {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(76, 116, 150, 0.58);
  background: rgba(15, 32, 57, 0.88);
  color: #c2d8ea;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 800;
}

.btn-novo-modelo-topo {
  border-color: rgba(92, 215, 226, 0.58);
  color: #eaf8ff;
}

.fechamento-library {
  margin-top: 12px;
}

.modelos-library {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modelo-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(76, 116, 150, 0.58);
  background: rgba(11, 25, 46, 0.78);
  color: #8ecbd4;
}

.modelo-search-wrap input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #eef8ff;
  font-family: inherit;
  font-size: 0.96rem;
}

.modelo-search-wrap input::placeholder {
  color: #7899ad;
}

.modelos-favoritos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modelos-subtitle {
  color: #a6c4d8;
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.modelos-fav-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.modelos-fav-row::-webkit-scrollbar {
  display: none;
}

.modelo-fav-chip {
  flex: 0 0 auto;
  max-width: 180px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(89, 153, 190, 0.5);
  background: rgba(15, 32, 57, 0.88);
  color: #d7efff;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modelo-fav-chip-on {
  background: linear-gradient(180deg, rgba(35, 174, 202, 0.34), rgba(29, 114, 200, 0.24));
  border-color: rgba(92, 215, 226, 0.84);
  color: #fff;
}

.modelos-lista {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 230px;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(92, 215, 226, 0.45) transparent;
}

.modelo-list-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  align-items: stretch;
  min-height: 48px;
  border-radius: 15px;
  border: 1px solid rgba(76, 116, 150, 0.48);
  background: linear-gradient(180deg, rgba(17, 37, 63, 0.9), rgba(11, 26, 49, 0.94));
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(3, 10, 22, 0.12);
}

.modelo-list-item-on {
  border-color: rgba(92, 215, 226, 0.78);
  box-shadow: 0 7px 16px rgba(35, 150, 200, 0.15);
}

.modelo-main-btn {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
}

.modelo-title {
  color: #f2f9ff;
  font-size: 0.96rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modelo-fav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-left: 1px solid rgba(76, 116, 150, 0.42);
  background: rgba(10, 22, 40, 0.34);
  color: #526f83;
  font-family: inherit;
}

.modelo-fav-btn-on {
  color: #f6c85f;
  background: rgba(246, 200, 95, 0.1);
}

.modelos-vazio-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9eb9cf;
  min-height: 40px;
  padding: 0 2px;
  font-size: 0.9rem;
}

.fechamento-empty-modelos {
  margin-top: 8px;
}

.btn-link {
  border: 0;
  background: transparent;
  color: #75d9e8;
  font-family: inherit;
  font-weight: 800;
  padding: 0;
}

.modal-fechamentos {
  border-color: rgba(78, 137, 168, 0.54);
}

.modal-search-wrap {
  margin-bottom: 12px;
  min-height: 44px;
}

.modal-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-modelo-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(76, 116, 150, 0.44);
  background: rgba(10, 22, 40, 0.58);
}

.modal-modelo-txt {
  color: #dcefff;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-fav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(76, 116, 150, 0.44);
  border-radius: 12px;
  flex-shrink: 0;
}

.btn-del-modal {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 126, 145, 0.24);
  border-radius: 12px;
  background: rgba(255, 126, 145, 0.08);
  color: #ffb4bd;
  font-family: inherit;
  font-size: 1.2rem;
  line-height: 1;
}

.modal-vazio {
  margin: 0;
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed rgba(92, 153, 186, 0.52);
  color: #9eb9cf;
  background: rgba(11, 25, 46, 0.62);
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
    font-size: 1.42rem;
  }
}

.inicial-header {
  border-bottom-color: rgba(71, 119, 194, 0.18);
}

.inicial-progress {
  background: rgba(50, 76, 118, 0.5);
}

.inicial-progress .progress-fill {
  background: linear-gradient(90deg, #2f8cff, #51b5ff);
  box-shadow: 0 0 14px rgba(57, 143, 255, 0.28);
}

.paciente-atalho,
.inicial-card {
  border-color: rgba(76, 121, 190, 0.36);
}

.module-hero {
  border-color: var(--border);
  background: var(--bg-card);
}

.module-hero-icon {
  background: radial-gradient(circle at top, rgba(84, 157, 255, 0.36), rgba(31, 88, 174, 0.48));
}

.inicial-card input:focus,
.inicial-card textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-faint);
}

.radio-btn.active,
.segmented-option.active,
.chip-on,
.chip.ativo {
  border-color: rgba(94, 166, 255, 0.9);
  background: linear-gradient(135deg, #236fe1, #2d9cff);
  box-shadow: 0 7px 16px rgba(32, 116, 225, 0.16);
}

.estado-card-on,
.disp-item-on,
.modelo-list-item-on {
  border-color: rgba(94, 166, 255, 0.78);
  background: rgba(42, 118, 224, 0.18);
  box-shadow: 0 7px 16px rgba(32, 116, 225, 0.14);
}

.btn-novo-modelo-topo,
.modelo-fav-chip-on {
  border-color: rgba(94, 166, 255, 0.76);
}

.modelo-fav-chip-on {
  background: linear-gradient(180deg, rgba(45, 156, 255, 0.32), rgba(35, 111, 225, 0.24));
}

.modelo-search-wrap {
  color: #9fc5ff;
}

.modelos-lista {
  scrollbar-color: rgba(94, 166, 255, 0.45) transparent;
}

.btn-link {
  color: #8dbdff;
}
</style>
