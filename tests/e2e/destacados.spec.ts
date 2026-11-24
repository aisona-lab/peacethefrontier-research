import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const idiomas = [
	{ lang: 'es', inicio: '/atlas/', titulo: 'Investigación destacada', borrador: 'Borrador', criterio: /Prioridades editoriales.*popularidad/, tema: '/temas/ia/' },
	{ lang: 'en', inicio: '/en/atlas/', titulo: 'Featured research', borrador: 'Draft', criterio: /Editorial research priorities.*popularity/, tema: '/en/topics/ai/' },
] as const;

for (const idioma of idiomas) {
	test(`${idioma.lang}: cuatro investigaciones antes del atlas; artículos, temas y traducciones navegables`, async ({ page }) => {
		test.setTimeout(60_000);
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(idioma.inicio);
		const destacados = page.locator('main').getByRole('region', { name: idioma.titulo });
		await expect(destacados.locator('.destacado-articulo')).toHaveCount(4);
		await expect(destacados.locator('.destacado-estado')).toHaveText(Array(4).fill(idioma.borrador));
		await expect(destacados).toContainText(idioma.criterio);
		await expect(page.locator('#temas .tema-enlace')).toHaveCount(17);
		await expect(page.locator('#temas .banda[id]')).toHaveCount(4);
		expect(await destacados.evaluate((s) => Boolean(s.compareDocumentPosition(document.querySelector('#temas')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
		const atlas = await page.locator('#temas .tema-enlace').evaluateAll((enlaces) => enlaces.map((a) => a.getAttribute('href')));
		const tarjetas = destacados.locator('.destacado');
		for (const [indice, cantidad] of [3, 3, 3, 4].entries()) {
			const temas = tarjetas.nth(indice).locator('.destacado-temas a');
			await expect(temas).toHaveCount(cantidad);
			for (const href of await temas.evaluateAll((enlaces) => enlaces.map((a) => a.getAttribute('href')))) {
				expect(atlas).toContain(href);
			}
		}

		// Cada tarjeta enlaza un artículo real y conserva su pareja al cambiar idioma.
		const rutas = await destacados.locator('.destacado-articulo').evaluateAll((enlaces) => enlaces.map((a) => a.getAttribute('href')!));
		expect(new Set(rutas).size).toBe(4);
		for (const href of rutas) {
			await destacados.locator(`.destacado-articulo[href="${href}"]`).click();
			await expect(page).toHaveURL(href);
			await expect(page.locator('main h1')).toBeVisible();
			await expect(page.locator('.articulo-meta')).toContainText(idioma.borrador);
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
			const otro = idioma.lang === 'es' ? 'en' : 'es';
			await page.locator(`.cabecera-fila .idiomas a[hreflang="${otro}"]`).click();
			await expect(page.locator('html')).toHaveAttribute('lang', otro);
			await expect(page.locator('main h1')).toBeVisible();
			await page.locator(`.cabecera-fila .idiomas a[hreflang="${idioma.lang}"]`).click();
			await expect(page).toHaveURL(href);
			await page.goto(idioma.inicio);
		}
		await destacados.locator(`a[href="${idioma.tema}"]`).click();
		await expect(page).toHaveURL(idioma.tema);
		await expect(page.locator('main h1')).toBeVisible();
	});

	for (const colorScheme of ['light', 'dark'] as const) {
		test(`${idioma.lang}: menú y tarjetas a 320px en ${colorScheme}, con teclado y sin desborde`, async ({ page, browserName }) => {
			await page.setViewportSize({ width: 320, height: 700 });
			await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
			await page.goto(idioma.inicio);
			expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
			const portada = await new AxeBuilder({ page }).include('main .destacados').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
			expect(portada.violations).toEqual([]);
			const boton = page.locator('.boton-temas');
			await boton.focus();
			await page.keyboard.press('Enter');
			const menu = page.locator('#menu-temas');
			await expect(menu).toBeVisible();
			const destacados = menu.getByRole('region', { name: idioma.titulo });
			await expect(destacados.locator('.destacado-articulo')).toHaveCount(4);
			await expect(destacados.locator('.destacado-estado')).toHaveText(Array(4).fill(idioma.borrador));
			await expect(menu.locator('.tema-enlace')).toHaveCount(17);
			await expect(menu.locator('.banda')).toHaveCount(4);
			expect(await destacados.evaluate((s) => Boolean(s.compareDocumentPosition(document.querySelector('#menu-temas .indice')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
			expect(await menu.evaluate((m) => m.scrollWidth - m.clientWidth)).toBe(0);
			const primero = destacados.locator('.destacado-articulo').first();
			await primero.focus();
			await expect(primero).toBeFocused();
			await expect(primero).toBeInViewport();
			expect(await primero.evaluate((a) => getComputedStyle(a).outlineStyle)).not.toBe('none');
			if (browserName !== 'webkit') {
				await page.keyboard.press('Tab');
				await expect(destacados.locator('.destacado-temas a').first()).toBeFocused();
			}
			const { violations } = await new AxeBuilder({ page }).include('#menu-temas').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
			expect(violations).toEqual([]);
			await page.keyboard.press('Escape');
			await expect(menu).toBeHidden();
			await expect(boton).toBeFocused();
			await boton.press('Enter');
			const href = await primero.getAttribute('href');
			await primero.press('Enter');
			await expect(page).toHaveURL(href!);
			await expect(page.locator('.articulo-meta')).toContainText(idioma.borrador);
		});
	}
}

test.describe('sin JavaScript', () => {
	test.use({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
	test('los destacados del menú nativo abren artículos sin JavaScript', async ({ page }) => {
		await page.goto('/');
		await page.locator('.boton-temas').click();
		const enlace = page.locator('#menu-temas .destacado-articulo').first();
		await expect(enlace).toBeVisible();
		const href = await enlace.getAttribute('href');
		await enlace.click();
		await expect(page).toHaveURL(href!);
		await expect(page.locator('.articulo-meta')).toContainText('Borrador');
	});
});
