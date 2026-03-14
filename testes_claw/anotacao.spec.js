import { test, expect } from '@playwright/test';

const BASE_URL = 'https://meuplantao.vercel.app';

test.describe('3. ANOTAÇÃO INICIAL - FLUXO GERAL', () => {

  test.beforeEach(async ({ page }) => {
    // Faz login rápido para acessar as rotas de anotação
    await page.goto(BASE_URL);
    await page.getByTestId('input-codigo').fill('QA99');
    await page.getByTestId('btn-continuar-passo1').click();
    
    // Testa se está criando novo usuário ou entrando com existente
    const passo2Titulo = page.getByTestId('titulo-passo2');
    await passo2Titulo.waitFor({ state: 'visible', timeout: 5000 });
    const isNovo = await passo2Titulo.innerText();
    
    if(isNovo.includes('Crie')) {
      await page.getByTestId('input-pin').fill('1234');
      await page.getByTestId('btn-continuar-passo2').click();
      await page.getByTestId('input-nome').fill('QA Anotacoes');
      await page.locator('button', {hasText: 'Criar conta e entrar'}).click();
    } else {
      await page.getByTestId('input-pin').fill('1234');
      await page.locator('button', {hasText: 'Entrar'}).click();
    }
    
    // Aguarda carregar o Dashboard e clica no card "Anotação inicial"
    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 10000 });
    const cardAnotacao = page.locator('.tipo-card', { hasText: 'Anotação inicial' });
    await cardAnotacao.click();
    
    // Aguarda a tela de anotação carregar
    await expect(page.locator('text=Bloco 1')).toBeVisible({ timeout: 5000 });
  });

  test('3.1 e 3.2 Barra de progresso e Navegação entre blocos', async ({ page }) => {
    // Bloco 1 de 5
    await expect(page.locator('text=Bloco 1 de 5')).toBeVisible();

    // Tentar avançar sem preencher (vai dar erro pois horário e sexo são obrigatórios no bloco 1)
    const btnProximo = page.locator('button', { hasText: 'Próximo' });
    await btnProximo.click();
    
    // Deve continuar no bloco 1
    await expect(page.locator('text=Bloco 1 de 5')).toBeVisible();

    // Preenche Horário (ex: 12:00) e Sexo (M) para conseguir avançar
    // (Ajuste os seletores dependendo de como o HTML dos inputs foi gerado)
    await page.locator('input[type="time"]').fill('12:00');
    await page.locator('button', { hasText: 'M', exact: true }).click();
    
    // Avançar para Bloco 2
    await btnProximo.click();
    await expect(page.locator('text=Bloco 2 de 5')).toBeVisible();

    // Voltar para Bloco 1 (usando o botão voltar no header)
    const btnVoltarHeader = page.locator('header button').first();
    await btnVoltarHeader.click();
    await expect(page.locator('text=Bloco 1 de 5')).toBeVisible();

    // Botão Limpar deve resetar campos
    const btnLimpar = page.locator('button', { hasText: 'Limpar' });
    await btnLimpar.click();
    
    // O valor do input time deve estar vazio
    await expect(page.locator('input[type="time"]')).toHaveValue('');
  });

  test('3.3 Rascunho automático', async ({ page }) => {
    // Preenche algo no bloco 1
    await page.locator('input[type="time"]').fill('10:00');
    
    // Espera ~1 segundo para o debounce do rascunho automático salvar no localStorage
    await page.waitForTimeout(1200);

    // Navegar para outra tela (ex: dashboard)
    await page.goto(BASE_URL + '/dashboard');
    await expect(page.locator('text=Nova anotação')).toBeVisible();

    // Voltar para a tela de anotação inicial
    const cardAnotacao = page.locator('.tipo-card', { hasText: 'Anotação inicial' });
    await cardAnotacao.click();

    // Deve aparecer o banner de rascunho salvo
    const bannerRascunho = page.locator('text=Você tem um rascunho salvo');
    await expect(bannerRascunho).toBeVisible();

    // Botão "Continuar" restaura
    const btnContinuarRascunho = page.locator('button', { hasText: 'Continuar' });
    await btnContinuarRascunho.click();

    // O horário deve estar preenchido com '10:00'
    await expect(page.locator('input[type="time"]')).toHaveValue('10:00');

    // Voltar pro dashboard de novo para testar o "Descartar"
    await page.goto(BASE_URL + '/dashboard');
    await cardAnotacao.click();
    await expect(bannerRascunho).toBeVisible();

    // Descartar rascunho
    const btnDescartar = page.locator('button', { hasText: 'Descartar' });
    await btnDescartar.click();

    // Banner some e input fica vazio
    await expect(bannerRascunho).toBeHidden();
    await expect(page.locator('input[type="time"]')).toHaveValue('');
  });
});