import { expect } from '@playwright/test'

export const TEST_CODE = 'TESTE1'
export const TEST_PIN  = '1234'
export const BASE_URL  = 'http://localhost:5173'

/**
 * Faz login com o usuário de teste TESTE1 / PIN 1234.
 * Assume que o usuário já foi criado pelo global-setup.
 */
export async function login(page) {
  await page.goto(BASE_URL)

  // Passo 1 — código
  await page.getByTestId('input-codigo').fill(TEST_CODE)
  await expect(page.getByTestId('btn-continuar-passo1')).toBeEnabled({ timeout: 8000 })
  await page.getByTestId('btn-continuar-passo1').click()

  // Passo 2 — PIN
  await page.getByTestId('titulo-passo2').waitFor({ state: 'visible', timeout: 8000 })
  await page.getByTestId('input-pin').fill(TEST_PIN)
  await page.getByTestId('btn-continuar-passo2').click()

  // Aguarda dashboard
  await expect(page.locator('text=Nova anotação')).toBeVisible({ timeout: 12000 })
}

/**
 * Navega para uma rota protegida após login.
 * Ex: goTo(page, '/anotar/medicacao')
 */
export async function loginAndGoTo(page, route) {
  await login(page)
  await page.goto(BASE_URL + route)
}
