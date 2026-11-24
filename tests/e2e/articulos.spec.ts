import { expect, test } from '@playwright/test';

test.describe('artículos (fase G6)', () => {
	test('el índice lista los tres artículos ancla y las cuatro revisiones', async ({ page }) => {
		await page.goto('/articulos/');
		await expect(page.locator('.lista-articulos > li')).toHaveCount(7);
		await page.getByRole('link', { name: 'El cómputo que mueve la IA', exact: true }).click();
		await expect(page).toHaveURL(/\/articulos\/computo-de-la-ia\/$/);
	});

	test('cada nota numerada lleva a su fuente, con nivel de evidencia, fechas y aviso de IA', async ({ page }) => {
		await page.goto('/articulos/computo-de-la-ia/');
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('.articulo-meta')).toContainText('Borrador');
		await expect(page.locator('.articulo-meta')).toContainText('Evidencia emergente');
		await expect(page.locator('.articulo-meta time')).toHaveCount(2);
		await expect(page.locator('.articulo-aviso')).toContainText('IA');
		const notas = page.locator('.nota a');
		expect(await notas.count()).toBeGreaterThan(3);
		for (const href of await notas.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
			await expect(page.locator(href!)).toHaveCount(1);
		}
		await expect(page.locator('.citar')).toHaveCount(1);
	});

	for (const ruta of ['/articulos/computo-de-la-ia/', '/articulos/electricidad-de-la-ia/', '/articulos/riesgo-de-catastrofe/', '/en/articles/compute-behind-ai/', '/en/articles/ai-electricity/', '/en/articles/risk-of-catastrophe/']) {
		test(`${ruta}: las notas se numeran en el orden en que aparecen y la fecha se lee bien`, async ({ page }) => {
			await page.goto(ruta);
			const numeros = await page.locator('.nota a').evaluateAll((as) => as.map((a) => Number(a.getAttribute('href')!.replace('#fuente-', ''))));
			const primeras = numeros.filter((n, i) => numeros.indexOf(n) === i);
			expect(primeras).toEqual(primeras.map((_, i) => i + 1));
			await expect(page.locator('.articulo-meta')).not.toContainText(/\d\.(Revisado|Reviewed)/);
		});
	}

	test('el tema muestra sus artículos y el selector de idioma lleva a la versión inglesa', async ({ page }) => {
		await page.goto('/temas/energia/');
		await expect(page.locator('.tema-articulos a[href="/articulos/electricidad-de-la-ia/"]')).toHaveCount(1);
		await page.goto('/articulos/riesgo-de-catastrofe/');
		await expect(page.locator('a[hreflang="en"]').first()).toHaveAttribute('href', '/en/articles/risk-of-catastrophe/');
	});
});

test.describe('borradores (revisión final de la fase G)', () => {
	test('un artículo en borrador no se indexa y el índice lo marca', async ({ page }) => {
		await page.goto('/articulos/computo-de-la-ia/');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
		await page.goto('/en/articles/');
		await expect(page.locator('.lista-articulos > li').first()).toContainText('Draft');
	});

	test('la ficha y el índice usan el mismo estado en inglés', async ({ page }) => {
		await page.goto('/en/articles/compute-behind-ai/');
		await expect(page.locator('.articulo-meta')).toContainText('Draft');
		await page.goto('/en/articles/');
		await expect(page.locator('.lista-articulos > li').filter({ hasText: 'The compute behind AI' })).toContainText('Draft');
	});

	test('un texto sensible en borrador dice que le falta la revisión adicional', async ({ page }) => {
		await page.goto('/articulos/riesgo-de-catastrofe/');
		await expect(page.locator('.articulo-aviso')).toContainText('revisión adicional');
	});
});
