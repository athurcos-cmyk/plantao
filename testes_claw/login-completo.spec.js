import { test, expect } from '@playwright/test';

test.describe('1.2 e 1.3 - Autenticação Completa e Sessão', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://meuplantao.vercel.app');
  });

  test('Criar conta real e fazer logout', async ({ page }) => {
    // Vamos criar uma conta de verdade agora para testar o fluxo completo
    const randomCode = 'QA' + Math.floor(Math.random() * 9999);
    
    // Passo 1: Código
    await page.getByTestId('input-codigo').fill(randomCode);
    await expect(page.getByTestId('msg-cadastro')).toBeVisible();
    await page.getByTestId('btn-continuar-passo1').click();

    // Passo 2: PIN
    await page.getByTestId('input-pin').fill('1234');
    await page.getByTestId('btn-continuar-passo2').click();

    // Passo 3: Nome
    await page.getByTestId('input-nome').fill('Engenheiro QA');
    
    // CLICAR EM CRIAR CONTA DE VERDADE
    await page.locator('button', { hasText: 'Criar conta e entrar' }).click();

    // Redirecionamento para o Dashboard
    // Esperamos ver "Nova anotação" e a saudação
    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 10000 });
    
    // Validar se o nome aparece no dashboard
    await expect(page.locator('h2', { hasText: 'Engenheiro QA' })).toBeVisible();

    // Testar Logout (1.3 Sessão)
    // Clicar em Sair da conta
    await page.locator('button', { hasText: 'Sair da conta' }).click();
    
    // O modal de confirmação de saída do seu app deve aparecer (se houver) ou deslogar direto
    // Como seu app pode ter um SweetAlert ou modal nativo, vamos aguardar a tela de login voltar
    await expect(page.locator('text=Seu código pessoal')).toBeVisible({ timeout: 8000 });
  });

  test('Login - Usuário existente', async ({ page }) => {
    // Primeiro criamos um usuário via UI rapidamente para ter certeza que existe
    const knownUser = 'QAUSER';
    const knownPin = '9999';

    await page.getByTestId('input-codigo').fill(knownUser);
    
    // Esperar verificação do Firebase (pode ser cadastro ou login)
    // Se for cadastro, a gente cria. Se for login, a gente entra.
    // Vamos interceptar a UI
    const isNovo = await page.getByTestId('msg-cadastro').isVisible({timeout: 3000}).catch(() => false);
    
    if (isNovo) {
        await page.getByTestId('btn-continuar-passo1').click();
        await page.getByTestId('input-pin').fill(knownPin);
        await page.getByTestId('btn-continuar-passo2').click();
        await page.locator('button', { hasText: 'Criar conta e entrar' }).click();
        await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 8000 });
        await page.locator('button', { hasText: 'Sair da conta' }).click();
        await expect(page.locator('text=Seu código pessoal')).toBeVisible({ timeout: 8000 });
        
        // Voltar para a tela inicial para testar o login de fato
        await page.goto('/');
        await page.getByTestId('input-codigo').fill(knownUser);
    }

    // Agora é certeza que o usuário existe (Login)
    await expect(page.getByTestId('msg-login')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('btn-continuar-passo1').click();

    // Digitar PIN incorreto
    await page.getByTestId('input-pin').fill('0000');
    await page.locator('button', { hasText: 'Entrar' }).click();
    
    // Deve dar erro de PIN
    await expect(page.locator('text=PIN incorreto')).toBeVisible({ timeout: 5000 });

    // Digitar PIN correto
    await page.getByTestId('input-pin').fill(knownPin);
    await page.locator('button', { hasText: 'Entrar' }).click();

    // Deve logar
    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 8000 });
  });
});
