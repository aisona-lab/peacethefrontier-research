// Imágenes para redes (1200 × 630), una por página: abre cada página de dist/ con sus propias fuentes,
// pone encima una tarjeta con su og:title y og:description, y la fotografía en dist/og/<slug>.png.
// En contenedores de build sin navegador ni librerías gráficas (p. ej. Cloudflare /opt/buildhome),
// intenta descargar chromium-headless-shell y, si el entorno no dispone de librerías nativas,
// genera un PNG válido de 1200 × 630 en paleta cianotipo/sodio con node:zlib sin romper el deploy.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { deflateSync } from 'node:zlib';
import { slugOg } from '../src/lib/og.ts';

const DIST = process.env.PTF_DIST_DIR ?? 'dist';
const ANCHO = 1200;
const ALTO = 630;
const TIPOS = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.woff2': 'font/woff2',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.csv': 'text/csv',
};

const TABLA_CRC = new Uint32Array(256).map((_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(buf) {
	let crc = 0xffffffff;
	for (let i = 0; i < buf.length; i++) {
		crc = TABLA_CRC[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function bloquePng(tipo, datos) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(datos.length, 0);
	const tag = Buffer.from(tipo, 'ascii');
	const suma = Buffer.alloc(4);
	suma.writeUInt32BE(crc32(Buffer.concat([tag, datos])), 0);
	return Buffer.concat([len, tag, datos, suma]);
}

/** Genera un PNG RGB 1200×630 válido (fondo cianotipo #123a6b + acento sodio #f4b940) sin dependencias nativas. */
function crearPngCianotipoRespaldo() {
	const firma = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(ANCHO, 0);
	ihdr.writeUInt32BE(ALTO, 4);
	ihdr[8] = 8; // 8 bits por canal
	ihdr[9] = 2; // Truecolor RGB

	const stride = 1 + ANCHO * 3;
	const crudo = Buffer.alloc(stride * ALTO);
	for (let y = 0; y < ALTO; y++) {
		const fila = y * stride;
		crudo[fila] = 0; // filtro None
		const enMarco = y >= 56 && y < ALTO - 56;
		for (let x = 0; x < ANCHO; x++) {
			const p = fila + 1 + x * 3;
			// Barra vertical izquierda en amarillo sodio (#f4b940) sobre campo cianotipo (#123a6b)
			if (enMarco && x >= 72 && x < 80) {
				crudo[p] = 0xf4;
				crudo[p + 1] = 0xb9;
				crudo[p + 2] = 0x40;
			} else {
				crudo[p] = 0x12;
				crudo[p + 1] = 0x3a;
				crudo[p + 2] = 0x6b;
			}
		}
	}

	const idat = deflateSync(crudo, { level: 6 });
	return Buffer.concat([
		firma,
		bloquePng('IHDR', ihdr),
		bloquePng('IDAT', idat),
		bloquePng('IEND', Buffer.alloc(0)),
	]);
}

async function abrirChromium() {
	if (process.env.PTF_OG_FALLBACK === '1') return null;
	try {
		const { chromium } = await import('@playwright/test');
		if (!existsSync(chromium.executablePath())) {
			console.log('OG: Chromium no encontrado en caché; instalando chromium headless shell…');
			execFileSync('npx', ['playwright', 'install', 'chromium', '--only-shell'], {
				stdio: 'inherit',
			});
		}
		return await chromium.launch();
	} catch (error) {
		console.warn(
			`OG: Chromium no disponible en este contenedor (${error?.message?.split('\n')[0] ?? error}). Usando generador PNG nativo 1200×630.`,
		);
		return null;
	}
}

const paginas = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
if (paginas.length === 0) throw new Error('dist/ no tiene páginas: ejecuta astro build antes');

await mkdir(join(DIST, 'og'), { recursive: true });
const navegador = await abrirChromium();

if (!navegador) {
	const pngRespaldo = crearPngCianotipoRespaldo();
	for (const pagina of paginas) {
		const ruta = `/${pagina.replace(/index\.html$/, '').replace(/\\/g, '/')}`;
		await writeFile(join(DIST, 'og', `${slugOg(ruta)}.png`), pngRespaldo);
	}
	console.log(`OG: ${paginas.length} imágenes PNG (1200×630 respaldo nativo) en ${DIST}/og/`);
} else {
	const servidor = createServer(async (pedido, respuesta) => {
		const ruta = normalize(decodeURIComponent(new URL(pedido.url, 'http://x').pathname)).replace(
			/^(\.\.[/\\])+/,
			'',
		);
		const archivo = join(DIST, ruta.endsWith('/') ? `${ruta}index.html` : ruta);
		try {
			const contenido = await readFile(archivo);
			respuesta
				.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream' })
				.end(contenido);
		} catch {
			respuesta.writeHead(404).end();
		}
	});
	await new Promise((listo) => servidor.listen(0, '127.0.0.1', listo));
	const base = `http://127.0.0.1:${servidor.address().port}`;

	const pestana = await navegador.newPage({
		viewport: { width: ANCHO, height: ALTO },
		colorScheme: 'dark',
	});
	try {
		for (const pagina of paginas) {
			const ruta = `/${pagina.replace(/index\.html$/, '').replace(/\\/g, '/')}`;
			await pestana.goto(`${base}${ruta}`);
			await pestana.evaluate(async () => {
				const meta = (p) =>
					document.querySelector(`meta[property="${p}"]`)?.getAttribute('content') ?? '';
				const tarjeta = document.createElement('div');
				tarjeta.setAttribute(
					'style',
					'position:fixed;inset:0;z-index:2147483647;display:grid;grid-template-rows:auto 1fr auto;gap:28px;padding:64px 72px;background:#123a6b;color:#eef3f7;font-family:var(--fuente-sans)',
				);
				const marca = document.createElement('p');
				marca.textContent = 'Peace The Frontier';
				marca.setAttribute(
					'style',
					'margin:0;font:400 30px/1 var(--fuente-serif);border-left:6px solid #f4b940;padding-left:18px',
				);
				const titulo = document.createElement('p');
				const sinMarca = meta('og:title').replace(/^Peace The Frontier: /, '');
				titulo.textContent = sinMarca.charAt(0).toUpperCase() + sinMarca.slice(1);
				titulo.setAttribute(
					'style',
					'margin:0;align-self:end;font:400 68px/1.06 var(--fuente-serif);letter-spacing:-0.01em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden',
				);
				const descripcion = document.createElement('p');
				descripcion.textContent = meta('og:description');
				descripcion.setAttribute(
					'style',
					'margin:0;max-width:960px;color:#b3c6da;font:400 26px/1.35 var(--fuente-sans);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden',
				);
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
}
