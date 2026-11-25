import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGINAS = [
	'/',
	'/temas/',
	'/temas/ia/',
	'/metodologia/',
	'/sobre/',
	'/apoyar/',
	'/en/',
	'/en/topics/ancient-knowledge/',
	'/en/methodology/',
	'/en/support/',
	'/futuros/carrera/',
	'/en/futures/race/',
	'/futuros/',
	'/en/futures/',
	'/caminos/',
	'/en/paths/',
	'/articulos/',
	'/articulos/riesgo-de-catastrofe/',
	'/en/articles/compute-behind-ai/',
	'/linea-del-tiempo/',
	'/en/timeline/',
];
const ETIQUETAS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.beforeEach(async ({ page }) => {
	await page.route('https://static.cloudflareinsights.com/**', (route) =>
		route.fulfill({ contentType: 'application/javascript', body: '' }),
	);
});

/** Errores de consola y de página; incluye las violaciones de CSP. */
function vigilarErrores(page: Page) {
	const errores: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
	page.on('pageerror', (e) => errores.push(e.message));
	return errores;
}

/** Espera a que terminen las animaciones de tiempo (no las ligadas al scroll, que nunca "terminan"). */
async function esperarAnimaciones(page: Page) {
	await page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.timeline instanceof DocumentTimeline)
				.map((a) => a.finished),
		),
	);
}

async function violacionesAxe(page: Page) {
	// axe mide el contraste real: a mitad de una animación de entrada la opacidad aún no es 1.
	await esperarAnimaciones(page);
	const { violations } = await new AxeBuilder({ page }).withTags(ETIQUETAS_WCAG).analyze();
	return violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target}`);
}

for (const tema of ['light', 'dark'] as const) {
	test.describe(`tema ${tema}`, () => {
		test.use({ colorScheme: tema });

		for (const ruta of PAGINAS) {
			test(`${ruta} carga sin errores ni violaciones de accesibilidad`, async ({ page }) => {
				const errores = vigilarErrores(page);
				await page.goto(ruta);
				await expect(page.locator('h1')).toBeVisible();
				expect(await violacionesAxe(page)).toEqual([]);
				expect(errores).toEqual([]);
			});
		}
	});
}

test('el enlace para saltar al contenido es el primer foco', async ({ page, browserName }) => {
	test.skip(browserName === 'webkit', 'Safari no enfoca enlaces con Tab por defecto');
	await page.goto('/');
	await page.keyboard.press('Tab');
	const saltar = page.getByRole('link', { name: 'Saltar al contenido' });
	await expect(saltar).toBeFocused();
	await expect(saltar).toBeInViewport();
});

test('el menú de temas se abre con teclado, lista los 17 temas y se cierra con Escape', async ({
	page,
}) => {
	await page.goto('/');
	const boton = page.getByRole('button', { name: /^(Temas|Menú)$/ });
	const menu = page.locator('#menu-temas');

	await boton.focus();
	await page.keyboard.press('Enter');
	await expect(menu).toBeVisible();
	await expect(menu.getByRole('link', { name: 'Inteligencia artificial', exact: true })).toBeVisible();
	await expect(menu.locator('.tema-enlace')).toHaveCount(17);

	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
	await expect(boton).toBeFocused();
});

test('el tema elegido se recuerda al recargar', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	const boton = page.getByRole('button', { name: 'Tema oscuro' });
	await expect(boton).toHaveAttribute('aria-pressed', 'false');

	await boton.click();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'oscuro');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'oscuro');
	await expect(boton).toHaveAttribute('aria-pressed', 'true');
});

test('cada tema enlaza a su vecino en la escala', async ({ page }) => {
	await page.goto('/temas/ia/');
	await page.getByRole('link', { name: /Hacia lo grande/ }).click();
	await expect(page).toHaveURL(/\/temas\/salud\/$/);
	await expect(page.locator('h1')).toHaveText('Salud y enfermedad');
});

test('una ruta inexistente responde 404 con salida', async ({ page }) => {
	const respuesta = await page.goto('/no-existe/');
	expect(respuesta?.status()).toBe(404);
	await expect(page.locator('h1')).toHaveText('Esta página no existe');
	await expect(page.getByRole('main').getByRole('link', { name: 'temas' })).toBeVisible();
});

for (const ancho of [320, 768]) {
	test.describe(`sin desborde horizontal a ${ancho} px`, () => {
		test.use({ viewport: { width: ancho, height: 700 } });

		for (const ruta of PAGINAS) {
			test(ruta, async ({ page }) => {
				await page.goto(ruta);
				const desborde = await page.evaluate(
					() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
				);
				expect(desborde).toBe(0);
			});
		}
	});
}

test.describe('idiomas', () => {
	test('el selector lleva a la misma página en el otro idioma y de vuelta', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/temas/conocimiento-antiguo/');
		await expect(page.locator('html')).toHaveAttribute('lang', 'es');

		await page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
		await expect(page).toHaveURL(/\/en\/topics\/ancient-knowledge\/$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page.locator('h1')).toHaveText('Ancient knowledge, lost and recovered');

		await page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: /ES/ }).click();
		await expect(page).toHaveURL(/\/temas\/conocimiento-antiguo\/$/);
	});

	test('cada página declara su versión en el otro idioma con hreflang', async ({ page }) => {
		await page.goto('/metodologia/');
		await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
			'href',
			'https://peacethefrontier.com/en/methodology/',
		);
		await expect(page.locator('link[hreflang="es"]')).toHaveAttribute(
			'href',
			'https://peacethefrontier.com/metodologia/',
		);
	});

	test('en móvil el idioma se cambia desde el menú', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 800 });
		await page.goto('/');
		await page.getByRole('button', { name: 'Menú' }).click();
		await page.locator('#menu-temas').getByRole('link', { name: /EN/ }).click();
		await expect(page).toHaveURL(/\/en\/$/);
		await expect(page.locator('h1')).toContainText(
			'Autonomous agents as the infrastructure of the next decade',
		);
	});
});

test('cada página tiene su imagen para redes: PNG de 1200 × 630 (fase G8)', async ({ page, request }) => {
	for (const ruta of PAGINAS) {
		await page.goto(ruta);
		const imagen = await page.locator('meta[property="og:image"]').getAttribute('content');
		expect(imagen, ruta).toMatch(/^https:\/\/peacethefrontier\.com\/og\/[a-z0-9-]+\.png$/);
		const respuesta = await request.get(new URL(imagen!).pathname);
		expect(respuesta.status(), ruta).toBe(200);
		const png = await respuesta.body();
		expect(png.subarray(1, 4).toString(), ruta).toBe('PNG');
		expect([png.readUInt32BE(16), png.readUInt32BE(20)], ruta).toEqual([1200, 630]);
	}
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

