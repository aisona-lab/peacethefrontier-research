import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.route('https://static.cloudflareinsights.com/**', (route) =>
		route.fulfill({ contentType: 'application/javascript', body: '' }),
	);
});

test.describe('un futuro sin JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('muestra relato, cifras y gráficos; no muestra controles', async ({ page }) => {
		await page.goto('/futuros/carrera/');
		await expect(page.locator('h1')).toHaveText('Carrera');
		await expect(page.locator('[data-cifra="automatizacion"][data-anio="2036"]')).toHaveText(/\d/);
		await expect(page.locator('[data-linea="temperatura"]')).toHaveAttribute('d', /^M0,/);
		await expect(page.locator('[id="2046"] .parada-resumen')).toBeVisible();
		await expect(page.locator('[data-controles]')).toBeHidden();
	});
});
test.describe('un futuro interactivo', () => {
	test('mover Paz con el teclado actualiza URL, cifras, gráfico y descripción', async ({ page, isMobile }) => {
		test.skip(isMobile, 'en móvil los controles están en la barra plegada; se prueba aparte');
		await page.goto('/futuros/carrera/');
		const cifra = page.locator('[data-cifra="desigualdad"][data-anio="2056"]');
		const linea = page.locator('[data-linea="riesgo"]');
		const antesCifra = await cifra.textContent();
		const antesLinea = await linea.getAttribute('d');
		const paz = page.getByRole('slider', { name: 'Paz' });
		await paz.focus();
		for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
		await expect(page).toHaveURL(/\?paz=0\.65&frontera=0\.85/);
		await expect(cifra).not.toHaveText(antesCifra ?? '');
		await expect(linea).not.toHaveAttribute('d', antesLinea ?? '');
		await expect(paz).toHaveAttribute('aria-valuetext', /^Paz 65 %/);
	});

	test('una posición de otro cuadrante muestra el aviso con enlace a ese relato', async ({ page }) => {
		await page.goto('/futuros/carrera/?paz=0.9&frontera=0.9');
		const aviso = page.locator('[data-aviso]');
		await expect(aviso).toBeVisible();
		await expect(aviso).toContainText('Frontera en paz');
		await expect(aviso.getByRole('link')).toHaveAttribute(
			'href',
			/^\/futuros\/frontera-en-paz\/\?paz=0\.90&frontera=0\.90#20\d6$/,
		);
	});

	test('parámetros inválidos caen al futuro y se recortan, sin errores', async ({ page }) => {
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/?paz=abc&frontera=5');
		// Por name y no por rol: en móvil el panel está plegado y getByRole ignora lo oculto.
		await expect(page.locator('input[name="paz"]')).toHaveValue('0.15');
		await expect(page.locator('input[name="frontera"]')).toHaveValue('1');
		expect(errores).toEqual([]);
	});

	test('un hash que no es una década no rompe la página (Review Focus 2)', async ({ page }) => {
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/#abc');
		await expect(page.locator('.panel-anio')).toHaveText(/^20\d\d$/);
		await page.goto('/futuros/carrera/#2050');
		await expect(page.locator('.panel-anio')).toHaveText(/^20\d\d$/);
		expect(errores).toEqual([]);
	});

	test('un arrastre rápido termina en el último valor, sin errores (Review Focus 3)', async ({ page }) => {
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/');
		await page.evaluate(() => {
			const control = document.querySelector<HTMLInputElement>('input[name="frontera"]')!;
			for (let i = 0; i <= 20; i++) {
				control.value = String(i / 20);
				control.dispatchEvent(new Event('input', { bubbles: true }));
			}
		});
		await expect(page).toHaveURL(/frontera=1\.00/);
		await expect(page.locator('[data-salida="frontera"]')).toHaveText(/100/);
		expect(errores).toEqual([]);
	});

	test('“Volver a Carrera” restaura la posición y limpia la URL (Review Focus 4)', async ({ page, isMobile }) => {
		test.skip(isMobile, 'en móvil el botón está en la barra plegada');
		await page.goto('/futuros/carrera/?paz=0.5&frontera=0.5');
		await page.getByRole('button', { name: 'Volver a Carrera' }).click();
		await expect(page).toHaveURL(/\/futuros\/carrera\/(#\d+)?$/);
		await expect(page.getByRole('slider', { name: 'Paz' })).toHaveValue('0.15');
		await expect(page.locator('[data-aviso]')).toBeHidden();
	});

	test('el año del panel sigue a la década visible y la mini matriz conserva el año', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/futuros/carrera/');
		// Tras cargar las fuentes y sin animación: si no, la altura del texto cambia durante el scroll.
		await page.locator('[id="2086"]').evaluate(async (el) => {
			await document.fonts.ready;
			el.scrollIntoView({ block: 'center', behavior: 'instant' });
		});
		await expect(page.locator('.panel-anio')).toHaveText('2086');
		await expect(page.locator('[data-puerta="pausa"]')).toHaveAttribute('href', '/futuros/pausa/#2086');
	});

	test('en móvil el panel es una barra que se despliega', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 800 });
		await page.goto('/futuros/carrera/');
		const barra = page.locator('[data-barra]');
		await expect(barra).toBeVisible();
		await expect(page.getByRole('slider', { name: 'Paz' })).toBeHidden();
		await barra.click();
		await expect(barra).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByRole('slider', { name: 'Paz' })).toBeVisible();
	});
});
test('en inglés las cifras y la descripción del control están en inglés', async ({ page, isMobile }) => {
	test.skip(isMobile, 'en móvil los controles están en la barra plegada');
	await page.goto('/en/futures/race/');
	await expect(page.locator('h1')).toHaveText('Race');
	await expect(page.locator('[data-cifra="temperatura"][data-anio="2056"]')).toHaveText(/^\d\.\d °C$/);
	const paz = page.getByRole('slider', { name: 'Peace' });
	await paz.focus();
	await page.keyboard.press('ArrowRight');
	await expect(paz).toHaveAttribute('aria-valuetext', /^Peace 20%: little cooperation$/);
});

