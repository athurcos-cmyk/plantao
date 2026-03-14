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
          <label>Deambulação</label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in deambulacaoOpcoes" :key="op.value">
              <input type="radio" :checked="form.deambulacao === op.value" @click="form.deambulacao = form.deambulacao === op.value ? '' : op.value">
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
          <div style="margin-top:10px">
            <input class="campo-inline" type="text" v-model="form.diureseObs" placeholder="Ex: diurese em nefrostomia, ureterostomia...">
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
                  :style="modal.d.tipos.includes(op.v) ? { borderColor: op.cor, backgroundColor: op.cor + '20' } : {}"
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
              <label>Locais <span class="obrigatorio">*</span></label>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                <label class="checkbox-label" v-for="op in ['MSD','MSE','MID','MIE']" :key="op" style="flex:1;min-width:70px">
                  <input type="checkbox" :value="op" v-model="modal.d.locais">
                  <span>{{ op }}</span>
                </label>
              </div>
              <input type="text" v-model="modal.d.localTexto" placeholder="Outro local (ex: flanco abdominal direito...)">
            </div>
            <div class="campo">
              <label>Condição <span class="obrigatorio">*</span></label>
              <div class="radio-group vertical">
                <label class="radio-btn" v-for="op in ['limpo e seco externamente','sujo externamente']" :key="op">
                  <input type="radio" :checked="modal.d.condicao === op" @click="modal.d.condicao = modal.d.condicao === op ? '' : op">
                  <span>{{ op }}</span>
                </label>
              </div>
            </div>
            <label class="checkbox-label" style="margin-bottom:0">
              <input type="checkbox" v-model="modal.d.enfaixamento">
              <span>Com enfaixamento</span>
            </label>
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
import { useAnotacaoInicial } from '../../composables/useAnotacaoInicial.js'

const {
  passo, gerado, textoGerado, erro, salvando, feedbackMsg,
  dragIdx, dragOverIdx,
  form, modal,
  locaisCentral, tiposDisp, pulseiraOpcoes, diureseOpcoes, evacuacaoOpcoes,
  colaboracaoOpcoes, deambulacaoOpcoes, respPadraoOpcoes,
  cap,
  voltarOuSair, avancar, limparBloco,
  onRespChange, onDiureseChange,
  abrirModal, fecharModal, confirmarDisp,
  moverDisp, removerDisp, onDragStart, onDragOver, onDrop,
  gerar, salvar, copiar, compartilhar, novaAnotacao,
  router
} = useAnotacaoInicial()
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
