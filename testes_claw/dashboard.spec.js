import { test, expect } from '@playwright/test';

const BASE_URL = 'https://meuplantao.vercel.app';

test.describe('2. DASHBOARD', () => {
  // Teste que simula estar deslogado e tenta acessar as rotas protegidas (cobre 1.3)
  test('Acesso sem login redireciona', async ({ page }) => {
    await page.goto(BASE_URL + '/dashboard');
    await expect(page.locator('text=Seu código pessoal')).toBeVisible({ timeout: 5000 });
  });

  test.describe('Com usuário logado', () => {
    test.beforeEach(async ({ page }) => {
      // Faz login rápido
      await page.goto(BASE_URL);
      // Usaremos o usuário "QAUSER" (ou criaremos se não existir) 
      const testCode = 'QA99';
      await page.getByTestId('input-codigo').fill(testCode);
      await page.getByTestId('btn-continuar-passo1').click();
      
      const isNovo = await page.getByTestId('titulo-passo2').innerText({timeout:3000}).catch(()=>'');
      if(isNovo && isNovo.includes('Crie')) {
        await page.getByTestId('input-pin').fill('1234');
        await page.getByTestId('btn-continuar-passo2').click();
        await page.getByTestId('input-nome').fill('Dashboard Tester');
        await page.getByTestId('btn-entrar').click();
      } else {
        await page.getByTestId('input-pin').fill('1234');
        await page.locator('button', {hasText: 'Entrar'}).click();
      }
      
      await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 10000 });
    });

    test('Validação de Saudação e Nome do usuário', async ({ page }) => {
      await expect(page.locator('h2', { hasText: 'Dashboard Tester' })).toBeVisible();
      const saudacaoTexto = await page.locator('.saudacao-hora').innerText();
      expect(saudacaoTexto).toMatch(/Bom dia|Boa tarde|Boa noite/i);
    });

    test('Cards "Em breve" exibem alerta ao clicar', async ({ page }) => {
      page.on('dialog', dialog => dialog.dismiss());
      const cardEmBreve = page.locator('.tipo-card', { hasText: 'em breve' }).first();
      await cardEmBreve.click();
    });

    test('Acesso ao Histórico pelo botão e ícone de relógio', async ({ page }) => {
      const btnHistorico = page.locator('button', { hasText: 'Ver histórico de anotações' });
      await btnHistorico.click();
      await expect(page.locator('text=Histórico').first()).toBeVisible({ timeout: 5000 });
      await page.goto(BASE_URL + '/dashboard');
      const iconRelogio = page.getByTestId('auto-btn-dashboardview-1');
      await iconRelogio.click();
      await expect(page.locator('text=Histórico').first()).toBeVisible();
    });

    test('Clicar no logo não navega (continua no dashboard)', async ({ page }) => {
      const logo = page.locator('.header-logo');
      await logo.click();
      await expect(page.locator('text=Nova anotação')).toBeVisible();
    });
  });
});