test('el selector de idioma lleva al mismo futuro en el otro idioma', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/futuros/frontera-en-paz/');
	await page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
	await expect(page).toHaveURL(/\/en\/futures\/peaceful-frontier\/$/);
});

test('la matriz no hereda los estilos de lista de los textos largos', async ({ page }) => {
	await page.goto('/futuros/');
	const estilos = await page.locator('.matriz-rejilla').evaluate((ul) => {
		const li = ul.querySelectorAll('li')[1];
		return { sangria: getComputedStyle(ul).paddingLeft, margen: getComputedStyle(li).marginTop };
	});
	expect(estilos).toEqual({ sangria: '0px', margen: '0px' });
});
test.describe('portada', () => {
	for (const [inicio, etiqueta, nombre, destino] of [
		['/atlas/', 'Los cuatro futuros', 'Carrera', /\/futuros\/carrera\/$/],
		['/en/atlas/', 'The four futures', 'Race', /\/en\/futures\/race\/$/],
	] as const) {
		test(`${inicio}: cuatro puertas y la de ${nombre} lleva a su futuro`, async ({ page }) => {
			await page.goto(inicio);
			const matriz = page.getByRole('list', { name: etiqueta });
			await expect(matriz.getByRole('link')).toHaveCount(4);
			await matriz.getByRole('link', { name: new RegExp(nombre) }).click();
			await expect(page).toHaveURL(destino);
			await expect(page.locator('h1')).toHaveText(nombre);
		});
	}

	test('la cabecera enlaza a Futuros en escritorio', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/atlas/');
		await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Futuros' }).click();
		await expect(page).toHaveURL(/\/futuros\/$/);
	});
});

test.describe('honestidad de la tabla de parámetros', () => {
	test('distingue estimación, derivación, calibración y supuesto', async ({ page }) => {
		await page.goto('/futuros/');
		await expect(page.locator('#parametro-tcre td').last()).toContainText('Estimado');
		await expect(page.locator('#parametro-tcre td').last()).toContainText('IPCC');
		await expect(page.locator('#parametro-hNat td').last()).toContainText('Calibrado con');
		await expect(page.locator('#parametro-kMax td').last()).toContainText('Supuesto');
		await expect(page.locator('#parametro-kMax td').last()).toContainText('contexto');
		await expect(page.locator('#parametro-lMax td').last()).toHaveText('Supuesto');
	});

	test('en inglés las organizaciones se nombran en inglés', async ({ page }) => {
		await page.goto('/en/futures/');
		const tabla = page.locator('.tabla-parametros');
		await expect(tabla).toContainText('International Labour Organization');
		await expect(tabla).not.toContainText('Organización Internacional del Trabajo');
		await expect(tabla).not.toContainText('Agencia Internacional de la Energía');
		await expect(page.locator('#parametro-hNat td').last()).toContainText('Calibrated against');
	});
});

