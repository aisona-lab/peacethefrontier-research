import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';

for (const lang of ['es', 'en'])
	for (const colorScheme of ['light', 'dark'] as const) {
		const prefix = lang === 'en' ? '/en/' : '/';
		for (const space of ['studio', 'atlas', 'research', 'sim', 'open']) {
			const path = space === 'studio' ? prefix : `${prefix}${space}/`;
			test(`${path}: ${colorScheme}, navegación, idioma y accesibilidad`, async ({ page }) => {
				await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
				await page.setViewportSize({ width: 375, height: 812 });
				await page.goto(path);
				await expect(page.locator('main h1')).toBeVisible();
				await expect(page.locator('html')).toHaveAttribute('lang', lang);
				expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
					true,
				);
				if (space === 'studio') await expect(page.locator('.studio-grid > li')).toHaveCount(4);
				if (space === 'atlas') {
					await expect(page.locator('main #temas .tema-enlace')).toHaveCount(17);
					await expect(page.locator('main .destacado-articulo')).toHaveCount(4);
				}
				if (space === 'studio' || space === 'research') {
					await expect(page.locator('.hipotesis-tarjeta')).toHaveCount(3);
					await expect(page.locator('.papers li')).toHaveCount(5);
					await expect(page.locator('.bitacora-lista > li')).toHaveCount(5);
				}
				if (space === 'sim' || space === 'open') {
					await expect(page.locator('.experimentos-portafolio .exp-rejilla > li')).toHaveCount(3);
					await expect(page.locator('.datos-studio')).toContainText(
						lang === 'es' ? 'Datos sintéticos' : 'Synthetic data',
					);
					await expect(page.locator('.datos-studio')).toContainText(/2[.,]?880/);
					await expect(page.locator('.datos-studio a[download]')).toHaveCount(7);
				}
				const { violations } = await new AxeBuilder({ page })
					.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
					.analyze();
				expect(violations).toEqual([]);
			});
		}
	}

test('los cinco working papers bilingües enlazan código, citas, traducción y accesibilidad a 320px', async ({
	page,
	request,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	for (const lang of ['es', 'en']) {
		await page.goto(lang === 'es' ? '/research/' : '/en/research/');
		const links = await page
			.locator('.papers h3 a')
			.evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
		expect(links).toHaveLength(5);
		for (const href of links) {
			await page.setViewportSize({ width: 1280, height: 900 });
			await page.goto(href);
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
			await expect(page.locator('.articulo-meta')).toContainText('PTF-WP');
			await expect(page.locator('.articulo-meta')).toContainText(/v\d+\.\d+\.\d+/);
			expect(await page.locator('.nota a').count()).toBeGreaterThanOrEqual(4);
			const counterpart = page.locator(
				`.cabecera-fila .idiomas a[hreflang="${lang === 'es' ? 'en' : 'es'}"]`,
			);
			const alt = await counterpart.getAttribute('href');
			expect(alt).toContain('/research/working-papers/');
			await counterpart.click();
			await expect(page).toHaveURL(alt!);
			await page.setViewportSize({ width: 320, height: 700 });
			await page.locator('.citar summary').click();
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
				true,
			);
			expect(
				await page.locator('.citar pre').evaluate((el) => el.scrollWidth <= el.clientWidth),
			).toBe(true);
			expect(
				(
					await new AxeBuilder({ page })
						.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
						.analyze()
				).violations,
			).toEqual([]);
			const sitemap = await (await request.get('/sitemap-0.xml')).text();
			expect(sitemap).not.toContain(href);
		}
	}
});

test('los datasets sintéticos y los feeds RSS coinciden con sus manifiestos SHA-256', async ({
	request,
}) => {
	const response = await request.get('/datos/studio/manifest.json');
	expect(response.ok()).toBe(true);
	const m = await response.json();
	expect(m.synthetic).toBe(true);
	expect(m.experiment.row_count).toBe(2880);
	for (const file of m.files) {
		const r = await request.get(file.path);
		expect(r.ok(), file.path).toBe(true);
		const bytes = await r.body();
		expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
		expect(bytes.byteLength).toBe(file.bytes);
	}

	for (const expId of [
		'h1-delegacion-autonoma',
		'h2-coordinacion-multiagente',
		'h3-ia-cientifica-vs-consumer',
	]) {
		const expRes = await request.get(`/datos/experimentos/${expId}/manifest.json`);
		expect(expRes.ok(), expId).toBe(true);
		const expManifest = await expRes.json();
		expect(expManifest.synthetic).toBe(true);
		for (const file of expManifest.files) {
			const r = await request.get(file.path);
			expect(r.ok(), file.path).toBe(true);
			const bytes = await r.body();
			expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
			expect(bytes.byteLength).toBe(file.bytes);
		}
	}

	for (const feedPath of ['/rss.xml', '/en/rss.xml']) {
		const feedRes = await request.get(feedPath);
		expect(feedRes.ok(), feedPath).toBe(true);
		const xml = await feedRes.text();
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain('PTF-WP 5');
		expect(xml).toContain('PTF-WP 4');
		expect(xml).toContain('PTF-WP 3');
	}
});
