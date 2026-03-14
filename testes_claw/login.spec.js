import { test, expect } from '@playwright/test';

test.describe('1. AUTENTICAÇÃO - Login', () => {
  test.beforeEach(async ({ page }) => {
    // Acessa a URL principal
    await page.goto('/');
  });

  test('1.1 Login — Novo usuário: Validar código curto e botão bloqueado', async ({ page }) => {
    const btnContinuar = page.getByTestId('btn-continuar-passo1');
    const inputCodigo = page.getByTestId('input-codigo');

    // Botão "Continuar" fica desabilitado inicialmente
    await expect(btnContinuar).toBeDisabled();

    // Digitar código com menos de 3 caracteres
    await inputCodigo.fill('AB');
    
    // O botão deve continuar desabilitado
    await expect(btnContinuar).toBeDisabled();
    
    // Não deve mostrar mensagem de cadastro
    await expect(page.getByTestId('msg-cadastro')).toBeHidden();
  });

  test('1.1 Login — Novo usuário: Validar código válido', async ({ page }) => {
    const btnContinuar = page.getByTestId('btn-continuar-passo1');
    const inputCodigo = page.getByTestId('input-codigo');

    // Gerar um código aleatório
    const randomCode = 'TST' + Math.floor(Math.random() * 99);
    
    // Preencher o código
    await inputCodigo.fill(randomCode);
    
    // Aguardar Firebase check
    await expect(page.getByTestId('msg-cadastro')).toBeVisible({ timeout: 5000 });
    
    // Botão "Continuar" fica habilitado
    await expect(btnContinuar).toBeEnabled();
  });

  test('1.1 Login — Novo usuário: Navegação entre os passos de cadastro', async ({ page }) => {
    const inputCodigo = page.getByTestId('input-codigo');
    const randomCode = 'TST' + Math.floor(Math.random() * 999);
    
    await inputCodigo.fill(randomCode);
    await expect(page.getByTestId('msg-cadastro')).toBeVisible();
    
    const btnContinuar = page.getByTestId('btn-continuar-passo1');
    await btnContinuar.click();

    // Passo 2: O cabeçalho deve mudar
    await expect(page.getByTestId('titulo-passo2')).toBeVisible();
    
    // Campo PIN
    const inputPin = page.getByTestId('input-pin');
    await expect(inputPin).toBeVisible();

    // Deve mostrar "2 de 3"
    await expect(page.getByTestId('step-indicador')).toHaveText('2 de 3');

    // Preencher PIN incompleto
    await inputPin.fill('12');
    const btnPinContinuar = page.getByTestId('btn-continuar-passo2');
    await expect(btnPinContinuar).toBeDisabled();

    // Preencher PIN completo
    await inputPin.fill('1234');
    await expect(btnPinContinuar).toBeEnabled();
    
    // Avançar para passo 3
    await btnPinContinuar.click();
    
    // Passo 3: Nome
    await expect(page.getByTestId('titulo-passo3')).toBeVisible();
    await expect(page.getByTestId('step-indicador')).toHaveText('3 de 3');
    
    // Botão voltar do passo 3
    await page.getByTestId('btn-voltar-passo3').click();
    
    // Voltou pro passo 2
    await expect(page.getByTestId('titulo-passo2')).toBeVisible();
  });
});
