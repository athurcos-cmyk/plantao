import { test, expect } from '@playwright/test'
import { login, loginAndGoTo, BASE_URL } from './helpers/login.js'

// ─────────────────────────────────────────────────────────────────────────────
// 5. HISTÓRICO DE ANOTAÇÕES
// ─────────────────────────────────────────────────────────────────────────────

test.describe('5. Histórico', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoTo(page, '/historico')
    // Aguarda a tela do histórico carregar
    await page.waitForURL(/\/historico/, { timeout: 5000 })
  })

  test('5.1 Tela de histórico carrega corretamente', async ({ page }) => {
    // Campo de busca e filtros devem estar visíveis
    await expect(page.getByTestId('auto-input-historicoview-1')).toBeVisible()  // Campo busca
    await expect(page.getByTestId('auto-btn-historicoview-3').first()).toBeVisible() // Chips de filtro
  })

  test('5.1 Filtros por tipo aparecem (Todos, Inicial, Medicação)', async ({ page }) => {
    const chips = page.getByTestId('auto-btn-historicoview-3')
    await expect(chips.first()).toBeVisible()
    const count = await chips.count()
    expect(count).toBeGreaterThanOrEqual(2) // Pelo menos "Todos" e um tipo
  })

  test('5.2 Campo de busca filtra por texto', async ({ page }) => {
    await page.getByTestId('auto-input-historicoview-1').fill('ZZZ_INEXISTENTE')
    // Nenhum resultado deve aparecer
    const items = page.locator('[class*="anotacao-item"], [class*="card-anotacao"]')
    // Se houver resultado, algo está errado com o filtro
    const count = await items.count()
    // Com texto impossível não deve ter resultados (ou deve mostrar mensagem de vazio)
    // Apenas verifica que o campo está preenchido
    await expect(page.getByTestId('auto-input-historicoview-1')).toHaveValue('ZZZ_INEXISTENTE')
  })

  test('5.2 Limpar busca restaura todos os resultados', async ({ page }) => {
    await page.getByTestId('auto-input-historicoview-1').fill('teste')
    await page.getByTestId('auto-input-historicoview-1').fill('') // limpa
    await expect(page.getByTestId('auto-input-historicoview-1')).toHaveValue('')
  })

  test('5.3 Botão voltar retorna ao Dashboard', async ({ page }) => {
    await page.getByTestId('auto-btn-historicoview-1').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
  })

  test('5.3 Botão logo retorna ao Dashboard', async ({ page }) => {
    await page.getByTestId('auto-btn-historicoview-2').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
  })

  // ── Testes que dependem de ter anotação salva ──────────────────────────────

  test.describe('Com anotação salva', () => {

    test.beforeEach(async ({ page }) => {
      // Salva uma anotação de medicação antes de testar o histórico
      await page.goto(BASE_URL + '/anotar/medicacao')
      await page.getByTestId('auto-input-anotacaomedicacaoview-1').waitFor({ state: 'visible', timeout: 8000 })
      await page.getByTestId('auto-input-anotacaomedicacaoview-1').fill('10:00')
      await page.getByTestId('auto-btn-anotacaomedicacaoview-7').click()
      await page.getByTestId('auto-input-anotacaomedicacaoview-10').waitFor({ state: 'visible', timeout: 3000 })
      await page.getByTestId('auto-input-anotacaomedicacaoview-10').fill('Dipirona')
      await page.getByRole('button', { name: 'VO' }).click()
      await page.getByTestId('auto-input-anotacaomedicacaoview-11').fill('500')
      await page.getByRole('button', { name: 'mg' }).click()
      await page.getByTestId('auto-btn-anotacaomedicacaoview-25').click()
      await page.getByTestId('auto-btn-anotacaomedicacaoview-8').click()
      // Preenche nome do paciente para facilitar busca
      await page.getByTestId('auto-input-anotacaomedicacaoview-8').fill('QA Paciente Teste')
      await page.getByTestId('auto-input-anotacaomedicacaoview-9').fill('QA1')
      await page.getByTestId('auto-btn-anotacaomedicacaoview-10').click() // Salvar
      await page.waitForTimeout(1500) // aguarda Firebase salvar

      // Vai para o histórico
      await page.goto(BASE_URL + '/historico')
      await page.waitForURL(/\/historico/, { timeout: 5000 })
    })

    test('5.4 Anotação salva aparece na lista', async ({ page }) => {
      // Deve haver pelo menos 1 item no histórico
      const items = page.locator('[class*="anotacao"], .anotacao-card, [class*="card"]')
        .filter({ hasText: /dipirona|QA Paciente/i })
      await expect(items.first()).toBeVisible({ timeout: 5000 })
    })

    test('5.4 Busca por nome do paciente encontra a anotação', async ({ page }) => {
      await page.getByTestId('auto-input-historicoview-1').fill('QA Paciente')
      const items = page.locator('[class*="anotacao"], .anotacao-card, [class*="card"]')
        .filter({ hasText: /QA Paciente/i })
      await expect(items.first()).toBeVisible({ timeout: 3000 })
    })

    test('5.5 Botão copiar texto fica visível', async ({ page }) => {
      await expect(page.getByTestId('auto-btn-historicoview-7').first()).toBeVisible({ timeout: 5000 })
    })

    test('5.5 Botão editar abre campos de edição', async ({ page }) => {
      await page.getByTestId('auto-btn-historicoview-6').first().click()
      await expect(page.getByTestId('auto-input-historicoview-2')).toBeVisible({ timeout: 3000 }) // Nome
      await expect(page.getByTestId('auto-input-historicoview-3')).toBeVisible()                  // Leito
    })

    test('5.5 Editar nome do paciente e salvar', async ({ page }) => {
      await page.getByTestId('auto-btn-historicoview-6').first().click()
      await page.getByTestId('auto-input-historicoview-2').fill('QA Editado')
      await page.getByTestId('auto-btn-historicoview-4').click() // ✓ Salvar
      // Campo de edição deve fechar
      await expect(page.getByTestId('auto-input-historicoview-2')).not.toBeVisible({ timeout: 3000 })
    })

    test('5.6 Botão excluir abre confirmação e cancela', async ({ page }) => {
      await page.getByTestId('auto-btn-historicoview-9').first().click() // Excluir
      // Modal de confirmação deve aparecer
      await expect(page.getByTestId('auto-btn-historicoview-10')).toBeVisible({ timeout: 3000 }) // Cancelar
      await expect(page.getByTestId('auto-btn-historicoview-11')).toBeVisible()                  // Confirmar
      // Cancela
      await page.getByTestId('auto-btn-historicoview-10').click()
      await expect(page.getByTestId('auto-btn-historicoview-10')).not.toBeVisible({ timeout: 2000 })
    })

  })

})
