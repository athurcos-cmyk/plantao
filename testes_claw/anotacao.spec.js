import { test, expect } from '@playwright/test'
import { loginAndGoTo, BASE_URL } from './helpers/login.js'

// ─────────────────────────────────────────────────────────────────────────────
// 3. ANOTAÇÃO INICIAL (5 blocos)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3. Anotação Inicial', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoTo(page, '/anotar/inicial')
    // Aguarda bloco 1 carregar
    await page.getByTestId('auto-input-anotacaoinicialview-1').waitFor({ state: 'visible', timeout: 8000 })
  })

  // ── Bloco 1 ────────────────────────────────────────────────────────────────

  test('3.1 Bloco 1 — campo horário visível', async ({ page }) => {
    await expect(page.getByTestId('auto-input-anotacaoinicialview-1')).toBeVisible()
  })

  test('3.1 Bloco 1 — validação: não avança sem horário e sexo', async ({ page }) => {
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click() // Próximo
    // Deve continuar no bloco 1 (horário ainda visível)
    await expect(page.getByTestId('auto-input-anotacaoinicialview-1')).toBeVisible()
  })

  test('3.1 Bloco 1 — validação: não avança só com horário (falta sexo)', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await expect(page.getByTestId('auto-input-anotacaoinicialview-1')).toBeVisible()
  })

  test('3.1 Bloco 1 — avança para bloco 2 com horário e sexo preenchidos', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click() // Sexo F
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()   // Próximo
    // Bloco 2 deve aparecer (neurológico)
    await expect(page.getByTestId('auto-input-anotacaoinicialview-8')).toBeVisible({ timeout: 3000 })
  })

  test('3.1 Bloco 1 — botão Limpar reseta campos', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('10:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click() // Sexo F
    await page.getByTestId('auto-btn-anotacaoinicialview-5').click()   // Limpar
    await expect(page.getByTestId('auto-input-anotacaoinicialview-1')).toHaveValue('')
  })

  // ── Bloco 2 ────────────────────────────────────────────────────────────────

  test('3.2 Bloco 2 — exibe campos neurológicos e respiratórios', async ({ page }) => {
    // Avança para bloco 2
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })

    await expect(page.getByTestId('auto-input-anotacaoinicialview-8')).toBeVisible()  // Mental alterado
    await expect(page.getByTestId('auto-input-anotacaoinicialview-13')).toBeVisible() // Respiração padrão
    await expect(page.getByTestId('auto-input-anotacaoinicialview-16')).toBeVisible() // Acompanhante não
  })

  test('3.2 Bloco 2 — campo acompanhante nome aparece ao marcar "sim"', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })

    await page.getByTestId('auto-input-anotacaoinicialview-17').click() // Acompanhante sim
    await expect(page.getByTestId('auto-input-anotacaoinicialview-18')).toBeVisible() // Nome
    await expect(page.getByTestId('auto-input-anotacaoinicialview-19')).toBeVisible() // Parentesco
  })

  test('3.2 Bloco 2 — campo litros de O2 aparece ao selecionar O2 suplementar', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })

    // Seleciona respiração com O2 (radio que deve exibir campo de litros)
    await page.getByTestId('auto-input-anotacaoinicialview-14').last().click()
    await expect(page.getByTestId('auto-input-anotacaoinicialview-15')).toBeVisible()
  })

  // ── Bloco 3 — Dispositivos ─────────────────────────────────────────────────

  test('3.3 Bloco 3 — botões de adicionar dispositivos visíveis', async ({ page }) => {
    // Avança blocos 1 e 2
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-9').click() // Próximo bloco 2→3
    await page.getByTestId('auto-btn-anotacaoinicialview-13').waitFor({ state: 'visible', timeout: 3000 })

    // Botões de tipo de dispositivo devem aparecer
    await expect(page.getByTestId('auto-btn-anotacaoinicialview-13').first()).toBeVisible()
  })

  // ── Bloco 4 — Eliminações ──────────────────────────────────────────────────

  test('3.4 Bloco 4 — campos de evacuação e diurese visíveis', async ({ page }) => {
    // Navega até bloco 4
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()  // bloco 1→2
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-9').click()  // bloco 2→3
    await page.getByTestId('auto-btn-anotacaoinicialview-13').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-15').click() // bloco 3→4
    await page.getByTestId('auto-input-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })

    await expect(page.getByTestId('auto-input-anotacaoinicialview-20')).toBeVisible() // Evacuação
    await expect(page.getByTestId('auto-input-anotacaoinicialview-22')).toBeVisible() // Diurese
  })

  // ── Bloco 5 — Gerar ────────────────────────────────────────────────────────

  test('3.5 Bloco 5 — botão Gerar anotação visível', async ({ page }) => {
    // Navega até bloco 5 (gerar)
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('08:00')
    await page.getByTestId('auto-input-anotacaoinicialview-2').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-9').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-13').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-15').click()
    await page.getByTestId('auto-input-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-18').click() // bloco 4→5
    await page.getByTestId('auto-btn-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })

    await expect(page.getByTestId('auto-btn-anotacaoinicialview-20')).toBeVisible() // Gerar anotação
  })

  test('3.5 Gerar anotação — exibe botões Copiar e Salvar', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('10:00')
    await page.getByTestId('auto-input-anotacaoinicialview-3').click() // Sexo M
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-9').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-13').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-15').click()
    await page.getByTestId('auto-input-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-18').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-20').click() // Gerar

    await expect(page.getByTestId('auto-btn-anotacaoinicialview-21')).toBeVisible({ timeout: 5000 }) // Copiar
    await expect(page.getByTestId('auto-btn-anotacaoinicialview-22')).toBeVisible()                  // Salvar
  })

  test('3.5 Texto gerado contém horário preenchido', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('14:30')
    await page.getByTestId('auto-input-anotacaoinicialview-3').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-6').click()
    await page.getByTestId('auto-input-anotacaoinicialview-8').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-9').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-13').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-15').click()
    await page.getByTestId('auto-input-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-18').click()
    await page.getByTestId('auto-btn-anotacaoinicialview-20').waitFor({ state: 'visible', timeout: 3000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-20').click()

    const preview = page.locator('.preview-box p, pre, [class*="preview"]').first()
    await expect(preview).toBeVisible({ timeout: 5000 })
    const texto = await preview.innerText()
    expect(texto).toContain('14:30')
  })

  // ── Rascunho ───────────────────────────────────────────────────────────────

  test('3.6 Rascunho — banner aparece ao retornar com dados preenchidos', async ({ page }) => {
    // Preenche e sai
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('09:30')
    await page.waitForTimeout(1200) // debounce do rascunho

    await page.goto(BASE_URL + '/anotar/inicial')
    await page.getByTestId('auto-input-anotacaoinicialview-1').waitFor({ state: 'visible', timeout: 8000 })
    // Banner de rascunho deve aparecer
    await expect(page.getByTestId('auto-btn-anotacaoinicialview-3')).toBeVisible({ timeout: 3000 }) // Continuar
  })

  test('3.6 Rascunho — Continuar restaura o horário salvo', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('09:30')
    await page.waitForTimeout(1200)
    await page.goto(BASE_URL + '/anotar/inicial')
    await page.getByTestId('auto-input-anotacaoinicialview-1').waitFor({ state: 'visible', timeout: 8000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-3').click() // Continuar
    await expect(page.getByTestId('auto-input-anotacaoinicialview-1')).toHaveValue('09:30')
  })

  test('3.6 Rascunho — Descartar limpa o formulário', async ({ page }) => {
    await page.getByTestId('auto-input-anotacaoinicialview-1').fill('09:30')
    await page.waitForTimeout(1200)
    await page.goto(BASE_URL + '/anotar/inicial')
    await page.getByTestId('auto-input-anotacaoinicialview-1').waitFor({ state: 'visible', timeout: 8000 })
    await page.getByTestId('auto-btn-anotacaoinicialview-4').click() // Descartar
    await expect(page.getByTestId('auto-input-anotacaoinicialview-1')).toHaveValue('')
  })

})
