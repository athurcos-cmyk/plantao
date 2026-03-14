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
      <div class="progress-fill" :style="{ width: (passo * 20) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 5</span>
    </div>

    <main class="container" style="padding-top:20px; padding-bottom:40px">

      <!-- ═══ BLOCO 1 — Identificação ═══ -->
      <div v-if="!gerado && passo === 1">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input type="time" v-model="form.horario">
        </div>

        <div class="campo">
          <label>Sexo <span class="obrigatorio">*</span></label>
          <div class="radio-group">
            <label class="radio-btn">
              <input type="radio" v-model="form.sexo" value="F">
              <span>Feminino</span>
            </label>
            <label class="radio-btn">
              <input type="radio" v-model="form.sexo" value="M">
              <span>Masculino</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Posição da cama <span class="obrigatorio">*</span></label>
          <div class="radio-group">
            <label class="radio-btn" v-for="op in ['baixa','média','alta']" :key="op">
              <input type="radio" v-model="form.posicaoCama" :value="op">
              <span>{{ cap(op) }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Rodas <span class="obrigatorio">*</span></label>
          <div class="radio-group">
            <label class="radio-btn" v-for="op in ['travadas','soltas']" :key="op">
              <input type="radio" v-model="form.rodas" :value="op">
              <span>{{ cap(op) }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Grades <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in ['totalmente elevadas','parcialmente elevadas','abaixadas']" :key="op">
              <input type="radio" v-model="form.grades" :value="op">
              <span>{{ cap(op) }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Decúbito <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in ['parcialmente elevado','dorsal','lateral direito','lateral esquerdo','Fowler']" :key="op">
              <input type="radio" v-model="form.decubito" :value="op">
              <span>{{ cap(op) }}</span>
            </label>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 20px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Estado Geral ═══ -->
      <div v-if="!gerado && passo === 2">
        <h2 class="bloco-titulo">Estado Geral</h2>

        <div class="campo">
          <label>Estado mental</label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.mentalAlterado">
            <span>Estado mental alterado</span>
          </label>
          <div v-if="form.mentalAlterado" style="margin-top:8px">
            <input class="campo-inline" type="text" v-model="form.mentalDesc" placeholder="Ex: desorientada, agitada, confusa">
          </div>
        </div>

        <div class="campo">
          <label>Colaboração <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in colaboracaoOpcoes" :key="op.value">
              <input type="radio" v-model="form.colaboracao" :value="op.value">
              <span>{{ op.label }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Deambulação <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in deambulacaoOpcoes" :key="op.value">
              <input type="radio" v-model="form.deambulacao" :value="op.value">
              <span>{{ op.label }}</span>
            </label>
          </div>
          <div v-if="form.deambulacao === 'deambula com auxílio'" style="margin-top:8px">
            <input class="campo-inline" type="text" v-model="form.deambulaAuxilio" placeholder="Ex: bengala, andador, cadeira de rodas">
          </div>
        </div>

        <div class="campo" v-if="form.respiracao !== 'ventilação mecânica'">
          <label>Padrão respiratório</label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in respPadraoOpcoes" :key="op.value">
              <input type="radio" v-model="form.respPadrao" :value="op.value">
              <span>{{ op.label }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Respiração <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in ['em ar ambiente','cateter nasal de O₂','máscara de O₂','ventilação mecânica']" :key="op">
              <input type="radio" v-model="form.respiracao" :value="op" @change="onRespChange">
              <span>{{ cap(op) }}</span>
            </label>
          </div>
          <div v-if="form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂'" style="margin-top:8px">
            <div class="input-suffix-wrap">
              <input type="number" v-model="form.oxigenioLitros" placeholder="2" min="1">
              <span class="input-suffix">L/min</span>
            </div>
          </div>
        </div>

        <div class="campo">
          <label>Acompanhante <span class="obrigatorio">*</span></label>
          <div class="radio-group">
            <label class="radio-btn">
              <input type="radio" v-model="form.acompanhante" value="nao">
              <span>Não</span>
            </label>
            <label class="radio-btn">
              <input type="radio" v-model="form.acompanhante" value="sim">
              <span>Sim</span>
            </label>
          </div>
          <div v-if="form.acompanhante === 'sim'" style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
            <input class="campo-inline" type="text" v-model="form.acompanhanteNome" placeholder="Nome do acompanhante">
            <input class="campo-inline" type="text" v-model="form.acompanhanteParentesco" placeholder="Parentesco (ex: esposa, filho, mãe)">
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 3 — Dispositivos ═══ -->
      <div v-if="!gerado && passo === 3">
        <h2 class="bloco-titulo">Dispositivos</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px">Adicione os dispositivos em uso</p>

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
              <button class="btn-icon-sm" @click="moverDisp(i, -1)" :disabled="i === 0" title="Mover para cima">▲</button>
              <button class="btn-icon-sm" @click="moverDisp(i, 1)" :disabled="i === form.dispositivos.length - 1" title="Mover para baixo">▼</button>
              <button class="btn-icon-sm btn-danger-sm" @click="removerDisp(i)" title="Remover">✕</button>
            </div>
          </div>
        </div>
        <p v-else style="color:var(--text-muted);margin-bottom:16px;font-size:0.9rem">Nenhum dispositivo adicionado</p>

        <div class="disp-grid">
          <button class="btn-disp" v-for="tipo in tiposDisp" :key="tipo" @click="abrirModal(tipo)">
            + {{ tipo }}
          </button>
        </div>

        <div class="bloco-nav" style="margin-top:24px">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 2">← Voltar</button>
          <button class="btn btn-primary" @click="passo = 4">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 4 — Eliminações ═══ -->
      <div v-if="!gerado && passo === 4">
        <h2 class="bloco-titulo">Eliminações</h2>

        <div class="campo">
          <label>Última evacuação <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in evacuacaoOpcoes" :key="op.v">
              <input type="radio" v-model="form.evacuacaoOpcao" :value="op.v">
              <span>{{ op.l }}</span>
            </label>
          </div>
          <div v-if="form.evacuacaoOpcao === 'data'" style="margin-top:10px">
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px">Clique para selecionar a data da evacuação</p>
            <input type="date" v-model="form.evacuacaoData" class="campo-inline">
          </div>
        </div>

        <div class="campo">
          <label>Diurese <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="checkbox-label" v-for="op in diureseOpcoes" :key="op.v">
              <input type="checkbox" :value="op.v" v-model="form.diurese" @change="onDiureseChange">
              <span>{{ op.l }}</span>
            </label>
          </div>
          <div v-if="form.diurese.includes('SVD')" style="margin-top:10px">
            <label style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;font-weight:600;margin-bottom:6px;display:block">Débito da SVD</label>
            <div class="input-suffix-wrap">
              <input type="number" v-model="form.svdDebito" placeholder="500" min="0">
              <span class="input-suffix">ml</span>
            </div>
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
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 3">← Voltar</button>
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 5 — Fechamento ═══ -->
      <div v-if="!gerado && passo === 5">
        <h2 class="bloco-titulo">Fechamento</h2>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:14px">Revise e edite o texto de fechamento se necessário</p>

        <div class="campo">
          <textarea v-model="form.fechamento" rows="5"></textarea>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 4">← Voltar</button>
          <button class="btn btn-primary" @click="gerar">Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ PREVIEW ═══ -->
      <div v-if="gerado">
        <div class="preview-box">
          <p style="white-space:pre-wrap;line-height:1.7;font-size:0.95rem">{{ textoGerado }}</p>
        </div>

        <!-- Nome e leito do paciente -->
        <div style="display:flex;gap:10px;margin-top:16px">
          <div style="flex:2">
            <label class="label-small">Nome do paciente</label>
            <input class="campo-inline" type="text" v-model="form.nomePaciente" placeholder="Maria da Silva">
          </div>
          <div style="flex:1">
            <label class="label-small">Leito</label>
            <input class="campo-inline" type="text" v-model="form.leitoPaciente" placeholder="4B">
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
          <button class="btn btn-primary" @click="copiar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copiar texto
          </button>
          <button class="btn btn-secondary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
          </button>
          <button class="btn btn-secondary" @click="compartilhar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Compartilhar
          </button>
          <button class="btn btn-secondary" @click="novaAnotacao">Nova anotação</button>
          <button class="btn btn-secondary" @click="passo = 5; gerado = false">← Editar</button>
        </div>

        <div v-if="feedbackMsg" class="feedback-msg">{{ feedbackMsg }}</div>
      </div>

    </main>

    <!-- ═══ MODAL — Dispositivos ═══ -->
    <div v-if="modal.aberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ modal.tipo }}</h3>
          <button class="btn-icon" @click="fecharModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">

          <!-- AVP -->
          <template v-if="modal.tipo === 'AVP'">
            <div class="campo">
              <label>Local <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in ['MSE','MSD','MIE','MID','jugular D','jugular E']" :key="op">
                  <input type="radio" v-model="modal.d.local" :value="op"><span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Status</label>
              <div class="radio-group vertical">
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.salinizado"><span>Salinizado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.ocluido"><span>Ocluído</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.datado"><span>Datado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.emInfusao"><span>Em infusão</span></label>
              </div>
            </div>
            <div v-if="modal.d.datado" class="campo">
              <label>Data do curativo</label>
              <input type="date" v-model="modal.d.data">
            </div>
            <div v-if="modal.d.emInfusao">
              <div class="campo">
                <label>Solução <span class="obrigatorio">*</span></label>
                <input type="text" v-model="modal.d.solucao" placeholder="Ex: tiamina 100mg + SF0,9% 100ml EV">
              </div>
              <div class="campo">
                <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
                <div class="input-suffix-wrap">
                  <input type="number" v-model="modal.d.velocidade" placeholder="21" min="1">
                  <span class="input-suffix">ml/h</span>
                </div>
              </div>
              <div class="campo">
                <label class="checkbox-label" style="margin-bottom:0">
                  <input type="checkbox" v-model="modal.d.bic">
                  <span>Bomba de infusão (BIC)</span>
                </label>
              </div>
            </div>
          </template>

          <!-- CVC -->
          <template v-else-if="modal.tipo === 'CVC'">
            <div class="campo">
              <label>Local <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in locaisCentral" :key="op">
                  <input type="radio" v-model="modal.d.local" :value="op"><span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Lúmens <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['mono','duplo','triplo']" :key="op">
                  <input type="radio" v-model="modal.d.lumens" :value="op"><span>{{ cap(op) }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Status</label>
              <div class="radio-group vertical">
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.salinizado"><span>Salinizado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.ocluido"><span>Ocluído</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.datado"><span>Datado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.emInfusao"><span>Em infusão</span></label>
              </div>
            </div>
            <div v-if="modal.d.datado" class="campo">
              <label>Data do curativo</label>
              <input type="date" v-model="modal.d.data">
            </div>
            <div v-if="modal.d.emInfusao">
              <div class="campo">
                <label>Solução <span class="obrigatorio">*</span></label>
                <input type="text" v-model="modal.d.solucao" placeholder="Ex: SF0,9% 500ml">
              </div>
              <div class="campo">
                <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
                <div class="input-suffix-wrap">
                  <input type="number" v-model="modal.d.velocidade" placeholder="21" min="1">
                  <span class="input-suffix">ml/h</span>
                </div>
              </div>
              <div class="campo">
                <label class="checkbox-label" style="margin-bottom:0">
                  <input type="checkbox" v-model="modal.d.bic">
                  <span>Bomba de infusão (BIC)</span>
                </label>
              </div>
            </div>
          </template>

          <!-- PICC -->
          <template v-else-if="modal.tipo === 'PICC'">
            <div class="campo">
              <label>Membro <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['MSD','MSE']" :key="op">
                  <input type="radio" v-model="modal.d.membro" :value="op"><span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Lúmens <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['mono','duplo']" :key="op">
                  <input type="radio" v-model="modal.d.lumens" :value="op"><span>{{ cap(op) }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Status</label>
              <div class="radio-group vertical">
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.salinizado"><span>Salinizado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.ocluido"><span>Ocluído</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.datado"><span>Datado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.emInfusao"><span>Em infusão</span></label>
              </div>
            </div>
            <div v-if="modal.d.datado" class="campo">
              <label>Data do curativo</label>
              <input type="date" v-model="modal.d.data">
            </div>
            <div v-if="modal.d.emInfusao">
              <div class="campo">
                <label>Solução <span class="obrigatorio">*</span></label>
                <input type="text" v-model="modal.d.solucao" placeholder="Ex: SF0,9% 500ml">
              </div>
              <div class="campo">
                <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
                <div class="input-suffix-wrap">
                  <input type="number" v-model="modal.d.velocidade" placeholder="21" min="1">
                  <span class="input-suffix">ml/h</span>
                </div>
              </div>
              <div class="campo">
                <label class="checkbox-label" style="margin-bottom:0">
                  <input type="checkbox" v-model="modal.d.bic">
                  <span>Bomba de infusão (BIC)</span>
                </label>
              </div>
            </div>
          </template>

          <!-- Permcath -->
          <template v-else-if="modal.tipo === 'Permcath'">
            <div class="campo">
              <label>Local <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in locaisCentral" :key="op">
                  <input type="radio" v-model="modal.d.local" :value="op"><span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Status</label>
              <div class="radio-group vertical">
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.salinizado"><span>Salinizado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.ocluido"><span>Ocluído</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.datado"><span>Datado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.emInfusao"><span>Em infusão</span></label>
              </div>
            </div>
            <div v-if="modal.d.datado" class="campo">
              <label>Data do curativo</label>
              <input type="date" v-model="modal.d.data">
            </div>
            <div v-if="modal.d.emInfusao">
              <div class="campo">
                <label>Solução <span class="obrigatorio">*</span></label>
                <input type="text" v-model="modal.d.solucao" placeholder="Ex: SF0,9% 500ml">
              </div>
              <div class="campo">
                <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
                <div class="input-suffix-wrap">
                  <input type="number" v-model="modal.d.velocidade" placeholder="21" min="1">
                  <span class="input-suffix">ml/h</span>
                </div>
              </div>
              <div class="campo">
                <label class="checkbox-label" style="margin-bottom:0">
                  <input type="checkbox" v-model="modal.d.bic">
                  <span>Bomba de infusão (BIC)</span>
                </label>
              </div>
            </div>
          </template>

          <!-- Shilley -->
          <template v-else-if="modal.tipo === 'Shilley'">
            <div class="campo">
              <label>Local <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in ['femoral D','femoral E','jugular D','jugular E']" :key="op">
                  <input type="radio" v-model="modal.d.local" :value="op"><span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Status</label>
              <div class="radio-group vertical">
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.salinizado"><span>Salinizado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.ocluido"><span>Ocluído</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.datado"><span>Datado</span></label>
                <label class="checkbox-label"><input type="checkbox" v-model="modal.d.emInfusao"><span>Em infusão</span></label>
              </div>
            </div>
            <div v-if="modal.d.datado" class="campo">
              <label>Data do curativo</label>
              <input type="date" v-model="modal.d.data">
            </div>
            <div v-if="modal.d.emInfusao">
              <div class="campo">
                <label>Solução <span class="obrigatorio">*</span></label>
                <input type="text" v-model="modal.d.solucao" placeholder="Ex: SF0,9% 500ml">
              </div>
              <div class="campo">
                <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
                <div class="input-suffix-wrap">
                  <input type="number" v-model="modal.d.velocidade" placeholder="21" min="1">
                  <span class="input-suffix">ml/h</span>
                </div>
              </div>
              <div class="campo">
                <label class="checkbox-label" style="margin-bottom:0">
                  <input type="checkbox" v-model="modal.d.bic">
                  <span>Bomba de infusão (BIC)</span>
                </label>
              </div>
            </div>
          </template>

          <!-- SNE -->
          <template v-else-if="modal.tipo === 'SNE'">
            <div class="campo">
              <label>Narina <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in [{ v:'D', l:'Direita' },{ v:'E', l:'Esquerda' }]" :key="op.v">
                  <input type="radio" v-model="modal.d.narina" :value="op.v"><span>{{ op.l }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Marcação (cm) <span class="obrigatorio">*</span></label>
              <input type="number" v-model="modal.d.marcacao" placeholder="65" min="1">
            </div>
            <div class="campo">
              <label>Status <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['aberta','fechada']" :key="op">
                  <input type="radio" v-model="modal.d.status" :value="op"><span>{{ cap(op) }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Dieta enteral <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['sim','não']" :key="op">
                  <input type="radio" v-model="modal.d.dieta" :value="op"><span>{{ cap(op) }}</span>
                </label>
              </div>
            </div>
            <div v-if="modal.d.dieta === 'sim'" class="campo">
              <label>Velocidade da dieta <span class="obrigatorio">*</span></label>
              <div class="input-suffix-wrap">
                <input type="number" v-model="modal.d.velocidadeDieta" placeholder="60" min="1">
                <span class="input-suffix">ml/h</span>
              </div>
            </div>
          </template>

          <!-- SNG -->
          <template v-else-if="modal.tipo === 'SNG'">
            <div class="campo">
              <label>Narina <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in [{ v:'D', l:'Direita' },{ v:'E', l:'Esquerda' }]" :key="op.v">
                  <input type="radio" v-model="modal.d.narina" :value="op.v"><span>{{ op.l }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Marcação (cm) <span class="obrigatorio">*</span></label>
              <input type="number" v-model="modal.d.marcacao" placeholder="65" min="1">
            </div>
            <div class="campo">
              <label>Modo <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in [{ v:'aberta', l:'Aberta' },{ v:'fechada', l:'Fechada' },{ v:'dieta', l:'Recebendo dieta enteral' },{ v:'dren', l:'Em drenagem (frasco coletor)' }]" :key="op.v">
                  <input type="radio" v-model="modal.d.modo" :value="op.v"><span>{{ op.l }}</span>
                </label>
              </div>
            </div>
            <div v-if="modal.d.modo === 'dieta'" class="campo">
              <label>Velocidade da dieta <span class="obrigatorio">*</span></label>
              <div class="input-suffix-wrap">
                <input type="number" v-model="modal.d.velocidadeDieta" placeholder="60" min="1">
                <span class="input-suffix">ml/h</span>
              </div>
            </div>
            <div v-if="modal.d.modo === 'dren'">
              <div class="campo">
                <label>Débito <span class="obrigatorio">*</span></label>
                <div class="radio-group">
                  <label class="radio-btn" v-for="op in [{ v:'sem', l:'Sem débito' },{ v:'com', l:'Com débito' }]" :key="op.v">
                    <input type="radio" v-model="modal.d.debito" :value="op.v"><span>{{ op.l }}</span>
                  </label>
                </div>
                <div v-if="modal.d.debito === 'com'" style="margin-top:8px">
                  <div class="input-suffix-wrap">
                    <input type="number" v-model="modal.d.debitoVal" placeholder="200" min="1">
                    <span class="input-suffix">ml</span>
                  </div>
                </div>
              </div>
              <div v-if="modal.d.debito === 'com'" class="campo">
                <label>Aspecto</label>
                <input type="text" v-model="modal.d.aspecto" placeholder="Ex: amarelado, bilioso, esverdeado">
              </div>
            </div>
          </template>

          <!-- Pulseira -->
          <template v-else-if="modal.tipo === 'Pulseira'">
            <div class="campo">
              <label>Membro <span class="obrigatorio">*</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['MSE','MSD','MIE','MID']" :key="op">
                  <input type="radio" v-model="modal.d.membro" :value="op"><span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Tipos <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label
                  class="checkbox-label pulseira-label"
                  v-for="op in pulseiraOpcoes" :key="op.v"
                  :style="modal.d.tipos.includes(op.v) ? { borderColor: op.cor, backgroundColor: op.cor + '20', color: op.corTexto || '#fff' } : {}"
                >
                  <input type="checkbox" :value="op.v" v-model="modal.d.tipos">
                  <span>{{ cap(op.v) }}</span>
                </label>
              </div>
            </div>
          </template>

          <!-- Monitor -->
          <template v-else-if="modal.tipo === 'Monitor'">
            <div class="campo">
              <label>Tipo <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in ['monitor multiparamétrico','oxímetro de pulso','monitor cardíaco']" :key="op">
                  <input type="radio" v-model="modal.d.tipoMonitor" :value="op"><span>{{ cap(op) }}</span>
                </label>
              </div>
            </div>
          </template>

          <!-- Dreno -->
          <template v-else-if="modal.tipo === 'Dreno'">
            <div class="campo">
              <label>Tipo do dreno <span class="obrigatorio">*</span></label>
              <input type="text" v-model="modal.d.drenoTipo" placeholder="Ex: tórax, abdominal, penrose, blake">
            </div>
            <div class="campo">
              <label>Localização <span class="obrigatorio">*</span></label>
              <input type="text" v-model="modal.d.drenoLocal" placeholder="Ex: flanco direito, hipocôndrio esquerdo">
            </div>
            <div class="campo">
              <label>Débito drenado</label>
              <div class="input-suffix-wrap">
                <input type="number" v-model="modal.d.drenoDebito" placeholder="350" min="0">
                <span class="input-suffix">ml</span>
              </div>
            </div>
            <div class="campo">
              <label>Aspecto / coloração</label>
              <input type="text" v-model="modal.d.drenoAspecto" placeholder="Ex: sanguinolento, seroso, bilioso">
            </div>
            <div class="campo">
              <label class="checkbox-label" style="margin-bottom:0">
                <input type="checkbox" v-model="modal.d.seloAgua">
                <span>Possui selo d'água</span>
              </label>
              <div v-if="modal.d.seloAgua" style="margin-top:8px">
                <label class="label-small">Débito no selo d'água</label>
                <div class="input-suffix-wrap">
                  <input type="number" v-model="modal.d.seloDebito" placeholder="100" min="0">
                  <span class="input-suffix">ml</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Curativo -->
          <template v-else-if="modal.tipo === 'Curativo'">
            <div class="campo">
              <label>Membro / região <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
              <div class="radio-group">
                <label class="radio-btn" v-for="op in ['MSE','MSD','MIE','MID']" :key="op">
                  <input type="radio"
                    :checked="modal.d.membroCurativo === op"
                    @click="modal.d.membroCurativo = modal.d.membroCurativo === op ? '' : op">
                  <span>{{ op }}</span>
                </label>
              </div>
            </div>
            <div class="campo">
              <label>Local / descrição <span class="obrigatorio">*</span></label>
              <input type="text" v-model="modal.d.localCurativo" placeholder="Ex: face anterior do antebraço, tornozelo, abdome...">
            </div>
          </template>

          <!-- Outros -->
          <template v-else>
            <div class="campo">
              <label>Descreva o dispositivo <span class="obrigatorio">*</span></label>
              <textarea v-model="modal.d.descricao" rows="3" placeholder="Ex: cateter vesical, sonda vesical de demora..."></textarea>
            </div>
          </template>

        </div>

        <p v-if="modal.erro" class="erro-msg" style="padding:0 16px 8px">{{ modal.erro }}</p>

        <div class="modal-footer">
          <button class="btn btn-secondary" style="flex:1" @click="fecharModal">Cancelar</button>
          <button class="btn btn-primary" style="flex:2" @click="confirmarDisp">Adicionar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'

const router = useRouter()
const store  = useAnotacoesStore()

const passo      = ref(1)
const gerado     = ref(false)
const textoGerado = ref('')
const erro       = ref('')
const salvando    = ref(false)
const feedbackMsg = ref('')
const dragIdx     = ref(null)
const dragOverIdx = ref(null)

// Scroll para o topo ao trocar de bloco
watch(passo, () => { nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })) })

const form = reactive({
  // Bloco 1
  horario: '', sexo: 'F',
  posicaoCama: '', rodas: '', grades: '', decubito: '',
  // Bloco 2
  mentalAlterado: false, mentalDesc: '',
  colaboracao: '', deambulacao: '', deambulaAuxilio: '',
  respPadrao: '', respiracao: '', oxigenioLitros: '',
  acompanhante: '', acompanhanteNome: '', acompanhanteParentesco: '',
  // Bloco 3
  dispositivos: [],
  // Bloco 4
  evacuacaoOpcao: '', evacuacaoData: '',
  diurese: [], svdDebito: '',
  queixas: '', obsApresenta: '',
  // Bloco 5
  fechamento: '',
  // Preview
  nomePaciente: '', leitoPaciente: ''
})

// ── Locais centrais (ordem alfabética, padrão para CVC/Permcath) ─────────
const locaisCentral = ['femoral D','femoral E','jugular D','jugular E','subclávia D','subclávia E']

// ── Opções dependentes do sexo ────────────────────────────────────────────
const colaboracaoOpcoes = computed(() => {
  const m = form.sexo === 'M'
  return [
    { value: m ? 'sendo colaborativo' : 'sendo colaborativa',
      label: m ? 'Colaborativo' : 'Colaborativa' },
    { value: m ? 'não sendo colaborativo com os cuidados' : 'não sendo colaborativa com os cuidados',
      label: m ? 'Não colaborativo' : 'Não colaborativa' },
    { value: 'inconsciente / sem resposta a estímulos', label: 'Inconsciente' }
  ]
})

const deambulacaoOpcoes = computed(() => {
  const m = form.sexo === 'M'
  return [
    { value: m ? 'deambula sozinho' : 'deambula sozinha',
      label: m ? 'Deambula sozinho' : 'Deambula sozinha' },
    { value: 'deambula com auxílio', label: 'Deambula com auxílio' },
    { value: 'não deambula', label: 'Não deambula' },
    { value: m ? 'acamado no momento' : 'acamada no momento',
      label: m ? 'Acamado no momento' : 'Acamada no momento' },
    { value: m ? 'restrito ao leito' : 'restrita ao leito',
      label: m ? 'Restrito ao leito (100% acamado)' : 'Restrita ao leito (100% acamada)' }
  ]
})

const respPadraoOpcoes = computed(() => {
  const m = form.sexo === 'M'
  return [
    { value: m ? 'eupneico' : 'eupneica', label: 'Eupneico(a)' },
    { value: m ? 'dispneico' : 'dispneica', label: 'Dispneico(a)' },
    { value: m ? 'taquipneico' : 'taquipneica', label: 'Taquipneico(a)' }
  ]
})

watch(() => form.sexo, () => {
  form.colaboracao = ''
  form.deambulacao = ''
  form.respPadrao  = ''
})

// ── Opções estáticas ──────────────────────────────────────────────────────
const evacuacaoOpcoes = [
  { v: 'hoje',         l: 'Hoje' },
  { v: 'ontem',        l: 'Ontem' },
  { v: 'data',         l: 'Escolher data' },
  { v: 'nao-avaliado', l: 'Não avaliado' }
]

const diureseOpcoes = [
  { v: 'fralda',       l: 'Fralda' },
  { v: 'comadre',      l: 'Comadre' },
  { v: 'papagaio',     l: 'Papagaio' },
  { v: 'banheiro',     l: 'Banheiro' },
  { v: 'SVD',          l: 'SVD' },
  { v: 'não avaliado', l: 'Não avaliado' }
]

const tiposDisp = ['AVP','CVC','PICC','Permcath','Shilley','SNE','SNG','Pulseira','Monitor','Dreno','Curativo','Outros']

const pulseiraOpcoes = [
  { v: 'identificação',         cor: '#bdbdbd', corTexto: '#333' },
  { v: 'risco de queda',        cor: '#fdd835', corTexto: '#333' },
  { v: 'alergia',               cor: '#e53935', corTexto: '#fff' },
  { v: 'precaução',             cor: '#43a047', corTexto: '#fff' },
  { v: 'preservação de membro', cor: '#e91e8c', corTexto: '#fff' }
]

// ── Eventos ───────────────────────────────────────────────────────────────
function onRespChange() {
  if (form.respiracao === 'ventilação mecânica') form.respPadrao = ''
  form.oxigenioLitros = ''
}

function onDiureseChange() {
  if (form.diurese.includes('não avaliado') && form.diurese.length > 1) {
    form.diurese = ['não avaliado']
  }
}

// ── Navegação ─────────────────────────────────────────────────────────────
function voltarOuSair() {
  if (gerado.value)   { gerado.value = false; passo.value = 5; return }
  if (passo.value > 1) { passo.value--; return }
  router.back()
}

function avancar() {
  erro.value = ''
  if (passo.value === 1) {
    if (!form.horario)     return (erro.value = 'Informe o horário')
    if (!form.posicaoCama) return (erro.value = 'Selecione a posição da cama')
    if (!form.rodas)       return (erro.value = 'Selecione o estado das rodas')
    if (!form.grades)      return (erro.value = 'Selecione o estado das grades')
    if (!form.decubito)    return (erro.value = 'Selecione o decúbito')
    passo.value = 2
  } else if (passo.value === 2) {
    if (!form.colaboracao)  return (erro.value = 'Selecione a colaboração')
    if (!form.deambulacao)  return (erro.value = 'Selecione a deambulação')
    if (form.deambulacao === 'deambula com auxílio' && !form.deambulaAuxilio)
      return (erro.value = 'Informe com qual auxílio deambula')
    if (!form.respiracao)   return (erro.value = 'Selecione a respiração')
    if ((form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂') && !form.oxigenioLitros)
      return (erro.value = 'Informe os litros por minuto')
    if (!form.acompanhante) return (erro.value = 'Selecione se há acompanhante')
    if (form.acompanhante === 'sim') {
      if (!form.acompanhanteNome)       return (erro.value = 'Informe o nome do acompanhante')
      if (!form.acompanhanteParentesco) return (erro.value = 'Informe o parentesco')
    }
    passo.value = 3
  } else if (passo.value === 4) {
    if (!form.evacuacaoOpcao) return (erro.value = 'Informe a última evacuação')
    if (form.evacuacaoOpcao === 'data' && !form.evacuacaoData)
      return (erro.value = 'Selecione a data da evacuação')
    if (form.diurese.length === 0) return (erro.value = 'Selecione ao menos uma opção de diurese')
    if (form.diurese.includes('SVD') && !form.svdDebito)
      return (erro.value = 'Informe o débito da SVD')
    atualizarFechamento()
    passo.value = 5
  }
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    Object.assign(form, { horario:'', sexo:'F', posicaoCama:'', rodas:'', grades:'', decubito:'' })
  } else if (passo.value === 2) {
    Object.assign(form, { mentalAlterado:false, mentalDesc:'', colaboracao:'',
      deambulacao:'', deambulaAuxilio:'', respPadrao:'', respiracao:'',
      oxigenioLitros:'', acompanhante:'', acompanhanteNome:'', acompanhanteParentesco:'' })
  } else if (passo.value === 4) {
    Object.assign(form, { evacuacaoOpcao:'', evacuacaoData:'', diurese:[],
      svdDebito:'', queixas:'', obsApresenta:'' })
  }
}

// ── Dispositivos ──────────────────────────────────────────────────────────
const modal = reactive({ aberto: false, tipo: '', d: {}, erro: '' })

function abrirModal(tipo) {
  modal.tipo  = tipo
  modal.d     = { tipos: [] }
  modal.erro  = ''
  modal.aberto = true
}

function fecharModal() { modal.aberto = false }

function moverDisp(i, dir) {
  const arr = form.dispositivos
  const j   = i + dir
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

function onDragStart(i) { dragIdx.value = i }
function onDragOver(i)  { dragOverIdx.value = i }
function onDrop(i) {
  if (dragIdx.value === null || dragIdx.value === i) { dragIdx.value = null; dragOverIdx.value = null; return }
  const arr  = form.dispositivos
  const item = arr.splice(dragIdx.value, 1)[0]
  arr.splice(i, 0, item)
  dragIdx.value = null
  dragOverIdx.value = null
}

function confirmarDisp() {
  modal.erro = ''
  const texto = buildDispTexto(modal.tipo, modal.d)
  if (texto === null) return
  form.dispositivos.push(texto)
  fecharModal()
}

function infusaoTexto(d) {
  if (!d.solucao) return ''
  let t = ` recebendo ${d.solucao}`
  if (d.bic) t += ' em BIC'
  if (d.velocidade) t += ` a ${d.velocidade}ml/h`
  return t
}

function buildDispTexto(tipo, d) {
  const err    = (msg) => { modal.erro = msg; return null }
  const fmt    = (s)   => { if (!s) return '?/?'; const [, m, dia] = s.split('-'); return `${dia}/${m}` }
  const status = (d)   => {
    const p = []
    if (d.salinizado) p.push('salinizado')
    if (d.ocluido)    p.push('ocluído')
    return p.length ? ', ' + p.join(' e ') : ''
  }
  const datado = (d) => d.datado ? `, datado de ${fmt(d.data)}` : ''

  switch (tipo) {
    case 'AVP': {
      if (!d.local) return err('Selecione o local')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `AVP em ${d.local}`
      if (d.emInfusao) t += ',' + infusaoTexto(d)
      t += status(d) + datado(d)
      return t
    }
    case 'CVC': {
      if (!d.local)   return err('Selecione o local')
      if (!d.lumens)  return err('Selecione o número de lúmens')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `CVC ${d.lumens} lúmen em ${d.local}`
      if (d.emInfusao) t += ',' + infusaoTexto(d)
      t += status(d) + datado(d)
      return t
    }
    case 'PICC': {
      if (!d.membro)  return err('Selecione o membro')
      if (!d.lumens)  return err('Selecione o número de lúmens')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `PICC ${d.lumens} lúmen em ${d.membro}`
      if (d.emInfusao) t += ',' + infusaoTexto(d)
      t += status(d) + datado(d)
      return t
    }
    case 'Permcath':
    case 'Shilley': {
      if (!d.local) return err('Selecione o local')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `${tipo} em ${d.local}`
      if (d.emInfusao) t += ',' + infusaoTexto(d)
      t += status(d) + datado(d)
      return t
    }
    case 'SNE': {
      if (!d.narina)   return err('Selecione a narina')
      if (!d.marcacao) return err('Informe a marcação')
      if (!d.status)   return err('Selecione o status')
      if (!d.dieta)    return err('Selecione se há dieta enteral')
      const nar = d.narina === 'D' ? 'direita' : 'esquerda'
      let t = `SNE em narina ${nar}, marcação ${d.marcacao}cm, ${d.status}`
      if (d.dieta === 'sim') t += `, recebendo dieta enteral a ${d.velocidadeDieta || '?'}ml/h`
      return t
    }
    case 'SNG': {
      if (!d.narina)   return err('Selecione a narina')
      if (!d.marcacao) return err('Informe a marcação')
      if (!d.modo)     return err('Selecione o modo')
      const nar = d.narina === 'D' ? 'direita' : 'esquerda'
      let t = `SNG em narina ${nar}, marcação ${d.marcacao}cm`
      if (d.modo === 'aberta')  t += ', aberta'
      else if (d.modo === 'fechada') t += ', fechada'
      else if (d.modo === 'dieta') t += `, recebendo dieta enteral a ${d.velocidadeDieta || '?'}ml/h`
      else if (d.modo === 'dren') {
        if (!d.debito) return err('Selecione o débito')
        t += ', em drenagem'
        t += d.debito === 'com' ? `, com débito de ${d.debitoVal || '?'}ml` : ', sem débito'
        if (d.debito === 'com' && d.aspecto) t += `, aspecto ${d.aspecto}`
      }
      return t
    }
    case 'Pulseira': {
      if (!d.membro) return err('Selecione o membro')
      if (!d.tipos || d.tipos.length === 0) return err('Selecione ao menos um tipo')
      return `pulseira(s) de ${d.tipos.join(', ')} em ${d.membro}`
    }
    case 'Monitor': {
      if (!d.tipoMonitor) return err('Selecione o tipo')
      return `em uso de ${d.tipoMonitor}`
    }
    case 'Dreno': {
      if (!d.drenoTipo)  return err('Informe o tipo do dreno')
      if (!d.drenoLocal) return err('Informe a localização')
      let t = `dreno de ${d.drenoTipo} em ${d.drenoLocal}`
      if (d.drenoAspecto) t += `, aspecto ${d.drenoAspecto}`
      if (d.drenoDebito)  t += `, débito de ${d.drenoDebito}ml`
      if (d.seloAgua)     t += `, com selo d'água${d.seloDebito ? ' (' + d.seloDebito + 'ml)' : ''}`
      return t
    }
    case 'Curativo': {
      if (!d.localCurativo) return err('Informe o local do curativo')
      const regiao = d.membroCurativo ? `em ${d.membroCurativo} — ` : ''
      return `curativo ${regiao}${d.localCurativo}`
    }
    default: {
      if (!d.descricao) return err('Descreva o dispositivo')
      return d.descricao
    }
  }
}

// ── Fechamento automático ─────────────────────────────────────────────────
function atualizarFechamento() {
  const p = form.posicaoCama || '___'
  const r = form.rodas       || '___'
  const g = form.grades      || '___'
  const d = form.decubito    || '___'
  form.fechamento = `Mantenho cama ${p}, rodas ${r}, grades ${g} e decúbito ${d}, campainha próxima e oriento a chamar sempre que necessário.`
}

// ── Geração de texto ──────────────────────────────────────────────────────
function gerar() {
  erro.value = ''
  if (!form.fechamento) atualizarFechamento()
  textoGerado.value = gerarTexto()
  gerado.value = true
}

function gerarTexto() {
  const parts = []
  const h = form.horario.replace(':', 'h')

  parts.push(`${h} – Recebo plantão com paciente em seu leito com cama ${form.posicaoCama}, rodas ${form.rodas}, grades ${form.grades} e decúbito ${form.decubito}.`)

  if (form.mentalAlterado && form.mentalDesc)
    parts.push(`Aparentemente ${form.mentalDesc}.`)

  const ap = []
  ap.push(form.colaboracao)

  if (form.deambulacao === 'deambula com auxílio')
    ap.push(`deambula com auxílio de ${form.deambulaAuxilio}`)
  else if (form.deambulacao !== 'não deambula')
    ap.push(form.deambulacao)

  const rv = form.respPadrao
  if (form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂') {
    if (rv) ap.push(rv)
    ap.push(`em ${form.respiracao} a ${form.oxigenioLitros}L/min`)
  } else if (form.respiracao === 'em ar ambiente') {
    const eup = rv === 'eupneica' || rv === 'eupneico'
    ap.push(rv && !eup ? `${rv} em ar ambiente` : 'em ar ambiente')
  } else {
    ap.push(form.respiracao)
  }

  if (form.acompanhante === 'sim') {
    const gen = form.sexo === 'M' ? 'acompanhado' : 'acompanhada'
    ap.push(`${gen} de ${form.acompanhanteParentesco} ${form.acompanhanteNome}`)
  }

  const apText = ap.join(', ')
  parts.push(apText.charAt(0).toUpperCase() + apText.slice(1) + '.')

  if (form.dispositivos.length > 0) {
    const dt = form.dispositivos.map((d, i) => i === 0 ? `Mantém ${d}` : d).join('; ')
    parts.push(dt + '.')
  }

  if (form.obsApresenta) {
    const o = form.obsApresenta
    parts.push(`Paciente apresenta ${o.charAt(0).toLowerCase() + o.slice(1)}.`)
  }

  const ref = []
  if      (form.evacuacaoOpcao === 'hoje')  ref.push('Refere última evacuação hoje')
  else if (form.evacuacaoOpcao === 'ontem') ref.push('Refere última evacuação ontem')
  else if (form.evacuacaoOpcao === 'data' && form.evacuacaoData) {
    const [, m, d] = form.evacuacaoData.split('-')
    ref.push(`Refere última evacuação em ${d}/${m}`)
  } else if (form.evacuacaoOpcao === 'nao-avaliado') ref.push('Evacuação não avaliada')

  if (form.diurese.includes('não avaliado')) {
    ref.push('diurese não avaliada')
  } else {
    const dt = form.diurese.map(d => {
      if (d === 'SVD')      return `SVD com débito presente de ${form.svdDebito}ml`
      if (d === 'banheiro') return 'diurese espontânea ao banheiro'
      if (d === 'papagaio') return 'diurese espontânea em uso de papagaio'
      if (d === 'comadre')  return 'diurese espontânea em uso de comadre'
      if (d === 'fralda')   return 'diurese em fralda'
      return d
    })
    const comp    = dt.filter(t => t.startsWith('diurese') || t.startsWith('SVD'))
    const simples = dt.filter(t => !t.startsWith('diurese') && !t.startsWith('SVD'))
    if (comp.length) ref.push(...comp)
    if (simples.length === 1) ref.push(`diurese em ${simples[0]}`)
    else if (simples.length > 1) {
      const last = simples[simples.length - 1]
      ref.push(`diurese em ${simples.slice(0, -1).join(', ')} e ${last}`)
    }
  }

  if (form.queixas) {
    const q = form.queixas
    ref.push(q.charAt(0).toLowerCase() + q.slice(1))
  }

  parts.push(ref.join(', ') + '.')
  parts.push(form.fechamento)

  return parts.join(' ')
}

// ── Ações ─────────────────────────────────────────────────────────────────
async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ tipo: 'inicial', texto: textoGerado.value,
      nome: form.nomePaciente, leito: form.leitoPaciente })
    mostrarFeedback('✓ Salvo no histórico!')
  } catch {
    mostrarFeedback('Erro ao salvar. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

function copiar() {
  navigator.clipboard.writeText(textoGerado.value)
    .then(() => mostrarFeedback('✓ Copiado!'))
    .catch(() => mostrarFeedback('Erro ao copiar'))
}

function compartilhar() {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoGerado.value)}`
  window.open(url, '_blank')
}

function novaAnotacao() {
  Object.assign(form, {
    horario:'', sexo:'F', posicaoCama:'', rodas:'', grades:'', decubito:'',
    mentalAlterado:false, mentalDesc:'', colaboracao:'', deambulacao:'',
    deambulaAuxilio:'', respPadrao:'', respiracao:'', oxigenioLitros:'',
    acompanhante:'', acompanhanteNome:'', acompanhanteParentesco:'',
    dispositivos:[],
    evacuacaoOpcao:'', evacuacaoData:'', diurese:[], svdDebito:'',
    queixas:'', obsApresenta:'', fechamento:'',
    nomePaciente:'', leitoPaciente:''
  })
  passo.value = 1
  gerado.value = false
  textoGerado.value = ''
  erro.value = ''
}

function mostrarFeedback(msg) {
  feedbackMsg.value = msg
  setTimeout(() => (feedbackMsg.value = ''), 3000)
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
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
}
.feedback-msg {
  text-align: center;
  font-size: 0.9rem;
  color: var(--success);
  margin-top: 12px;
  padding: 8px;
  background: rgba(67,160,71,0.1);
  border-radius: 8px;
}
</style>
