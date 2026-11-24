import { expect, test } from '@playwright/test';

test.describe('cada tema muestra sus indicadores en los cuatro futuros (fase G3)', () => {
	test('Cómputo compara capacidad y electricidad de la IA en los cuatro futuros', async ({ page }) => {
		await page.goto('/temas/computo/');
		const figuras = page.locator('figure.compara');
		await expect(figuras).toHaveCount(2);
		await expect(figuras.first().locator('figcaption')).toContainText('Capacidad de la IA');
		const enlaces = await figuras.first().locator('li a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
		expect(enlaces).toEqual(['/futuros/pausa/', '/futuros/frontera-en-paz/', '/futuros/carrera/', '/futuros/fractura/']);
		await expect(figuras.first().locator('li').first()).toContainText('2100');
	});

	test('los cuatro futuros de una comparación comparten escala', async ({ page }) => {
		await page.goto('/en/topics/energy/');
		await expect(page.locator('figure.compara')).toHaveCount(2);
		for (const figura of await page.locator('figure.compara').all()) {
			const escalas = await figura.locator('svg').evaluateAll((svgs) => svgs.map((s) => s.dataset.escala));
			expect(new Set(escalas).size).toBe(1);
			expect(escalas).toHaveLength(4);
		}
	});

	test('un tema sin indicador en el modelo lo dice', async ({ page }) => {
		await page.goto('/en/topics/mind/');
		await expect(page.locator('figure.compara')).toHaveCount(0);
		await expect(page.getByText('The futures model has no indicator for this topic.')).toBeVisible();
	});
});

test('la comparación aclara la sensibilidad y la base eléctrica', async ({ page }) => {
 await page.goto('/en/topics/compute/');
 const energia = page.locator('figure.compara', {hasText: 'Data-centre electricity'});
 await expect(energia).toContainText('all data centres');
 await expect(energia).toContainText('conditional sensitivity');
});
