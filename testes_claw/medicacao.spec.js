import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper: faz login com o código QA99 (cria conta na primeira vez, loga nas seguintes)
async function fazerLogin(page) {
  await page.goto(BASE_URL);

  // Passo 1: código
  await page.getByTestId('input-codigo').fill('QA99');
  // Aguarda Firebase verificar se código existe antes de habilitar o botão
  await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 });
  await page.getByTestId('btn-continuar-passo1').click();

  // Passo 2: PIN — aguarda tela aparecer
  await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 });
  const tituloPasso2 = await page.getByTestId('titulo-passo2').innerText();
  const ehNovo = tituloPasso2.includes('Crie');

  await page.getByTestId('input-pin').fill('1234');

  if (ehNovo) {
    // Cadastro: avança para passo 3 (nome)
    await page.getByTestId('btn-continuar-passo2').click();
    await page.getByTestId('titulo-passo3').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByTestId('input-nome').fill('QA Anotacoes');
    await page.getByTestId('btn-entrar').click();
  } else {
    // Login: passo 2 já finaliza
    await page.getByTestId('btn-continuar-passo2').click();
  }

  // Aguarda Dashboard carregar
  await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 12000 });
}

test.describe('4. MEDICAÇÃO (NOVA FEATURE)', () => {

  test.beforeEach(async ({ page }) => {
    await fazerLogin(page);
    // Navega para a tela de medicação (rota correta: /anotar/medicacao)
    await page.goto(BASE_URL + '/anotar/medicacao');
    // Aguarda o campo de horário aparecer como confirmação da tela carregada
    await page.getByTestId('auto-input-anotacaomedicacaoview-1').waitFor({ state: 'visible', timeout: 8000 });
  });

  // ─── 4.1 INTERFACE PRINCIPAL ────────────────────────────────────────────────

  test('4.1 Interface Principal — campos visíveis e validação sem horário', async ({ page }) => {
    // Campos principais devem estar visíveis
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-1')).toBeVisible(); // Horário
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-2')).toBeVisible(); // Radio "com"
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-3')).toBeVisible(); // Radio "do"
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-4')).toBeVisible(); // Checkbox orienta
    await expect(page.getByTestId('auto-btn-anotacaomedicacaoview-7')).toBeVisible();   // Botão "+ Adicionar medicamento"

    // Tentar gerar sem horário e sem medicamentos → deve mostrar erro (não avança para preview)
    await page.getByTestId('auto-btn-anotacaomedicacaoview-8').click(); // Gerar
    // Botão "Copiar" do preview NÃO deve aparecer (ficou no formulário com erro)
    await expect(page.getByTestId('auto-btn-anotacaomedicacaoview-9')).not.toBeVisible();
  });

  // ─── 4.2 MODAL DE ADIÇÃO/EDIÇÃO ─────────────────────────────────────────────

  test('4.2 Modal — abertura, campos e validação de campos obrigatórios', async ({ page }) => {
    // Abrir modal
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();

    // Campo nome do medicamento deve aparecer dentro do modal
    const inputNome = page.getByTestId('auto-input-anotacaomedicacaoview-10');
    await expect(inputNome).toBeVisible({ timeout: 3000 });

    // Tentar confirmar com o formulário vazio → modal deve continuar aberto (erro)
    await page.getByTestId('auto-btn-anotacaomedicacaoview-25').click(); // Confirmar
    // Modal continua visível (não fechou por conta da validação)
    await expect(inputNome).toBeVisible();
  });

  test('4.2 Autocomplete — digitar ≥ 2 caracteres exibe sugestões', async ({ page }) => {
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });

    // Digitar 2+ caracteres deve mostrar dropdown de sugestões
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('di');
    // Pelo menos 1 sugestão deve aparecer (dipirona está na base de 450 meds)
    await expect(page.locator('[data-testid="auto-btn-anotacaomedicacaoview-15"]').first()).toBeVisible({ timeout: 3000 });

    // Digitar menos de 2 caracteres → sugestões somem
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('d');
    await expect(page.locator('[data-testid="auto-btn-anotacaomedicacaoview-15"]').first()).not.toBeVisible();
  });

  // ─── 4.3 VIAS DE ADMINISTRAÇÃO ──────────────────────────────────────────────

  test('4.3 Via OFT — exige seleção de olho', async ({ page }) => {
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });

    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('Tobramicina');
    // Selecionar via OFT
    await page.getByRole('button', { name: 'OFT' }).click();
    // Deve aparecer a seleção de olho
    await expect(page.getByRole('button', { name: 'direito' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'esquerdo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ambos' })).toBeVisible();
  });

  test('4.3 Via EV — exibe checkbox de diluição', async ({ page }) => {
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });

    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('Omeprazol');
    // Selecionar via EV
    await page.getByRole('button', { name: 'EV' }).click();
    // Checkbox "Com diluição" deve aparecer
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-13')).toBeVisible();
  });

  test('4.3 Via EV com diluição — exibe campos de volume, solução e BIC', async ({ page }) => {
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });

    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('Amoxicilina');
    await page.getByRole('button', { name: 'EV' }).click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-13').check(); // Com diluição

    // Campos de volume e solução devem aparecer
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-14')).toBeVisible(); // Volume ml
    await expect(page.getByTestId('auto-btn-anotacaomedicacaoview-19')).toBeVisible();   // SF 0,9%
    await expect(page.getByTestId('auto-btn-anotacaomedicacaoview-20')).toBeVisible();   // SG 5%
    await expect(page.getByTestId('auto-btn-anotacaomedicacaoview-21')).toBeVisible();   // Água destilada

    // Checkbox BIC deve aparecer
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-15')).toBeVisible();

    // Marcar BIC → campos de tempo e velocidade aparecem
    await page.getByTestId('auto-input-anotacaomedicacaoview-15').check();
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-16')).toBeVisible(); // Tempo
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-17')).toBeVisible(); // Velocidade
  });

  // ─── 4.4 DUPLA CHECAGEM ─────────────────────────────────────────────────────

  test('4.4 Dupla Checagem — checkbox exibe campo de nome do profissional', async ({ page }) => {
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });

    // Marcar dupla checagem
    await page.getByTestId('auto-input-anotacaomedicacaoview-18').check();

    // Campo nome do profissional deve aparecer
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-19')).toBeVisible();
  });

  // ─── 4.5 GERAÇÃO DE TEXTO ───────────────────────────────────────────────────

  test('4.5 Geração — fluxo completo VO e preview com Copiar', async ({ page }) => {
    // Preenche horário
    await page.getByTestId('auto-input-anotacaomedicacaoview-1').fill('10:00');

    // Adiciona medicamento VO
    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('Dipirona');
    await page.getByRole('button', { name: 'VO' }).click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-11').fill('500');
    await page.getByRole('button', { name: 'mg' }).click();
    await page.getByTestId('auto-btn-anotacaomedicacaoview-25').click(); // Confirmar

    // Modal deve fechar (input nome some)
    await expect(page.getByTestId('auto-input-anotacaomedicacaoview-10')).not.toBeVisible({ timeout: 3000 });

    // Gerar texto
    await page.getByTestId('auto-btn-anotacaomedicacaoview-8').click();

    // Preview deve aparecer com botão "Copiar"
    await expect(page.getByTestId('auto-btn-anotacaomedicacaoview-9')).toBeVisible({ timeout: 3000 });
  });

  test('4.5 Geração — texto contém horário e nome do medicamento', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaomedicacaoview-1').fill('08:30');

    await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('Omeprazol');
    await page.getByRole('button', { name: 'EV' }).click();
    await page.getByTestId('auto-input-anotacaomedicacaoview-11').fill('40');
    await page.getByRole('button', { name: 'mg' }).click();
    await page.getByTestId('auto-btn-anotacaomedicacaoview-25').click();

    await page.getByTestId('auto-btn-anotacaomedicacaoview-8').click();

    // O texto gerado deve conter o horário e o nome da medicação
    const preview = page.locator('.preview-box p').first();
    await expect(preview).toBeVisible({ timeout: 3000 });
    const texto = await preview.innerText();
    expect(texto).toContain('08:30');
    expect(texto.toLowerCase()).toContain('omeprazol');
  });

});
