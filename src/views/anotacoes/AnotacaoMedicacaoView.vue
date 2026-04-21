<template>
  <div class="screen">
    <header class="app-header">
      <button  data-testid="auto-btn-anotacaomedicacaoview-1" class="btn-icon" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button  data-testid="auto-btn-anotacaomedicacaoview-2" class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>
      <div style="width:34px"/>
    </header>

    <main class="container" style="padding-top:24px;padding-bottom:40px">

      <!-- Banner de rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info">
          <span>📝</span>
          <span>Você tem uma medicação em rascunho</span>
        </div>
        <div class="rascunho-acoes">
          <button  data-testid="auto-btn-anotacaomedicacaoview-3" class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button  data-testid="auto-btn-anotacaomedicacaoview-4" class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <!-- ── Formulário ── -->
      <div v-if="!gerado">
        <div v-if="pacientesStore.pacientes.length > 0" style="margin-bottom:16px">
          <label class="label-small">Paciente registrado</label>
          <div class="chips-scroll" style="margin-top:6px">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="chip"
              :class="{ ativo: form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >{{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}</button>
          </div>
        </div>

        <section class="med-card">
          <div class="med-section-head">
            <span class="med-section-kicker">Preparo</span>
            <h2 class="med-section-title">Checagem antes da administração</h2>
            <p class="med-section-sub">Marque só o que realmente foi feito neste horário.</p>
          </div>

          <div class="campo">
            <label>Horário <span class="obrigatorio">*</span></label>
            <input  data-testid="auto-input-anotacaomedicacaoview-1" type="time" v-model="form.horario">
          </div>

          <div class="campo">
            <label>Identificação do paciente</label>
            <label class="checkbox-label med-choice" :class="{ checked: form.conferencia === 'com' }">
              <input  data-testid="auto-input-anotacaomedicacaoview-2" type="radio"
                :checked="form.conferencia === 'com'"
                @click="form.conferencia = form.conferencia === 'com' ? '' : 'com'">
              <span>Conferência de identificação com paciente</span>
            </label>
            <label class="checkbox-label med-choice med-choice-spaced" :class="{ checked: form.conferencia === 'do' }">
              <input  data-testid="auto-input-anotacaomedicacaoview-3" type="radio"
                :checked="form.conferencia === 'do'"
                @click="form.conferencia = form.conferencia === 'do' ? '' : 'do'">
              <span>Conferência de identificação do paciente</span>
            </label>
          </div>

          <div class="campo">
            <label class="checkbox-label med-choice" :class="{ checked: form.orienta }">
              <input  data-testid="auto-input-anotacaomedicacaoview-4" type="checkbox" v-model="form.orienta">
              <span>Oriento paciente sobre a medicação</span>
            </label>
          </div>

          <div class="campo" style="margin-bottom:0">
            <label>Conforme</label>
            <label class="checkbox-label med-choice" :class="{ checked: form.conformeTipo === 'prescricao' }">
              <input  data-testid="auto-input-anotacaomedicacaoview-5" type="radio"
                :checked="form.conformeTipo === 'prescricao'"
                @click="form.conformeTipo = form.conformeTipo === 'prescricao' ? '' : 'prescricao'">
              <span>Conforme prescrição médica</span>
            </label>
            <div class="med-choice-spaced">
              <label class="checkbox-label med-choice" :class="{ checked: form.conformeTipo === 'orientacao' }">
                <input  data-testid="auto-input-anotacaomedicacaoview-6" type="radio"
                  :checked="form.conformeTipo === 'orientacao'"
                  @click="form.conformeTipo = form.conformeTipo === 'orientacao' ? '' : 'orientacao'">
                <span>Conforme orientação do</span>
              </label>
              <input
                 data-testid="auto-input-anotacaomedicacaoview-7" v-if="form.conformeTipo === 'orientacao'"
                type="text"
                class="campo-inline"
                v-model="form.conformeNome"
                placeholder="Nome do profissional"
                style="margin-top:8px">
            </div>
          </div>
        </section>

        <section class="med-card med-card-medicamentos">
          <div class="med-section-head med-section-head-row">
            <div>
              <span class="med-section-kicker">Administração</span>
              <h2 class="med-section-title">Medicamentos do horário</h2>
            </div>
            <span class="med-count">{{ form.medicamentos.length }}</span>
          </div>
          <p class="med-section-sub med-section-sub-tight">Adicione um ou mais medicamentos antes de gerar o texto final.</p>

          <div v-if="presetsRapidos.length || historicoRapido.length" class="med-quick-stack">
            <div v-if="presetsRapidos.length" class="med-quick-block">
              <div class="med-quick-head">
                <span class="med-quick-title">Presets rápidos</span>
                <span class="med-quick-note">1 toque</span>
              </div>
              <div class="chips-scroll med-quick-scroll">
                <button
                  v-for="preset in presetsRapidos"
                  :key="'preset-' + criarChaveMedicacao(preset)"
                  class="chip chip-quick"
                  @click="adicionarMedicacaoRapida(preset, 'preset')"
                >{{ formatarRotuloMedicacaoRapida(preset) }}</button>
              </div>
            </div>

            <div v-if="historicoRapido.length" class="med-quick-block">
              <div class="med-quick-head">
                <span class="med-quick-title">Últimos usados</span>
                <span class="med-quick-note">sem reabrir modal</span>
              </div>
              <div class="chips-scroll med-quick-scroll">
                <button
                  v-for="hist in historicoRapido"
                  :key="'hist-' + criarChaveMedicacao(hist)"
                  class="chip"
                  @click="adicionarMedicacaoRapida(hist, 'historico')"
                >{{ formatarRotuloMedicacaoRapida(hist) }}</button>
              </div>
            </div>
          </div>

          <p v-if="form.medicamentos.length === 0" class="lista-vazia">
            Nenhum medicamento adicionado
          </p>

          <div v-else class="med-lista">
            <div v-for="(med, i) in form.medicamentos" :key="i" class="med-item">
              <div class="med-item-info">
                <span class="med-nome">{{ med.nome }}</span>
                <span class="med-detalhe">{{ resumirMed(med) }}</span>
                <span v-if="med.dupla" class="badge-dupla">dupla ✓</span>
              </div>
              <div class="med-item-acoes">
                <button
                  class="btn-icon-sm"
                  :class="{ 'btn-favorite-on': ehPreset(med) }"
                  @click="alternarPreset(med)"
                  :title="ehPreset(med) ? 'Remover preset' : 'Salvar preset'"
                >{{ ehPreset(med) ? '★' : '☆' }}</button>
                <button  data-testid="auto-btn-anotacaomedicacaoview-5" class="btn-icon-sm" @click="editarMed(i)" title="Editar">✏</button>
                <button  data-testid="auto-btn-anotacaomedicacaoview-6" class="btn-icon-sm btn-danger-sm" @click="removerMed(i)" title="Remover">✕</button>
              </div>
            </div>
          </div>

          <button  data-testid="auto-btn-anotacaomedicacaoview-7" class="btn-add-med" @click="abrirModal()">
            + Adicionar medicamento
          </button>
        </section>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>

        <button  data-testid="auto-btn-anotacaomedicacaoview-8" class="btn btn-primary" style="width:100%;margin-top:8px" @click="gerar">
          Gerar texto
        </button>

      </div>

      <!-- ── Preview ── -->
      <div v-else>
        <textarea v-model="textoGerado" class="preview-box" rows="8"></textarea>

        <div style="display:flex;gap:10px;margin-top:16px">
          <div style="flex:2">
            <label class="label-small">Nome do paciente</label>
            <input  data-testid="auto-input-anotacaomedicacaoview-8" class="campo-inline" type="text" v-model="form.nomePaciente" placeholder="Maria da Silva">
          </div>
          <div style="flex:1">
            <label class="label-small">Leito</label>
            <input  data-testid="auto-input-anotacaomedicacaoview-9" class="campo-inline" type="text" v-model="form.leitoPaciente" placeholder="4B">
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
          <button  data-testid="auto-btn-anotacaomedicacaoview-9" class="btn btn-primary" @click="copiar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copiar texto
          </button>
          <button  data-testid="auto-btn-anotacaomedicacaoview-10" class="btn btn-secondary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
          </button>
          <button  data-testid="auto-btn-anotacaomedicacaoview-11" class="btn btn-secondary" @click="compartilhar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Compartilhar
          </button>
          <button  data-testid="auto-btn-anotacaomedicacaoview-12" class="btn btn-secondary" @click="novaAnotacao">Nova anotação</button>
          <button  data-testid="auto-btn-anotacaomedicacaoview-13" class="btn btn-secondary" @click="gerado = false">← Editar</button>
        </div>
      </div>

    </main>

    <!-- ══ Modal: adicionar / editar medicamento ══ -->
    <div v-if="modal.aberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-box">

        <div class="modal-header">
          <h3>{{ modal.editIdx !== null ? 'Editar' : 'Adicionar' }} medicamento</h3>
          <button  data-testid="auto-btn-anotacaomedicacaoview-14" class="btn-icon" @click="fecharModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">

          <!-- Nome + autocomplete -->
          <div class="campo">
            <label>Nome do medicamento </label>
            <div class="autocomplete-wrap">
              <input
                 data-testid="auto-input-anotacaomedicacaoview-10" type="text"
                :value="modal.d.nome"
                @input="onNomeInput($event.target.value)"
                @focus="onNomeInput(modal.d.nome)"
                @blur="fecharSugestoes"
                placeholder="Ex: heparina, omeprazol, dipirona"
                autocomplete="off">
              <div v-if="mostrarSug && sugestoes.length" class="autocomplete-dropdown">
                <button
                   data-testid="auto-btn-anotacaomedicacaoview-15" v-for="sug in sugestoes"
                  :key="sug.nome + sug.tipo + formatarBadgeSugestao(sug.med)"
                  class="autocomplete-item"
                  @mousedown.prevent="selecionarSugestao(sug)">
                  <span class="autocomplete-nome">{{ sug.nome }}</span>
                  <span v-if="sug.tipo !== 'base'" class="autocomplete-badge">
                    {{ formatarBadgeSugestao(sug.med) }}
                  </span>
                  <span v-else class="autocomplete-hint">💊</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="presetsCatalogoNome.length" class="campo">
            <label>Modelos comuns para {{ modal.d.nome }}</label>
            <div class="chips-wrap">
              <button
                v-for="preset in presetsCatalogoNome"
                :key="'catalogo-' + preset.rotulo"
                class="chip chip-sm"
                @click="aplicarTemplateNoModal(preset.med)"
              >{{ formatarBadgeSugestao(preset.med) }}</button>
            </div>
          </div>

          <!-- Via -->
          <div class="campo">
            <label>Via de administração </label>
            <div class="chips-wrap">
              <button
                 data-testid="auto-btn-anotacaomedicacaoview-16" v-for="v in vias" :key="v"
                class="chip" :class="{ ativo: modal.d.via === v }"
                @click="selecionarVia(v)">{{ v }}</button>
            </div>
          </div>

          <!-- Local anatômico (IM, SC) -->
          <div v-if="['IM', 'SC'].includes(modal.d.via)" class="campo">
            <label>Local anatômico
              <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span>
            </label>
            <div class="chips-wrap">
              <button
                v-for="loc in locaisAnatomicos[modal.d.via]" :key="loc"
                class="chip" :class="{ ativo: modal.d.localAnatomico === loc }"
                @click="modal.d.localAnatomico = modal.d.localAnatomico === loc ? '' : loc">
                {{ loc }}
              </button>
            </div>
          </div>

          <!-- Campo profissional (Recusa) -->
          <div v-if="modal.d.via === 'Recusa'" class="campo">
            <label>Comunicado a </label>
            <div class="input-suffix-wrap">
              <input type="text" v-model="modal.d.recusaNome" placeholder="Nome do profissional" class="campo-inline">
              <span class="input-suffix" style="font-size:0.8rem">Enf.</span>
            </div>
          </div>

          <!-- Dose + Unidade (não-OFT, não-Recusa, não-DERM) -->
          <div v-if="modal.d.via && modal.d.via !== 'OFT' && modal.d.via !== 'Recusa' && modal.d.via !== 'DERM'" class="campo">
            <label>Dose </label>
            <input  data-testid="auto-input-anotacaomedicacaoview-11" type="text" inputmode="decimal" v-model="modal.d.dose" placeholder="Ex: 5000, 10, 500">
            <div class="chips-wrap" style="margin-top:8px">
              <button
                 data-testid="auto-btn-anotacaomedicacaoview-17" v-for="u in unidades" :key="u"
                class="chip chip-sm" :class="{ ativo: modal.d.unidade === u }"
                @click="modal.d.unidade = u">{{ u }}</button>
            </div>
          </div>

          <!-- Dose OFT (Gts fixo) -->
          <div v-if="modal.d.via === 'OFT'" class="campo">
            <label>Quantidade </label>
            <div class="input-suffix-wrap">
              <input  data-testid="auto-input-anotacaomedicacaoview-12" type="number" v-model="modal.d.dose" placeholder="1" min="1">
              <span class="input-suffix">Gts</span>
            </div>
          </div>

          <!-- Olho (OFT) -->
          <div v-if="modal.d.via === 'OFT'" class="campo">
            <label>Olho </label>
            <div class="chips-wrap">
              <button
                 data-testid="auto-btn-anotacaomedicacaoview-18" v-for="op in ['direito','esquerdo','ambos']" :key="op"
                class="chip" :class="{ ativo: modal.d.oftOlho === op }"
                @click="modal.d.oftOlho = op">
                {{ op.charAt(0).toUpperCase() + op.slice(1) }}
              </button>
            </div>
          </div>

          <!-- EV: com ou sem diluição -->
          <div v-if="modal.d.via === 'EV'" class="campo">
            <label>Modo EV</label>
            <div class="chips-wrap">
              <button
                data-testid="auto-btn-anotacaomedicacaoview-19"
                class="chip"
                :class="{ ativo: !modal.d.evDiluicao }"
                @click="selecionarModoEv(false)"
              >Direto</button>
              <button
                data-testid="auto-btn-anotacaomedicacaoview-20"
                class="chip"
                :class="{ ativo: modal.d.evDiluicao }"
                @click="selecionarModoEv(true)"
              >Diluído</button>
            </div>
            <p class="hint-text">
              {{ modal.d.evDiluicao ? 'Ao escolher EV diluído, informe solução e volume.' : 'Sem diluição = administrado direto EV.' }}
            </p>
          </div>

          <!-- EV: campos de diluição -->
          <template v-if="modal.d.via === 'EV' && modal.d.evDiluicao">

            <div class="campo">
              <label>Volume </label>
              <div class="input-suffix-wrap">
                <input  data-testid="auto-input-anotacaomedicacaoview-14" type="number" v-model="modal.d.evVolume" placeholder="100" min="1">
                <span class="input-suffix">ml</span>
              </div>
            </div>

            <div class="campo">
              <label>Solução </label>
              <div class="chips-wrap">
                <button  data-testid="auto-btn-anotacaomedicacaoview-21" class="chip" :class="{ ativo: modal.d.evSolucao === 'SF' }" @click="modal.d.evSolucao = 'SF'">SF 0,9%</button>
                <button  data-testid="auto-btn-anotacaomedicacaoview-22" class="chip" :class="{ ativo: modal.d.evSolucao === 'SG' }" @click="modal.d.evSolucao = 'SG'">SG 5%</button>
                <button  data-testid="auto-btn-anotacaomedicacaoview-23" class="chip" :class="{ ativo: modal.d.evSolucao === 'agua' }" @click="modal.d.evSolucao = 'agua'">Água destilada</button>
                <button  data-testid="auto-btn-anotacaomedicacaoview-24" class="chip" :class="{ ativo: modal.d.evSolucao === 'outra' }" @click="modal.d.evSolucao = 'outra'">Outra</button>
              </div>
              <input v-if="modal.d.evSolucao === 'outra'"
                data-testid="auto-input-anotacaomedicacaoview-22"
                type="text"
                v-model="modal.d.evSolucaoCustom"
                placeholder="Ex: glicose 50%, ringer lactato..."
                class="campo-inline"
                style="margin-top: 8px">
            </div>

          </template>

          <!-- BIC toggle — disponível para qualquer EV (com ou sem diluição) -->
          <template v-if="modal.d.via === 'EV'">

            <div class="campo">
              <label class="checkbox-label" :class="{ checked: modal.d.evBic }">
                <input  data-testid="auto-input-anotacaomedicacaoview-15" type="checkbox" :checked="modal.d.evBic" @change="alternarBic($event.target.checked)">
                <span>BIC (Bomba de Infusão Contínua)</span>
              </label>
              <p v-if="modal.d.evBic" class="hint-text">Informe tempo, velocidade ou ambos</p>
            </div>

            <!-- BIC: tempo -->
            <div v-if="modal.d.evBic" class="campo">
              <label>
                Tempo para infundir
                <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span>
              </label>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" v-model="modal.d.evTempoH" placeholder="0" min="0" style="flex:1">
                <span style="color:var(--text-muted);font-size:0.9rem;flex-shrink:0">h</span>
                <input type="number" v-model="modal.d.evTempoMin" placeholder="30" min="0" max="59" style="flex:1">
                <span style="color:var(--text-muted);font-size:0.9rem;flex-shrink:0">min</span>
              </div>
            </div>

            <!-- BIC: velocidade -->
            <div v-if="modal.d.evBic" class="campo">
              <label>
                Velocidade
                <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span>
              </label>
              <div class="input-suffix-wrap">
                <input  data-testid="auto-input-anotacaomedicacaoview-17" type="number" v-model="modal.d.evVelocidade" placeholder="5" min="0.1" step="0.1">
                <span class="input-suffix">ml/h</span>
              </div>
            </div>

          </template>

          <div v-if="modal.d.via !== 'Recusa'" class="campo campo-avancado">
            <button class="btn-avancado" @click="modal.avancado = !modal.avancado">
              {{ modal.avancado ? 'Ocultar detalhes' : 'Mais detalhes' }}
            </button>
            <p class="hint-text">Dupla checagem e lote ficam fora do fluxo rápido.</p>
          </div>

          <template v-if="modal.avancado && modal.d.via !== 'Recusa'">
            <!-- Dupla checagem -->
            <div class="campo">
              <label class="checkbox-label" :class="{ checked: modal.d.dupla }">
                <input  data-testid="auto-input-anotacaomedicacaoview-18" type="checkbox" v-model="modal.d.dupla">
                <span>Dupla checagem</span>
              </label>
              <div v-if="modal.d.dupla" style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
                <select data-testid="auto-input-anotacaomedicacaoview-19" v-model="modal.d.duplaCargo" class="campo-inline">
                  <option value="téc. de enfermagem">Téc. de enfermagem</option>
                  <option value="enf.">Enf.</option>
                </select>
                <div class="autocomplete-wrap">
                  <input
                     data-testid="auto-input-anotacaomedicacaoview-20" type="text"
                    :value="modal.d.duplaNome"
                    @input="onDuplaNomeInput($event.target.value)"
                    @focus="onDuplaNomeInput(modal.d.duplaNome)"
                    @blur="fecharDuplaSug"
                    placeholder="Nome do profissional *"
                    autocomplete="off">
                  <div v-if="mostrarDuplaSug && duplaSugestoes.length" class="autocomplete-dropdown">
                    <button
                      v-for="nome in duplaSugestoes" :key="nome"
                      class="autocomplete-item"
                      @mousedown.prevent="selecionarDuplaSug(nome)">
                      <span class="autocomplete-nome">{{ nome }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lote / Validade -->
            <div class="campo">
              <label class="checkbox-label" :class="{ checked: modal.d.loteAtivo }">
                <input type="checkbox" v-model="modal.d.loteAtivo">
                <span>Informar lote / validade</span>
              </label>
              <div v-if="modal.d.loteAtivo" style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
                <input type="number" v-model="modal.d.loteFrasco" class="campo-inline"
                  placeholder="Nº do frasco (opcional — ex: 1, 2, 3)" min="1" step="1">
                <input type="text" v-model="modal.d.lote" class="campo-inline"
                  placeholder="Número do lote *">
                <input type="text" v-model="modal.d.loteFabricacao" class="campo-inline"
                  placeholder="Fabricação (ex: 10/2024) *">
                <input type="text" v-model="modal.d.loteValidade" class="campo-inline"
                  placeholder="Validade (ex: 09/2026) *">
                <input type="text" v-model="modal.d.loteMarca" class="campo-inline"
                  placeholder="Marca *">
              </div>
            </div>
          </template>

        </div>

        <p v-if="modal.erro" class="erro-msg" style="padding:0 16px 8px">{{ modal.erro }}</p>

        <div class="modal-footer">
          <button  data-testid="auto-btn-anotacaomedicacaoview-24" class="btn btn-secondary" style="flex:1" @click="fecharModal">Cancelar</button>
          <button
            v-if="modal.editIdx === null"
            data-testid="auto-btn-anotacaomedicacaoview-25"
            class="btn btn-secondary"
            style="flex:1.2"
            @click="confirmarMed()"
          >Adicionar</button>
          <button  data-testid="auto-btn-anotacaomedicacaoview-26" class="btn btn-primary" style="flex:2" @click="confirmarMed({ continuar: modal.editIdx === null })">
            {{ modal.editIdx !== null ? 'Salvar alterações' : 'Salvar e adicionar próxima' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { useToast }          from '../../composables/useToast.js'
import { useRascunho }       from '../../composables/useRascunho.js'
import { useAuthStore }      from '../../stores/auth.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useCopia }          from '../../composables/useCopia.js'
import { sugerirMedicamentosDetalhados, listarPresetsCatalogo } from '../../data/medicamentos.js'
import {
  MEDICACAO_HISTORY_MAX,
  MEDICACAO_PRESETS_MAX,
  criarColecaoMedicacaoVazia,
  normalizarColecaoMedicacao,
  mesclarColecoesMedicacao,
  inserirNaColecaoMedicacao,
  removerDaColecaoMedicacao,
  criarChaveMedicacao,
  formatarRotuloMedicacaoRapida,
  prepararProximaMedicacao,
  gerarTextoMedicacao,
  extrairTemplateMedicacao,
} from '../../utils/medicacao.js'
import { db } from '../../firebase.js'
import { ref as dbRef, get, set } from 'firebase/database'

const router   = useRouter()
const store    = useAnotacoesStore()
const auth     = useAuthStore()
const { showToast } = useToast()
const { copiar: _copiar } = useCopia()
const pacientesStore = usePacientesStore()

function selecionarPaciente(p) {
  form.nomePaciente = p.nome
  form.leitoPaciente = p.leito || ''
}

// ── Histórico de medicamentos (Firebase + localStorage como cache) ────────────
const historicoCache = ref([])   // fonte de verdade em memória

function histKeyLS() {
  return `med_historico_${auth.syncCode || 'guest'}`
}
const historicoPayload = ref(criarColecaoMedicacaoVazia())
const presetsCache     = ref([])
const presetsPayload   = ref(criarColecaoMedicacaoVazia())
const presetsRapidos   = computed(() => presetsCache.value.slice(0, 6))
const presetKeys       = computed(() => new Set(presetsCache.value.map((item) => criarChaveMedicacao(item))))
const historicoRapido  = computed(() =>
  historicoCache.value
    .filter((item) => !presetKeys.value.has(criarChaveMedicacao(item)))
    .slice(0, 6)
)

function histPathFB() {
  return `med_historico/${auth.syncCode}`
}
function presetsKeyLS() {
  return `med_presets_${auth.syncCode || 'guest'}`
}
function presetsPathFB() {
  return `med_presets/${auth.syncCode}`
}

function _lerLS(chave, limite) {
  try { return normalizarColecaoMedicacao(JSON.parse(localStorage.getItem(chave) || 'null'), limite) }
  catch { return criarColecaoMedicacaoVazia() }
}
function _gravarLS(chave, colecao) {
  localStorage.setItem(chave, JSON.stringify(colecao))
}
async function _gravarFB(caminho, colecao) {
  if (!auth.syncCode) return
  try { await set(dbRef(db, caminho), colecao) }
  catch { /* silencioso — localStorage já foi atualizado */ }
}

// Carrega histórico: localStorage imediato + Firebase em background
function _colecoesIguais(a, b, limite) {
  return JSON.stringify(normalizarColecaoMedicacao(a, limite)) === JSON.stringify(normalizarColecaoMedicacao(b, limite))
}

async function _sincronizarColecao({ keyLS, pathFB, payloadRef, itemsRef, limite }) {
  const local = _lerLS(keyLS, limite)
  payloadRef.value = local
  itemsRef.value = local.items

  if (!auth.syncCode) return

  try {
    const snap = await get(dbRef(db, pathFB))
    const remoto = snap.exists()
      ? normalizarColecaoMedicacao(snap.val(), limite)
      : criarColecaoMedicacaoVazia()

    const mesclado = mesclarColecoesMedicacao(local, remoto, limite)
    payloadRef.value = mesclado
    itemsRef.value = mesclado.items
    _gravarLS(keyLS, mesclado)

    if (!_colecoesIguais(mesclado, remoto, limite)) {
      _gravarFB(pathFB, mesclado)
    }
  } catch { /* fica com localStorage */ }
}

function _persistirHistorico() {
  _gravarLS(histKeyLS(), historicoPayload.value)
  _gravarFB(histPathFB(), historicoPayload.value)
}

function _persistirPresets() {
  _gravarLS(presetsKeyLS(), presetsPayload.value)
  _gravarFB(presetsPathFB(), presetsPayload.value)
}

onMounted(async () => {
  pacientesStore.iniciar()
  await Promise.all([
    _sincronizarColecao({
      keyLS: histKeyLS(),
      pathFB: histPathFB(),
      payloadRef: historicoPayload,
      itemsRef: historicoCache,
      limite: MEDICACAO_HISTORY_MAX,
    }),
    _sincronizarColecao({
      keyLS: presetsKeyLS(),
      pathFB: presetsPathFB(),
      payloadRef: presetsPayload,
      itemsRef: presetsCache,
      limite: MEDICACAO_PRESETS_MAX,
    }),
  ])
  return
  historicoCache.value = _lerLS()          // instantâneo
  if (!auth.syncCode) return
  try {
    const snap = await get(dbRef(db, histPathFB()))
    if (snap.exists()) {
      const remoto = snap.val()
      if (Array.isArray(remoto) && remoto.length > 0) {
        historicoCache.value = remoto
        _gravarLS(remoto)                   // atualiza cache local
      }
    }
  } catch { /* fica com localStorage */ }
})

function adicionarAoHistorico(med) {
  if (!extrairTemplateMedicacao(med)) return
  historicoPayload.value = inserirNaColecaoMedicacao(historicoPayload.value, med, MEDICACAO_HISTORY_MAX)
  historicoCache.value = historicoPayload.value.items
  _persistirHistorico()
  return
  const hist = [...historicoCache.value]
  const idx  = hist.findIndex(h => h.nome === med.nome && h.dose === med.dose && h.via === med.via)
  if (idx !== -1) hist.splice(idx, 1)
  hist.unshift({ ...med })
  if (hist.length > HIST_MAX) hist.splice(HIST_MAX)
  historicoCache.value = hist
  _gravarLS(hist)           // síncrono (rápido)
  _gravarFB(hist)           // assíncrono, fire-and-forget
}

// ── Autocomplete state ────────────────────────────────────────────────────────
function ehPreset(med) {
  const chave = criarChaveMedicacao(med)
  return Boolean(chave && presetKeys.value.has(chave))
}

function alternarPreset(med) {
  const chave = criarChaveMedicacao(med)
  if (!chave) return

  if (presetKeys.value.has(chave)) {
    presetsPayload.value = removerDaColecaoMedicacao(presetsPayload.value, chave)
    presetsCache.value = presetsPayload.value.items
    _persistirPresets()
    showToast('Preset removido')
    return
  }

  presetsPayload.value = inserirNaColecaoMedicacao(presetsPayload.value, med, MEDICACAO_PRESETS_MAX)
  presetsCache.value = presetsPayload.value.items
  _persistirPresets()
  showToast('Preset salvo')
}

function _marcarPresetUsado(med) {
  if (!ehPreset(med)) return
  presetsPayload.value = inserirNaColecaoMedicacao(presetsPayload.value, med, MEDICACAO_PRESETS_MAX)
  presetsCache.value = presetsPayload.value.items
  _persistirPresets()
}

function adicionarMedicacaoRapida(med, origem = 'historico') {
  const template = extrairTemplateMedicacao(med)
  if (!template) return

  const novo = { ...medVazio(), ...template }
  form.medicamentos.push(novo)
  adicionarAoHistorico(novo)
  if (origem === 'preset') _marcarPresetUsado(novo)
  showToast('Medicamento adicionado')
}

const sugestoes  = ref([])
const mostrarSug = ref(false)
const presetsCatalogoNome = computed(() =>
  modal.d?.nome?.trim()?.length >= 2 ? listarPresetsCatalogo(modal.d.nome).slice(0, 4) : []
)

function formatarBadgeSugestao(med) {
  if (!med?.via) return 'Nome'
  if (med.via === 'DERM') return 'DERM'

  const dose = med.dose
    ? `${med.dose}${med.via === 'OFT' ? 'Gts' : med.unidade || ''}`
    : ''

  let via = med.via
  if (med.via === 'OFT') via = `OFT ${med.oftOlho || ''}`.trim()
  if (med.via === 'EV' && med.evBic) via = 'EV BIC'
  else if (med.via === 'EV' && med.evDiluicao) via = 'EV diluído'

  return [dose, via].filter(Boolean).join(' · ')
}

function aplicarTemplateNoModal(med) {
  modal.d = { ...medVazio(), ...med }
  modal.erro = ''
  modal.avancado = Boolean(modal.d.dupla || modal.d.loteAtivo)
}

function onNomeInput(val) {
  modal.d.nome = val
  if (!val || val.trim().length < 2) {
    sugestoes.value  = []
    mostrarSug.value = false
    return
  }
  sugestoes.value = sugerirMedicamentosDetalhados(val, historicoCache.value, 8)
  mostrarSug.value = sugestoes.value.length > 0
}

function selecionarSugestao(sug) {
  if (sug.tipo === 'base') {
    modal.d.nome = sug.nome
  } else {
    aplicarTemplateNoModal(sug.med)
  }
  sugestoes.value  = []
  mostrarSug.value = false
}

function fecharSugestoes() {
  // pequeno delay para deixar o click na sugestão registrar antes de esconder
  setTimeout(() => { mostrarSug.value = false }, 150)
}

// ── Autocomplete dupla checagem — nome do profissional ────────────────────────
const duplaSugestoes  = ref([])
const mostrarDuplaSug = ref(false)

function _formatarTempo(h, m) {
  const hh = parseInt(h) || 0
  const mm = parseInt(m) || 0
  if (!hh && !mm) return ''
  if (hh && mm)  return `${hh}h${mm}min`
  if (hh)        return `${hh}h`
  return `${mm}min`
}

function _duplaNomesKey() { return `dupla_nomes_${auth.syncCode || 'guest'}` }
function _lerDuplaNomes() {
  try { return JSON.parse(localStorage.getItem(_duplaNomesKey()) || '[]') } catch { return [] }
}
function _salvarDuplaNome(nome) {
  const lista = _lerDuplaNomes().filter(n => n !== nome)
  lista.unshift(nome)
  localStorage.setItem(_duplaNomesKey(), JSON.stringify(lista.slice(0, 5)))
}

function onDuplaNomeInput(val) {
  modal.d.duplaNome = val
  const lista = _lerDuplaNomes()
  const filtrado = val.trim()
    ? lista.filter(n => n.toLowerCase().includes(val.toLowerCase()))
    : lista
  duplaSugestoes.value  = filtrado
  mostrarDuplaSug.value = filtrado.length > 0
}
function selecionarDuplaSug(nome) {
  modal.d.duplaNome     = nome
  duplaSugestoes.value  = []
  mostrarDuplaSug.value = false
}
function fecharDuplaSug() {
  setTimeout(() => { mostrarDuplaSug.value = false }, 150)
}

const gerado      = ref(false)
const textoGerado = ref('')
const erro        = ref('')
const salvando    = ref(false)

// ── Constantes ──────────────────────────────────────────────────────────────
const vias     = ['VO', 'EV', 'SC', 'IM', 'SNE', 'OFT', 'DERM', 'Sublingual', 'Recusa']
const unidades = ['mg', 'mcg', 'g', 'UI', 'mEq', 'mmol', 'ml', 'Gts', '%', 'mg/kg', 'mcg/kg']
const locaisAnatomicos = {
  IM:  ['Dorso-glúteo D', 'Dorso-glúteo E', 'Vasto lateral D', 'Vasto lateral E', 'Ventro-glúteo D', 'Ventro-glúteo E', 'Deltoide D', 'Deltoide E'],
  SC:  ['Abdômen', 'Coxa D', 'Coxa E', 'Braço D', 'Braço E', 'Glúteo D', 'Glúteo E']
}

// ── Form principal ──────────────────────────────────────────────────────────
const form = reactive({
  horario:       '',
  conferencia:   'com',          // '' | 'com' | 'do'
  orienta:       false,
  conformeTipo:  'prescricao',   // '' | 'prescricao' | 'orientacao'
  conformeNome:  '',
  medicamentos:  [],
  nomePaciente:  '',
  leitoPaciente: ''
})

// ── Rascunho ──────────────────────────────────────────────────────────────
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho(
    'rascunho_medicacao',
    form,
    () => !!(form.horario || form.medicamentos.length > 0)
  )
iniciarRascunho()

// ── Modal ──────────────────────────────────────────────────────────────────
function medVazio() {
  return {
    nome:         '',
    dose:         '',
    unidade:      'mg',
    via:          '',
    // OFT
    oftOlho:      '',
    // EV
    evDiluicao:      false,
    evVolume:        '',
    evSolucao:       'SF',
    evSolucaoCustom: '',
    evBic:        false,
    evTempoH:     '',
    evTempoMin:   '',
    evVelocidade: '',
    // Dupla
    dupla:        false,
    duplaCargo:   'téc. de enfermagem',
    duplaNome:    '',
    // Recusa
    recusaNome:    '',
    // Local anatômico (IM, SC, EV)
    localAnatomico: '',
    // Lote
    loteAtivo:     false,
    loteFrasco:    '',
    lote:          '',
    loteFabricacao:'',
    loteValidade:  '',
    loteMarca:     ''
  }
}

const modal = reactive({
  aberto:  false,
  editIdx: null,
  erro:    '',
  avancado: false,
  d:       medVazio()
})

function abrirModal() {
  modal.d       = medVazio()
  modal.editIdx = null
  modal.erro    = ''
  modal.avancado = false
  modal.aberto  = true
}

function editarMed(i) {
  modal.d       = { ...form.medicamentos[i] }
  modal.editIdx = i
  modal.erro    = ''
  modal.avancado = Boolean(modal.d.dupla || modal.d.loteAtivo)
  modal.aberto  = true
}

function fecharModal() {
  modal.aberto = false
  modal.erro = ''
  mostrarSug.value = false
  sugestoes.value = []
}

function selecionarVia(v) {
  modal.d.via = v
  if (v === 'OFT') modal.d.unidade = 'Gts'
  else if (modal.d.unidade === 'Gts') modal.d.unidade = 'mg'

  if (v !== 'EV') {
    modal.d.evDiluicao = false
    modal.d.evVolume = ''
    modal.d.evSolucao = 'SF'
    modal.d.evSolucaoCustom = ''
    modal.d.evBic = false
    modal.d.evTempoH = ''
    modal.d.evTempoMin = ''
    modal.d.evVelocidade = ''
  }
  if (v !== 'OFT') modal.d.oftOlho = ''
  if (!['IM', 'SC'].includes(v)) modal.d.localAnatomico = ''
  if (v !== 'Recusa') modal.d.recusaNome = ''
}

function selecionarModoEv(comDiluicao) {
  modal.d.evDiluicao = comDiluicao
  if (!comDiluicao) {
    modal.d.evVolume = ''
    modal.d.evSolucao = 'SF'
    modal.d.evSolucaoCustom = ''
  }
}

function alternarBic(ativo) {
  modal.d.evBic = ativo
  if (!ativo) {
    modal.d.evTempoH = ''
    modal.d.evTempoMin = ''
    modal.d.evVelocidade = ''
  }
}

function confirmarMed({ continuar = false } = {}) {
  modal.erro = ''
  const d = modal.d

  if (!d.nome.trim())  { modal.erro = 'Informe o nome do medicamento';      return }
  if (!d.via)          { modal.erro = 'Selecione a via de administração';    return }

  if (d.via === 'Recusa') {
    if (!d.recusaNome.trim()) { modal.erro = 'Informe o nome do profissional comunicado'; return }
  } else if (d.via !== 'DERM') {
    if (!String(d.dose).trim()) { modal.erro = 'Informe a dose'; return }
  }

  if (d.via === 'OFT' && !d.oftOlho) {
    modal.erro = 'Selecione o olho'; return
  }

  if (d.via === 'EV' && d.evDiluicao) {
    if (!d.evVolume)  { modal.erro = 'Informe o volume';    return }
    if (!d.evSolucao) { modal.erro = 'Selecione a solução'; return }
    if (d.evSolucao === 'outra' && !String(d.evSolucaoCustom).trim()) {
      modal.erro = 'Descreva a solução utilizada'; return
    }
  }
  if (d.via === 'EV' && d.evBic && !d.evTempoH && !d.evTempoMin && !d.evVelocidade) {
    modal.erro = 'BIC requer ao menos tempo ou velocidade (ml/h)'; return
  }

  if (d.dupla && !d.duplaNome.trim()) {
    modal.erro = 'Informe o nome do profissional para dupla checagem'; return
  }

  if (d.loteAtivo) {
    if (!d.lote.trim())          { modal.erro = 'Informe o número do lote'; return }
    if (!d.loteFabricacao.trim()){ modal.erro = 'Informe a data de fabricação'; return }
    if (!d.loteValidade.trim())  { modal.erro = 'Informe a data de validade'; return }
    if (!d.loteMarca.trim())     { modal.erro = 'Informe a marca'; return }
  }

  const med = {
    ...d,
    nome: d.nome.trim(),
    dose: String(d.dose ?? '').trim(),
    recusaNome: String(d.recusaNome || '').trim(),
    duplaNome: String(d.duplaNome || '').trim(),
    lote: String(d.lote || '').trim(),
    loteFabricacao: String(d.loteFabricacao || '').trim(),
    loteValidade: String(d.loteValidade || '').trim(),
    loteMarca: String(d.loteMarca || '').trim(),
  }

  if (med.via !== 'EV') {
    med.evDiluicao = false
    med.evVolume = ''
    med.evSolucao = 'SF'
    med.evSolucaoCustom = ''
    med.evBic = false
    med.evTempoH = ''
    med.evTempoMin = ''
    med.evVelocidade = ''
  }
  if (!med.evDiluicao) {
    med.evVolume = ''
    med.evSolucao = 'SF'
    med.evSolucaoCustom = ''
  }
  if (!med.evBic) {
    med.evTempoH = ''
    med.evTempoMin = ''
    med.evVelocidade = ''
  }
  if (med.via !== 'OFT') med.oftOlho = ''
  if (!['IM', 'SC'].includes(med.via)) med.localAnatomico = ''
  if (med.via !== 'Recusa') med.recusaNome = ''
  if (!med.dupla) {
    med.duplaCargo = 'téc. de enfermagem'
    med.duplaNome = ''
  }
  if (!med.loteAtivo) {
    med.loteFrasco = ''
    med.lote = ''
    med.loteFabricacao = ''
    med.loteValidade = ''
    med.loteMarca = ''
  }

  if (modal.editIdx !== null) {
    form.medicamentos[modal.editIdx] = med
  } else {
    form.medicamentos.push(med)
  }

  adicionarAoHistorico(med)
  if (ehPreset(med)) _marcarPresetUsado(med)
  if (med.dupla && med.duplaNome.trim()) _salvarDuplaNome(med.duplaNome.trim())
  if (continuar && modal.editIdx === null) {
    modal.d = { ...medVazio(), ...prepararProximaMedicacao(med) }
    modal.erro = ''
    modal.avancado = false
    sugestoes.value = []
    mostrarSug.value = false
    showToast('Medicamento salvo. Pronto para a próxima.')
    return
  }
  fecharModal()
}

function removerMed(i) {
  form.medicamentos.splice(i, 1)
}

// ── Resumo para o card da lista ─────────────────────────────────────────────
function resumirMed(med) {
  if (med.via === 'Recusa') return `Recusa · Enf. ${med.recusaNome || '?'}`
  if (med.via === 'DERM') return med.dose ? `${med.dose}${med.unidade} · DERM` : 'DERM'
  const un = med.via === 'OFT' ? 'Gts' : med.unidade
  let viaLabel = med.via
  if (med.via === 'EV') {
    viaLabel = med.evDiluicao
      ? (med.evBic ? 'EV BIC' : 'EV diluído')
      : 'EV'
  } else if (med.via === 'OFT' && med.oftOlho) {
    viaLabel = `OFT ${med.oftOlho}`
  }
  if (med.localAnatomico && ['IM', 'SC'].includes(med.via)) {
    viaLabel += ` ${med.localAnatomico}`
  }
  return `${med.dose}${un} · ${viaLabel}`
}

// ── Geração de texto ────────────────────────────────────────────────────────

// Retorna apenas a parte "nome dose via" de um medicamento (sem horário nem conforme)
function gerarParteMed(med) {
  const un      = med.via === 'OFT' ? 'Gts' : med.unidade
  const doseStr = med.dose ? `${med.dose}${un} ` : ''

  // DERM: sem dose obrigatória
  if (med.via === 'DERM') {
    const prefixoFrasco = med.loteAtivo && med.loteFrasco ? `o ${med.loteFrasco}° Frasco de ` : ''
    return `${prefixoFrasco}${med.nome.toLowerCase()} ${doseStr}DERM`.trimEnd()
  }

  let viaTexto = ''
  if (med.via === 'VO')           viaTexto = 'VO'
  else if (med.via === 'SC')      viaTexto = 'SC'
  else if (med.via === 'IM')      viaTexto = 'IM'
  else if (med.via === 'SNE')     viaTexto = 'via SNE'
  else if (med.via === 'Sublingual') viaTexto = 'sublingual'
  else if (med.via === 'OFT') {
    const olhoTexto = med.oftOlho === 'ambos' ? 'em ambos os olhos' : `olho ${med.oftOlho}`
    viaTexto = `OFT ${olhoTexto}`
  }
  else if (med.via === 'EV') {
    if (!med.evDiluicao) {
      if (med.evBic) {
        const tempoStr = _formatarTempo(med.evTempoH, med.evTempoMin)
        let infStr = ''
        if (tempoStr && med.evVelocidade) {
          infStr = `em ${tempoStr} a ${med.evVelocidade}ml/h`
        } else if (tempoStr) {
          infStr = `em ${tempoStr}`
        } else if (med.evVelocidade) {
          infStr = `a ${med.evVelocidade}ml/h`
        }
        viaTexto = `EV em BIC para infundir ${infStr}`
      } else {
        viaTexto = 'EV'
      }
    } else {
      const sol = med.evSolucao === 'SF'    ? 'SF 0,9%'
                : med.evSolucao === 'SG'    ? 'SG 5%'
                : med.evSolucao === 'outra' ? (med.evSolucaoCustom || 'outra solução')
                : 'água destilada'
      if (med.evBic) {
        // BIC: [dose] + [vol]ml [sol] EV em BIC para infundir [tempo] [vel]
        const tempoStr = _formatarTempo(med.evTempoH, med.evTempoMin)
        let infStr = ''
        if (tempoStr && med.evVelocidade) {
          infStr = `em ${tempoStr} a ${med.evVelocidade}ml/h`
        } else if (tempoStr) {
          infStr = `em ${tempoStr}`
        } else if (med.evVelocidade) {
          infStr = `a ${med.evVelocidade}ml/h`
        }
        // viaTexto começa com + pois o nome/dose já vem antes no template
        viaTexto = `+ ${med.evVolume}ml ${sol} EV em BIC para infundir ${infStr}`
      } else {
        // Diluição simples sem BIC: [dose] EV + [vol]ml [sol]
        viaTexto = `EV + ${med.evVolume}ml ${sol}`
      }
    }
  }

  const prefixoFrasco = med.loteAtivo && med.loteFrasco
    ? `o ${med.loteFrasco}° Frasco de `
    : ''

  const localStr = med.localAnatomico && ['IM', 'SC'].includes(med.via)
    ? ` no ${med.localAnatomico.charAt(0).toLowerCase() + med.localAnatomico.slice(1)}`
    : ''

  return `${prefixoFrasco}${med.nome.toLowerCase()} ${doseStr}${viaTexto}${localStr}`
}

function gerarLinhaDupla(med) {
  const un      = med.via === 'OFT' ? 'Gts' : med.unidade
  const doseStr = `${med.dose}${un}`

  // Via simplificada para texto da dupla
  let viaSimples = med.via
  if (med.via === 'EV')  viaSimples = med.evDiluicao ? 'EV' : 'EV em bolus'
  if (med.via === 'OFT') viaSimples = `OFT olho ${med.oftOlho}`
  if (med.via === 'SNE') viaSimples = 'via SNE'
  if (med.via === 'Sublingual') viaSimples = 'sublingual'

  const cargoStr = med.duplaCargo.trim() ? `${med.duplaCargo.trim()} ` : ''
  return `Realizado dupla checagem de ${med.nome.toLowerCase()} ${doseStr} ${viaSimples} com ${cargoStr}${med.duplaNome.trim()}.`
}

function gerar() {
  erro.value = ''
  if (!form.horario) {
    erro.value = 'Informe o horário.'
    return
  }
  textoGerado.value = gerarTextoMedicacao(form)
  gerado.value      = true
  return

  const h = form.horario.replace(':', 'h')

  let conformeTexto = ''
  if (form.conformeTipo === 'prescricao') {
    conformeTexto = ' conforme prescrição médica'
  } else if (form.conformeTipo === 'orientacao') {
    conformeTexto = ` conforme orientação do ${form.conformeNome.trim()}`
  }

  // Monta as linhas de conteúdo (sem prefixo de horário ainda)
  const conteudo = []

  const confTextos = {
    'com': 'Realizado conferência de identificação com paciente.',
    'do':  'Realizado conferência de identificação do paciente.'
  }
  if (form.conferencia && confTextos[form.conferencia]) {
    conteudo.push(confTextos[form.conferencia])
  }

  if (form.orienta) {
    conteudo.push('Oriento paciente, que autoriza realização de medicação prescrita.')
  }

  // Meds administrados (excluindo recusas)
  const medsAdm = form.medicamentos.filter(m => m.via !== 'Recusa')
  if (medsAdm.length > 0) {
    const partes = medsAdm.map(gerarParteMed)
    const medStr = partes.length === 1
      ? partes[0]
      : partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1]
    conteudo.push(`administrado ${medStr}${conformeTexto}`)
  }

  // O horário prefixia APENAS a primeira linha; as demais ficam sem ele
  const linhas = conteudo.map((linha, i) =>
    i === 0 ? `${h} – ${linha}` : linha
  )

  // Recusas: agrupar por profissional → uma linha por Enf.
  const recusas = form.medicamentos.filter(m => m.via === 'Recusa')
  const recusasPorProf = {}
  for (const med of recusas) {
    const prof = med.recusaNome.trim()
    if (!recusasPorProf[prof]) recusasPorProf[prof] = []
    recusasPorProf[prof].push(med.nome.toLowerCase())
  }
  for (const prof of Object.keys(recusasPorProf)) {
    const nomes = recusasPorProf[prof]
    const nomesStr = nomes.length === 1
      ? nomes[0]
      : nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
    linhas.push(`Paciente recusa ${nomesStr} prescrito, comunico Enf. ${prof}`)
  }

  // Dupla checagem: linhas extras sem prefixo de horário
  for (const med of form.medicamentos) {
    if (med.dupla && med.duplaNome.trim()) {
      linhas.push(gerarLinhaDupla(med))
    }
  }

  // Lote / validade: bloco após a anotação principal
  for (const med of form.medicamentos) {
    if (med.loteAtivo && med.lote.trim()) {
      linhas.push(`Número do Lote: ${med.lote.trim()}`)
      if (med.loteFabricacao.trim()) linhas.push(`Fabricação: ${med.loteFabricacao.trim()}`)
      if (med.loteValidade.trim())   linhas.push(`Validade: ${med.loteValidade.trim()}`)
      if (med.loteMarca.trim())      linhas.push(`Marca: ${med.loteMarca.trim()}`)
    }
  }

  textoGerado.value = linhas.join('\n')
  gerado.value      = true
}

// ── Ações de resultado ──────────────────────────────────────────────────────
async function copiar() {
  const ok = await _copiar(textoGerado.value)
  if (ok) showToast('Texto copiado!')
  else showToast('Erro ao copiar')
}

async function salvar() {
  salvando.value = true
  try {
    const r = await store.salvar({
      tipo:  'medicacao',
      texto: textoGerado.value,
      nome:  form.nomePaciente.trim(),
      leito: form.leitoPaciente.trim()
    })
    if (r?.modo === 'offline') showToast('Salvo offline - sincroniza automatico')
    else showToast('Salvo no histórico!')
    descartarRascunho()
  } catch {
    showToast('Erro ao salvar')
  } finally {
    salvando.value = false
  }
}

function compartilhar() {
  const texto = textoGerado.value
  if (navigator.share) {
    navigator.share({ text: texto }).catch(() => {})
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank')
  }
}

function novaAnotacao() {
  Object.assign(form, {
    horario:      '',
    conferencia:  'com',
    orienta:      false,
    conformeTipo: 'prescricao',
    conformeNome: '',
    medicamentos: [],
    nomePaciente:  '',
    leitoPaciente: ''
  })
  erro.value   = ''
  gerado.value = false
  descartarRascunho()
}
</script>

<style scoped>
/* ── Header ── */
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

.med-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.med-card-medicamentos {
  border-color: rgba(30, 136, 229, 0.24);
  background: linear-gradient(180deg, rgba(30, 136, 229, 0.07), rgba(17, 29, 50, 1));
}

.med-quick-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.med-quick-block {
  background: rgba(10, 22, 40, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 12px;
}

.med-quick-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.med-quick-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text);
}

.med-quick-note {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.med-quick-scroll {
  margin-top: 0;
}

.chip-quick {
  border-color: rgba(30, 136, 229, 0.35);
  background: rgba(30, 136, 229, 0.12);
}

.med-section-head {
  margin-bottom: 14px;
}

.med-section-head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.med-section-kicker {
  display: inline-block;
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.med-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.med-section-sub {
  margin-top: 4px;
  font-size: 0.82rem;
  color: var(--text-dim);
  line-height: 1.45;
}

.med-section-sub-tight {
  margin-bottom: 14px;
}

.med-count {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(30, 136, 229, 0.16);
  border: 1px solid rgba(30, 136, 229, 0.28);
  color: var(--blue);
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.med-choice {
  background: rgba(10, 22, 40, 0.48);
}

.med-choice.checked {
  background: rgba(30, 136, 229, 0.12);
  color: var(--text);
}

.med-choice-spaced {
  margin-top: 8px;
}

/* ── Lista de meds ── */
.lista-vazia {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 12px;
}

.med-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.med-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
}

.med-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.med-nome {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.med-detalhe {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.badge-dupla {
  font-size: 0.68rem;
  color: var(--blue);
  background: rgba(41,98,255,0.12);
  border-radius: 5px;
  padding: 2px 6px;
  width: fit-content;
}

.med-item-acoes {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.btn-icon-sm {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1;
  transition: all 0.15s;
}
.btn-icon-sm:active { background: var(--bg-hover); }
.btn-danger-sm:active { color: var(--danger); border-color: var(--danger); }

.btn-favorite-on {
  color: #f4c95d;
  border-color: rgba(244, 201, 93, 0.4);
}

/* ── Botão adicionar medicamento ── */
.btn-add-med {
  width: 100%;
  padding: 12px;
  background: var(--bg-input);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--blue);
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-add-med:active {
  background: var(--bg-hover);
  border-style: solid;
}

/* ── Chips ── */
.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.chip {
  padding: 9px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.15s;
}
.chip.ativo {
  background: rgba(41,98,255,0.15);
  border-color: var(--blue);
  color: var(--blue);
  font-weight: 600;
}
.chip:not(.ativo):active { background: var(--bg-hover); }

.chip-sm {
  padding: 7px 12px;
  font-size: 0.85rem;
}

/* ── Input suffix ── */
.input-suffix-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-suffix-wrap input {
  width: 100%;
  padding: 13px 52px 13px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  -webkit-appearance: none;
  transition: border-color 0.2s;
}
.input-suffix-wrap input:focus { border-color: var(--blue); }
.input-suffix {
  position: absolute;
  right: 14px;
  color: var(--text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}

/* ── Hint ── */
.hint-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ── campo-inline ── */
.campo-inline {
  width: 100%;
  box-sizing: border-box;
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
select.campo-inline {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

/* ── label-small ── */
.label-small {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

/* ── Preview ── */
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

/* ── Erro ── */
.erro-msg {
  color: var(--red);
  font-size: 0.9rem;
  margin: 8px 0 0;
}

/* ── Modal ── */
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
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.modal-header h3 { font-size: 1.05rem; font-weight: 700; color: var(--text); }
.modal-body {
  overflow-y: auto;
  padding: 16px 20px;
  flex: 1;
}
.modal-footer {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 10px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.campo-avancado {
  margin-top: 2px;
}

.btn-avancado {
  width: 100%;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  cursor: pointer;
}

.btn-avancado:active {
  background: rgba(255, 255, 255, 0.07);
}

/* ── Autocomplete ── */
.autocomplete-wrap {
  position: relative;
}
.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  z-index: 300;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.35);
}
.autocomplete-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  gap: 8px;
  font-family: inherit;
  transition: background 0.1s;
}
.autocomplete-item:last-child { border-bottom: none; }
.autocomplete-item:active,
.autocomplete-item:hover { background: var(--bg-hover); }
.autocomplete-nome {
  font-size: 0.92rem;
  color: var(--text);
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.autocomplete-badge {
  font-size: 0.72rem;
  color: var(--blue);
  background: rgba(41,98,255,0.12);
  border-radius: 5px;
  padding: 2px 7px;
  white-space: nowrap;
  flex-shrink: 0;
}
.autocomplete-hint {
  font-size: 0.85rem;
  flex-shrink: 0;
  opacity: 0.5;
}

/* Toast global — ver App.vue + style.css */
/* Rascunho banner global — ver style.css */

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
</style>
