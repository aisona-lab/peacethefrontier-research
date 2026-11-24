import { expect, test } from '@playwright/test';

test.describe('el punto de hoy en la matriz (fase G4)', () => {
	test('la portada marca hoy y enlaza a cómo se estima', async ({ page }) => {
		await page.goto('/atlas/');
		const hoy = page.locator('[data-hoy]');
		await expect(hoy).toHaveAttribute('href', '/futuros/#hoy');
		await expect(hoy).toHaveAccessibleName(/^Hoy/);
		await page.goto('/en/atlas/');
		await expect(page.locator('[data-hoy]')).toHaveAttribute('href', '/en/futures/#hoy');
	});

	test('el punto cae dentro de Carrera, como dicen las señales', async ({ page }) => {
		await page.goto('/atlas/');
		await expect(page.locator('[data-hoy] .matriz-hoy-punto')).toBeVisible();
		const punto = await page.locator('[data-hoy] .matriz-hoy-punto').boundingBox();
		const carrera = await page.locator('.puerta-carrera').boundingBox();
		expect(punto && carrera).toBeTruthy();
		const cx = punto!.x + punto!.width / 2;
		const cy = punto!.y + punto!.height / 2;
		expect(cx).toBeGreaterThan(carrera!.x);
		expect(cx).toBeLessThanOrEqual(carrera!.x + carrera!.width + 1);
		expect(cy).toBeGreaterThan(carrera!.y);
		expect(cy).toBeLessThan(carrera!.y + carrera!.height);
	});

	test('/futuros/#hoy explica la estimación con señales y fuentes', async ({ page }) => {
		await page.goto('/en/futures/#hoy');
		await expect(page.locator('#hoy')).toBeVisible();
		const filas = page.locator('.senales-hoy tbody tr');
		await expect(filas).toHaveCount(5);
		for (const fila of await filas.all()) expect(await fila.locator('a[href^="https://"]').count()).toBeGreaterThan(0);
		await expect(page.locator('.hoy-resumen')).toContainText('0.9');
	});
});

test('a 375 px el punto de hoy no tapa el nombre ni el lema de Carrera', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 800 });
	await page.goto('/atlas/');
	await expect(page.locator('[data-hoy] .matriz-hoy-punto')).toBeVisible();
	const solapa = await page.evaluate(() => {
		const r = (e: Element) => e.getBoundingClientRect();
		const choca = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
		const marca = [...document.querySelectorAll('[data-hoy] > *:not(.solo-lectores)')].map(r);
		const textos = [...document.querySelectorAll('.puerta-carrera .puerta-nombre, .puerta-carrera .puerta-lema')].map(r);
		return textos.some((t) => marca.some((m) => choca(t, m)));
	});
	expect(solapa).toBe(false);
});

for (const [url, clipped, date, raw] of [
 ['/futuros/#hoy', 'recortado', 'Fecha editorial heredada', '4,5×'],
 ['/en/futures/#hoy', 'clipped', 'Inherited editorial date', '4.5×'],
] as const) {
 test(`${url}: publica crecimiento sin recorte, fecha y límite del marcador`, async ({ page }) => {
  await page.goto(url);
  const resumen = page.locator('.hoy-resumen');
  await expect(resumen).toContainText(raw);
  await expect(resumen).toContainText('4–5×');
  await expect(resumen).toContainText('2026-10-02');
  await expect(resumen).toContainText(date);
  await expect(resumen).toContainText(clipped);
  await expect(resumen.locator('[data-frontera-cruda]')).toContainText(/1[.,]09/);
  await expect(page.locator('.senales-hoy')).not.toContainText('undefined');
 });
}