test('la calibración muestra el rango objetivo, la unidad y el tipo de referencia', async ({ page }) => {
	await page.goto('/futuros/');
	const riesgo = page.locator('.objetivo', { hasText: 'superpronosticadores' });
	await expect(riesgo).toContainText('Estimación de expertos');
	await expect(riesgo).toContainText(/Objetivo: entre 9\s%\sy 20\s%/);
	await expect(page.locator('.objetivo', { hasText: 'Población en 2100' })).toContainText('mil millones');
	await expect(page.locator('.calibracion')).not.toContainText('cifras oficiales');
});

test('mover los controles dentro del mismo cuadrante también avisa que el texto es el del escenario base', async ({ page }) => {
	await page.goto('/futuros/fractura/?paz=0.45&frontera=0.1');
	const aviso = page.locator('[data-aviso]');
	await expect(aviso).toBeVisible();
	await expect(aviso).toContainText('escenario base');
	await expect(aviso.getByRole('link')).toHaveCount(0);
});

test.describe('la isla aguanta saltos, arrastres largos e idiomas (revisión, hallazgos 3 y 5)', () => {
	test('tras un salto que deja un límite de década en la franja, el panel acaba en la década que se lee', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/futuros/carrera/');
		await page.evaluate(async () => {
			await document.fonts.ready;
			const limite = document.getElementById('2086')!.getBoundingClientRect().top + scrollY;
			scrollTo({ top: limite - innerHeight * 0.425, behavior: 'instant' });
			// Dos fotogramas: el observador entrega sus entradas antes del segundo desplazamiento.
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		});
		await page.evaluate(() => scrollBy({ top: innerHeight * 0.05, behavior: 'instant' }));
		await expect(page.locator('.panel-anio')).toHaveText('2086');
	});

	test('un arrastre largo no escribe la URL en cada fotograma (Safari limita replaceState)', async ({ page }) => {
			await page.clock.install();
		await page.addInitScript(() => {
			const original = history.replaceState.bind(history);
			(window as unknown as { escrituras: number }).escrituras = 0;
			history.replaceState = (...args: Parameters<History['replaceState']>) => {
				(window as unknown as { escrituras: number }).escrituras++;
				return original(...args);
			};
		});
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/');
			await page.clock.pauseAt(new Date(Date.now() + 1000));
			await page.evaluate(() => {
			const control = document.querySelector<HTMLInputElement>('input[name="paz"]')!;
				let i = 0;
				const fotograma = () => {
				control.value = String((i % 20) / 20);
				control.dispatchEvent(new Event('input', { bubbles: true }));
					if (++i < 120) requestAnimationFrame(fotograma);
				};
				requestAnimationFrame(fotograma);
		});
			// El reloj mantiene 120 fotogramas a 60 Hz incluso con la CPU compartida.
			await page.clock.runFor(2500);
		await expect(page).toHaveURL(/paz=0\.95/);
		const escrituras = await page.evaluate(() => (window as unknown as { escrituras: number }).escrituras);
		expect(escrituras).toBeLessThan(10);
		expect(errores).toEqual([]);
	});

	test('#2050 se ajusta a su década (2046)', async ({ page }) => {
		await page.goto('/futuros/carrera/#2050');
		await expect(page.locator('.panel-anio')).toHaveText(/^20\d6$/);
	});

	test('el selector de idioma conserva la posición y el año', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/futuros/carrera/?paz=0.5&frontera=0.5');
		await expect(page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: /EN/ })).toHaveAttribute(
			'href',
			/^\/en\/futures\/race\/\?paz=0\.50&frontera=0\.50(#20\d6)?$/,
		);
	});
});

test('el riesgo enlaza a su definición y /futuros/ se marca como escenario', async ({ page }) => {
	await page.goto('/futuros/carrera/');
	await expect(page.locator('[data-grafico="riesgo"] .grafico-titulo a')).toHaveAttribute('href', '/futuros/#ecuacion-riesgo');
	await page.goto('/futuros/');
	await expect(page.locator('.pagina-texto .futuro-nivel')).toContainText('Escenario, no predicción');
});

