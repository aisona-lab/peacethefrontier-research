import { expect, test } from '@playwright/test';

test.describe('línea del tiempo sin JavaScript (fase G7)', () => {
	test.use({ javaScriptEnabled: false });

	test('lista los eventos en orden, cada uno con fuente, y oculta el filtro', async ({ page }) => {
		await page.goto('/linea-del-tiempo/');
		const eventos = page.locator('li.evento');
		expect(await eventos.count()).toBeGreaterThanOrEqual(25);
		const anios = await eventos.evaluateAll((lis) => lis.map((li) => Number((li as HTMLElement).dataset.anio)));
		expect(anios).toEqual([...anios].sort((a, b) => a - b));
		for (const e of await eventos.all()) expect(await e.locator('.evento-fuentes a[href^="http"]').count()).toBeGreaterThan(0);
		await expect(page.locator('[data-filtro]')).toBeHidden();
	});

	test('lo perdido y lo recuperado se enlazan en los dos sentidos', async ({ page }) => {
		await page.goto('/linea-del-tiempo/');
		await expect(page.locator('#e-aristarco a[href="#e-copernico"]')).toHaveCount(1);
		await expect(page.locator('#e-copernico a[href="#e-aristarco"]')).toHaveCount(1);
	});

	test('los futuros salen de hoy como ramas, con los eventos del modelo', async ({ page }) => {
		await page.goto('/en/timeline/');
		const ramas = page.locator('.rama');
		await expect(ramas).toHaveCount(4);
		await expect(ramas.first().locator('h3 a')).toHaveAttribute('href', '/en/futures/pause/');
		for (const rama of await ramas.all()) expect(await rama.locator('li').count()).toBeGreaterThan(0);
	});
});

test.describe('línea del tiempo interactiva (fase G7)', () => {
	test('filtrar por tema oculta el resto sin recargar y queda en la URL', async ({ page }) => {
		await page.goto('/linea-del-tiempo/');
		await page.locator('[data-filtro] select').selectOption('salud');
		await expect(page).toHaveURL(/\?tema=salud$/);
		const visibles = page.locator('li.evento:visible');
		expect(await visibles.count()).toBeGreaterThan(3);
		for (const temas of await visibles.evaluateAll((lis) => lis.map((li) => (li as HTMLElement).dataset.temas)))
			expect(temas?.split(' ')).toContain('salud');
		await page.reload();
		await expect(page.locator('[data-filtro] select')).toHaveValue('salud');
		await page.locator('[data-filtro] select').selectOption('');
		await expect(page).toHaveURL(/\/linea-del-tiempo\/$/);
	});

	test('en pantalla ancha, la vista general marca cada evento, hoy y las cuatro ramas', async ({ page, isMobile }) => {
		test.skip(isMobile, 'la vista general solo aparece en pantallas anchas');
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto('/linea-del-tiempo/');
		const vista = page.locator('.linea-vista');
		await expect(vista).toBeVisible();
		expect(await vista.locator('a.marca').count()).toBe(await page.locator('li.evento').count());
		await expect(vista.locator('.marca-hoy')).toHaveCount(1);
		await expect(vista.locator('.rama-trazo')).toHaveCount(4);
		await vista.locator('a.marca[href="#e-penicilina"]').click();
		await expect(page).toHaveURL(/#e-penicilina$/);
	});

	test('en móvil la vista general se oculta y queda la lista', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 800 });
		await page.goto('/linea-del-tiempo/');
		await expect(page.locator('.linea-vista')).toBeHidden();
		await expect(page.locator('li.evento').first()).toBeVisible();
	});
});
