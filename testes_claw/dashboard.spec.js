import { test, expect } from '@playwright/test'
import { login, BASE_URL } from './helpers/login.js'

// ─────────────────────────────────────────────────────────────────────────────
// 2. DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

test.describe('2. Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('2.1 Saudação exibe hora correta (Bom dia / Boa tarde / Boa noite)', async ({ page }) => {
    const hora = new Date().getHours()
    const esperado = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
    await expect(page.locator(`text=${esperado}`)).toBeVisible({ timeout: 3000 })
  })

  test('2.1 Saudação exibe nome do usuário', async ({ page }) => {
    await expect(page.locator('text=QA Automação')).toBeVisible({ timeout: 3000 })
  })

  test('2.2 Card "Anotação inicial" navega para /anotar/inicial', async ({ page }) => {
    await page.getByRole('button', { name: /Anotação inicial/i }).click()
    await expect(page).toHaveURL(/\/anotar\/inicial/, { timeout: 5000 })
  })

  test('2.2 Card "Medicação" navega para /anotar/medicacao', async ({ page }) => {
    await page.getByRole('button', { name: /Medicação/i }).click()
    await expect(page).toHaveURL(/\/anotar\/medicacao/, { timeout: 5000 })
  })

  test('2.2 Cards "Em breve" disparam alerta e não navegam', async ({ page }) => {
    let alertaDisparado = false
    page.on('dialog', dialog => { alertaDisparado = true; dialog.dismiss() })

    const cardEmBreve = page.locator('.tipo-card', { hasText: 'em breve' }).first()
    if (await cardEmBreve.count() > 0) {
      await cardEmBreve.click()
      expect(alertaDisparado).toBe(true)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 2000 })
    }
  })

  test('2.3 Ícone relógio navega para /historico', async ({ page }) => {
    await page.getByTestId('auto-btn-dashboardview-1').click()
    await expect(page).toHaveURL(/\/historico/, { timeout: 5000 })
  })

  test('2.3 Botão "Ver histórico" navega para /historico', async ({ page }) => {
    await page.getByTestId('auto-btn-dashboardview-3').click()
    await expect(page).toHaveURL(/\/historico/, { timeout: 5000 })
  })

  test('2.4 Acesso direto a /dashboard sem login redireciona para login', async ({ browser }) => {
    // Contexto completamente limpo (sem localStorage da sessão atual)
    const ctx  = await browser.newContext()
    const p    = await ctx.newPage()
    await p.goto(BASE_URL + '/dashboard')
    await expect(p.getByTestId('input-codigo')).toBeVisible({ timeout: 5000 })
    await ctx.close()
  })

  test('2.4 Botão "Sair da conta" desloga e volta para login', async ({ page }) => {
    await page.getByTestId('auto-btn-dashboardview-4').click()
    await expect(page.getByTestId('input-codigo')).toBeVisible({ timeout: 5000 })
    const syncCode = await page.evaluate(() => localStorage.getItem('sync_code'))
    expect(syncCode).toBeNull()
  })

})
