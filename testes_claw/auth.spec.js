import { test, expect } from '@playwright/test'
import { TEST_CODE, TEST_PIN, BASE_URL } from './helpers/login.js'

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTENTICAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1. Autenticação', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  // ── 1.1 Validação do campo de código ───────────────────────────────────────

  test('1.1 Botão desabilitado com menos de 3 caracteres', async ({ page }) => {
    await page.getByTestId('input-codigo').fill('AB')
    await expect(page.getByTestId('btn-continuar-passo1')).toBeDisabled()
  })

  test('1.1 Botão desabilitado com campo vazio', async ({ page }) => {
    await expect(page.getByTestId('btn-continuar-passo1')).toBeDisabled()
  })

  test('1.1 Código converte para maiúsculas automaticamente', async ({ page }) => {
    await page.getByTestId('input-codigo').fill('abc1')
    const valor = await page.getByTestId('input-codigo').inputValue()
    expect(valor).toBe('ABC1')
  })

  test('1.1 Código com 6+ caracteres é truncado ou bloqueado', async ({ page }) => {
    await page.getByTestId('input-codigo').fill('ABCDEFG')
    const valor = await page.getByTestId('input-codigo').inputValue()
    expect(valor.length).toBeLessThanOrEqual(6)
  })

  // ── 1.2 Login — usuário existente (TESTE1) ─────────────────────────────────

  test('1.2 Código existente exibe destaque "Bem-vindo de volta"', async ({ page }) => {
    await page.getByTestId('input-codigo').fill(TEST_CODE)
    await expect(page.getByTestId('msg-login')).toBeVisible({ timeout: 8000 })
  })

  test('1.2 PIN incorreto exibe mensagem de erro', async ({ page }) => {
    await page.getByTestId('input-codigo').fill(TEST_CODE)
    await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 })
    await page.getByTestId('btn-continuar-passo1').click()
    await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 })

    await page.getByTestId('input-pin').fill('0000')
    await page.getByTestId('btn-continuar-passo2').click()

    // Deve aparecer mensagem de erro (não redireciona)
    await expect(page.locator('.erro-msg')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Nova anotação')).not.toBeVisible()
  })

  test('1.2 PIN correto redireciona para o Dashboard', async ({ page }) => {
    await page.getByTestId('input-codigo').fill(TEST_CODE)
    await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 })
    await page.getByTestId('btn-continuar-passo1').click()
    await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 })

    await page.getByTestId('input-pin').fill(TEST_PIN)
    await page.getByTestId('btn-continuar-passo2').click()

    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 12000 })
  })

  test('1.2 Passo 2 — botão desabilitado com PIN < 4 dígitos', async ({ page }) => {
    await page.getByTestId('input-codigo').fill(TEST_CODE)
    await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 })
    await page.getByTestId('btn-continuar-passo1').click()
    await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 })

    await page.getByTestId('input-pin').fill('12')
    await expect(page.getByTestId('btn-continuar-passo2')).toBeDisabled()
  })

  // ── 1.3 Sessão e persistência ──────────────────────────────────────────────

  test('1.3 Sessão persiste após reload da página', async ({ page }) => {
    // Login
    await page.getByTestId('input-codigo').fill(TEST_CODE)
    await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 })
    await page.getByTestId('btn-continuar-passo1').click()
    await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 })
    await page.getByTestId('input-pin').fill(TEST_PIN)
    await page.getByTestId('btn-continuar-passo2').click()
    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 12000 })

    // Reload
    await page.reload()
    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 8000 })
  })

  test('1.3 Acesso direto a /dashboard sem login redireciona para o login', async ({ page }) => {
    await page.goto(BASE_URL + '/dashboard')
    // Deve estar na tela de login (sem sessão ativa neste contexto)
    // Como o contexto está limpo, o router guard redireciona
    await expect(page.locator('text=Plantão')).toBeVisible({ timeout: 5000 })
    // URL não deve ser /dashboard
    await expect(page).not.toHaveURL(/\/dashboard/)
  })

  test('1.3 Botão "Sair" desloga e redireciona para login', async ({ page }) => {
    // Login
    await page.getByTestId('input-codigo').fill(TEST_CODE)
    await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 })
    await page.getByTestId('btn-continuar-passo1').click()
    await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 })
    await page.getByTestId('input-pin').fill(TEST_PIN)
    await page.getByTestId('btn-continuar-passo2').click()
    await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 12000 })

    // Logout
    await page.getByTestId('auto-btn-dashboardview-4').click()
    await expect(page.getByTestId('input-codigo')).toBeVisible({ timeout: 5000 })
  })

})
