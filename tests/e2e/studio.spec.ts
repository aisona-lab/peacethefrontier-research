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
					await expect(page.locator('.aviso-simulacion')).toBeVisible();
					await expect(page.locator('.hipotesis-tarjeta')).toHaveCount(3);
					for (const idx of [0, 1, 2]) {
						await expect(page.locator('.hipotesis-tarjeta').nth(idx)).toContainText(
							lang === 'es' ? 'Escenario' : 'Scenario',
						);
					}
					await expect(page.locator('.papers li')).toHaveCount(5);
					await expect(page.locator('.papers')).toContainText('v0.2.0');
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
	test.setTimeout(90_000);
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

test('explorable interactivo de H1 recalcula cruce y frontera en vivo, lee dataset.csv y enlaza Colab', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/research/working-papers/de-copilotos-a-agentes-autonomos/');

	await expect(page.locator('.aviso-simulacion')).toBeVisible();
	await expect(page.locator('.articulo-meta')).toContainText('v0.2.0');
	await expect(page.locator('.articulo-meta')).toContainText('Escenario');
	await expect(page.locator('.revision-externa')).toContainText('0/2');

	const island = page.locator('ptf-h1-explorable[data-interactivo]');
	await expect(island).toBeVisible();
	await expect(island.locator('[data-crossover-year]')).toHaveText('2033');
	await expect(island.locator('[data-heatmap-svg] .hm-boundary')).toHaveCount(1);
	await expect(island.locator('[data-csv-status]')).toContainText('CSV verificado');
	await expect(
		page.locator('a[href*="colab.research.google.com/github/aisona-lab/peacethefrontier-research"]').first(),
	).toBeVisible();

	await island.locator('input[name="p0"]').fill('0.75');
	await island.locator('input[name="k"]').fill('20');
	await expect(island.locator('[data-crossover-year]')).toHaveText('Sin cruce');
	await expect(page).toHaveURL(/p0=0\.75/);

	await island.locator('[data-reset]').click();
	await expect(island.locator('[data-crossover-year]')).toHaveText('2033');

	await island.locator('select[name="sector"]').selectOption('computational-science');
	await expect(island.locator('[data-crossover-year]')).toHaveText('2028');
});

test('conflicto de interés, panel empírico H1 (0 filas) y registro de predicciones cumplen WCAG 2.2 AA', async ({
	page,
}) => {
	for (const path of ['/sobre/', '/en/about/']) {
		await page.goto(path);
		await expect(page.locator('#conflicto')).toBeAttached();
		await expect(page.locator('main')).toContainText('aisona-lab');
	}

	for (const colorScheme of ['light', 'dark'] as const) {
		await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
		await page.setViewportSize({ width: 375, height: 812 });

		for (const path of ['/research/datos-h1/', '/en/research/h1-data/']) {
			await page.goto(path);
			await expect(page.locator('main h1')).toBeVisible();
			await expect(page.locator('.datos-vacio')).toBeVisible();
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
			const { violations } = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
				.analyze();
			expect(violations).toEqual([]);
		}

		for (const path of ['/predicciones/', '/en/predictions/']) {
			await page.goto(path);
			await expect(page.locator('main h1')).toBeVisible();
			await expect(page.locator('.pred-tarjeta')).toHaveCount(5);
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
			const { violations } = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
				.analyze();
			expect(violations).toEqual([]);
		}
	}
});

test('los datasets sintéticos, empíricos y los feeds RSS coinciden con sus manifiestos SHA-256', async ({
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

	const empRes = await request.get('/datos/empirico/manifest.json');
	expect(empRes.ok()).toBe(true);
	const empManifest = await empRes.json();
	expect(empManifest.synthetic).toBe(false);
	expect(empManifest.observed_row_count).toBe(0);
	const empCsv = await request.get(empManifest.csv_path);
	expect(empCsv.ok()).toBe(true);
	expect(createHash('sha256').update(await empCsv.body()).digest('hex')).toBe(empManifest.csv_sha256);

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
