import { expect, test } from '@playwright/test';

// Arreglos de interfaz de la auditoría (2026-10-04).
test.describe('navegación', () => {
	test('en móvil el botón dice Menú y el menú muestra las secciones antes que los temas', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await page.getByRole('button', { name: 'Menú' }).click();
		const menu = page.locator('#menu-temas');
		const secciones = menu.locator('[data-secciones] a');
		await expect(secciones.first()).toHaveText('Futuros');
		for (const nombre of ['Caminos', 'Línea del tiempo', 'Artículos']) await expect(menu.locator('[data-secciones]').getByRole('link', { name: nombre, exact: true })).toBeVisible();
		const antes = await menu.evaluate((m) => {
			const s = m.querySelector('[data-secciones]')!;
			const t = m.querySelector('.tema-enlace')!;
			return Boolean(s.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
		});
		expect(antes).toBe(true);
	});

	test('en escritorio la cabecera lleva a Artículos y a la Línea del tiempo', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/atlas/');
		const nav = page.locator('.cabecera-nav');
		await expect(nav.getByRole('link', { name: 'Artículos' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Línea del tiempo' })).toBeVisible();
	});
});

test.describe('caminos', () => {
	test('en móvil la primera decisión se ve sin desplazarse y la explicación está plegada', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/caminos/');
		const caja = await page.locator('fieldset.decision').first().boundingBox();
		expect(caja!.y).toBeLessThan(844);
		await expect(page.locator('details.caminos-metodo')).not.toHaveAttribute('open', '');
	});

	test('el resumen del camino cuenta las elecciones por etiqueta y lleva al futuro', async ({ page, isMobile }) => {
		await page.goto('/caminos/');
		const resumen = page.locator('[data-resumen]');
		await page.locator('input[value="negociar"]').check();
		await page.locator('input[value="vender"]').check();
		await expect(resumen).toContainText('1 ética');
		await expect(resumen).toContainText('1 ambigua');
		await expect(resumen.locator('a')).toHaveAttribute('href', /^\/futuros\//);
		test.skip(isMobile, 'basta con un navegador para el texto sin JS');
	});
});

test('la barra móvil de un futuro nombra cada cifra', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/futuros/pausa/');
	const etiquetas = page.locator('.panel-barra-etiqueta');
	await expect(etiquetas).toHaveText(['IA', 'Temp.', 'Riesgo']);
	for (const e of await etiquetas.all()) await expect(e).toBeVisible();
	const desborde = await page.locator('.panel-barra').evaluate((b) => b.scrollWidth - b.clientWidth);
	expect(desborde).toBeLessThanOrEqual(0);
});

test.describe('temas', () => {
	test('un tema lista sus eventos de la línea del tiempo, con enlace al evento filtrado', async ({ page }) => {
		await page.goto('/temas/salud/');
		const seccion = page.locator('.tema-linea');
		await expect(seccion.getByRole('heading')).toHaveText('En la línea del tiempo');
		await expect(seccion.locator('a[href="/linea-del-tiempo/?tema=salud#e-vacuna"]')).toHaveCount(1);
	});

	test('un tema sin eventos lo dice', async ({ page }) => {
		await page.goto('/en/topics/meaning/');
		await expect(page.locator('.tema-linea')).toContainText('no timeline events yet');
	});
});

test.describe('movimiento', () => {
	test('hay barra de progreso de lectura, y desaparece si se pide menos movimiento', async ({ page }) => {
		await page.goto('/futuros/');
		await expect(page.locator('.progreso-lectura')).toHaveCount(1);
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await expect(page.locator('.progreso-lectura')).toBeHidden();
	});
});
