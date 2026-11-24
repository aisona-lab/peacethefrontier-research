import { expect, test } from '@playwright/test';

test.describe('caminos sin JavaScript (fase G5)', () => {
	test.use({ javaScriptEnabled: false });

	test('se leen todas las decisiones, con sus opciones y fuentes', async ({ page }) => {
		await page.goto('/caminos/');
		const decisiones = page.locator('fieldset.decision');
		await expect(decisiones).toHaveCount(11);
		for (const d of await decisiones.all()) {
			expect(await d.locator('input[type="radio"]').count()).toBeGreaterThanOrEqual(2);
			expect(await d.locator('a[href^="https://"]').count()).toBeGreaterThan(0);
		}
		await expect(page.locator('[data-destino]')).toHaveAttribute('href', '/futuros/carrera/?paz=0.25&frontera=1.00');
	});
});

test.describe('caminos interactivos (fase G5)', () => {
	test('elegir siempre la opción ética lleva a Pausa y queda en la URL', async ({ page }) => {
		await page.goto('/caminos/');
		for (const d of await page.locator('fieldset.decision').all()) await d.locator('[data-etiqueta="etico"] input').first().check();
		await expect(page.locator('[data-destino]')).toHaveAttribute('href', /^\/futuros\/pausa\/\?paz=/);
		await expect(page.locator('[data-destino-nombre]')).toHaveText('Pausa');
		await expect(page).toHaveURL(/\?c=negociar\./);
		await page.reload();
		await expect(page.locator('fieldset.decision').first().locator('input[value="negociar"]')).toBeChecked();
		await expect(page.locator('[data-destino-nombre]')).toHaveText('Pausa');
	});

	test('empezar de nuevo vuelve a hoy y limpia la URL', async ({ page }) => {
		await page.goto('/en/paths/?c=negociar.verificar');
		await expect(page.locator('[data-elegidas]')).toContainText('2');
		await page.getByRole('button', { name: 'Start over' }).click();
		await expect(page.locator('[data-elegidas]')).toContainText('0');
		await expect(page).toHaveURL(/\/en\/paths\/$/);
		await expect(page.locator('[data-destino]')).toHaveAttribute('href', '/en/futures/race/?paz=0.25&frontera=1.00');
	});

	test('el punto de la matriz se mueve con cada elección', async ({ page, isMobile }) => {
		test.skip(isMobile, 'en móvil la matriz del panel está oculta');
		await page.goto('/caminos/');
		const punto = page.locator('.caminos-panel [data-punto]');
		const antes = await punto.getAttribute('style');
		await page.locator('input[value="agencia"]').check();
		await expect(punto).not.toHaveAttribute('style', antes ?? '');
	});
});