test.describe('sensibilidad, datos y cita (fase G2)', () => {
	test('/futuros/ muestra qué parámetros pesan más, con enlace a su fila', async ({ page }) => {
		await page.goto('/futuros/');
		const figuras = page.locator('figure.sensibilidad');
		await expect(figuras).toHaveCount(3);
		for (const figura of await figuras.all()) await expect(figura.locator('tbody tr')).toHaveCount(6);
		const primera = figuras.first().locator('tbody tr').first();
		await expect(primera.locator('a')).toHaveAttribute('href', '#parametro-hConf');
		await expect(page.locator('#parametro-hConf')).toHaveCount(1);
	});

	test('a 320 px las tablas de sensibilidad caben en su columna', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 800 });
		await page.goto('/futuros/');
		const sobrantes = await page.locator('figure.sensibilidad').evaluateAll((figuras) =>
			figuras.map((f) => f.querySelector('table')!.getBoundingClientRect().right - f.getBoundingClientRect().right),
		);
		for (const sobra of sobrantes) expect(sobra).toBeLessThanOrEqual(0.5);
	});

	test('cada futuro ofrece su CSV y cómo citarlo', async ({ page, request }) => {
		await page.goto('/en/futures/race/');
		const enlace = page.getByRole('link', { name: 'Download the data (CSV)' });
		await expect(enlace).toHaveAttribute('download', '');
		const respuesta = await request.get((await enlace.getAttribute('href')) ?? '');
		expect(respuesta.headers()['content-type']).toContain('text/csv');
		const lineas = (await respuesta.text()).trimEnd().split('\n');
		expect(lineas[0]).toBe('anio,indicador,unidad,p10,p50,p90');
		expect(lineas).toHaveLength(1 + 101 * 12);
		await page.locator('.citar summary').click();
		await expect(page.locator('.citar-texto')).toContainText('“Futures: Race.”');
		await expect(page.locator('.citar-texto')).toContainText('/en/futures/race/');
	});
});

test.describe('la isla no recalcula lo que el HTML ya trae (Lighthouse TBT)', () => {
	const calculos = (page: import('@playwright/test').Page) =>
		page.evaluate(() => performance.getEntriesByName('ptf-futuro:proyectar').length);

	test('en la posición base y en 2026 no calcula al cargar; sí al mover un control', async ({ page, isMobile }) => {
		await page.goto('/futuros/carrera/');
		await expect(page.locator('ptf-futuro')).toHaveAttribute('data-interactivo', '');
		expect(await calculos(page)).toBe(0);
		test.skip(isMobile, 'en móvil los controles están en la barra plegada');
		await page.getByRole('slider', { name: 'Paz' }).focus();
		await page.keyboard.press('ArrowRight');
		await expect.poll(() => calculos(page)).toBe(1);
	});

	test('con otra posición en la URL sí calcula al cargar', async ({ page }) => {
		await page.goto('/futuros/carrera/?paz=0.5&frontera=0.5');
		await expect.poll(() => calculos(page)).toBe(1);
	});
});

for (const [url, derived, estimated, units, period, notes, interpolation, bands] of [
 ['/futuros/', 'Derivado', 'Estimado', 'Unidad', 'Periodo de referencia', 'Derivación y límites', 'interpolación', 'sensibilidad condicional'],
 ['/en/futures/', 'Derived', 'Estimated', 'Unit', 'Reference period', 'Derivation and limitations', 'interpolation', 'conditional sensitivity'],
] as const) {
 test(`${url}: procedencia bilingüe y límites de las bandas`, async ({ page }) => {
  await page.goto(url);
  const tabla = page.locator('.tabla-parametros');
  for (const heading of [units, period, notes]) await expect(tabla.getByRole('columnheader', {name: heading, exact: true})).toBeVisible();
  await expect(page.locator('#parametro-gMax')).toContainText(derived);
  await expect(page.locator('#parametro-eia0')).toContainText(estimated);
  await expect(page.locator('#parametro-eia0')).toContainText(interpolation);
  await expect(page.locator('#parametro-gini0')).toContainText('2018');
  await expect(page.locator('.modelo-bandas')).toContainText(bands);
  await expect(tabla).not.toContainText('undefined');
 });
}

test('el panel etiqueta la electricidad con la base de todos los centros de datos', async ({ page }) => {
 await page.goto('/en/futures/race/');
 await expect(page.locator('[data-grafico="energiaIA"] .grafico-titulo')).toContainText('Data-centre electricity');
 await expect(page.locator('[data-grafico="energiaIA"]')).toContainText('all data centres');
 await expect(page.locator('.panel-contenido .modelo-bandas')).toContainText('conditional sensitivity');
});
