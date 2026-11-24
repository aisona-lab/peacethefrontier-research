// Imágenes para redes (1200 × 630), una por página: abre cada página de dist/ con sus propias fuentes,
// pone encima una tarjeta con su og:title y og:description, y la fotografía en dist/og/<slug>.png.
// Va después de `astro build` (npm run build). Usa el Chromium de Playwright, que ya está instalado.
import { chromium } from '@playwright/test';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { slugOg } from '../src/lib/og.ts';

const DIST = process.env.PTF_DIST_DIR ?? 'dist';
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.csv': 'text/csv' };

const paginas = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
if (paginas.length === 0) throw new Error('dist/ no tiene páginas: ejecuta astro build antes');

const servidor = createServer(async (pedido, respuesta) => {
	const ruta = normalize(decodeURIComponent(new URL(pedido.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
	const archivo = join(DIST, ruta.endsWith('/') ? `${ruta}index.html` : ruta);
	try {
		const contenido = await readFile(archivo);
		respuesta.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream' }).end(contenido);
	} catch {
		respuesta.writeHead(404).end();
	}
});
await new Promise((listo) => servidor.listen(0, '127.0.0.1', listo));
const base = `http://127.0.0.1:${servidor.address().port}`;

await mkdir(join(DIST, 'og'), { recursive: true });
const navegador = await chromium.launch();
const pestana = await navegador.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: 'dark' });
try {
	for (const pagina of paginas) {
		const ruta = `/${pagina.replace(/index\.html$/, '').replace(/\\/g, '/')}`;
		await pestana.goto(`${base}${ruta}`);
		await pestana.evaluate(async () => {
			const meta = (p) => document.querySelector(`meta[property="${p}"]`)?.getAttribute('content') ?? '';
			const tarjeta = document.createElement('div');
			tarjeta.setAttribute(
				'style',
				'position:fixed;inset:0;z-index:2147483647;display:grid;grid-template-rows:auto 1fr auto;gap:28px;padding:64px 72px;background:#123a6b;color:#eef3f7;font-family:var(--fuente-sans)',
			);
			const marca = document.createElement('p');
			marca.textContent = 'Peace The Frontier';
			marca.setAttribute('style', 'margin:0;font:400 30px/1 var(--fuente-serif);border-left:6px solid #f4b940;padding-left:18px');
			const titulo = document.createElement('p');
			// En la portada, og:title empieza por la marca, que ya va arriba.
			const sinMarca = meta('og:title').replace(/^Peace The Frontier: /, '');
			titulo.textContent = sinMarca.charAt(0).toUpperCase() + sinMarca.slice(1);
			titulo.setAttribute('style', 'margin:0;align-self:end;font:400 68px/1.06 var(--fuente-serif);letter-spacing:-0.01em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden');
			const descripcion = document.createElement('p');
			descripcion.textContent = meta('og:description');
			descripcion.setAttribute('style', 'margin:0;max-width:960px;color:#b3c6da;font:400 26px/1.35 var(--fuente-sans);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden');
			tarjeta.append(marca, titulo, descripcion);
			document.body.append(tarjeta);
			await document.fonts.ready;
		});
		await pestana.screenshot({ path: join(DIST, 'og', `${slugOg(ruta)}.png`) });
	}
} finally {
	await navegador.close();
	servidor.close();
}
console.log(`OG: ${paginas.length} imágenes en ${DIST}/og/`);
