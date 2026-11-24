// Revisa cada página de dist/: todo <script> y <style> en línea debe tener su hash en el <meta> CSP.
// Existe porque Astro a veces inserta CSS en línea sin hash (componentes dentro de MDX).
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = process.env.PTF_DIST_DIR ?? 'dist';
const BLOQUE = /<(script|style)(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/\1>/g;

const paginas = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
if (paginas.length === 0) throw new Error('dist/ no tiene páginas: ejecuta npm run build antes');

const fallos = [];
for (const pagina of paginas) {
	const html = await readFile(join(DIST, pagina), 'utf8');
	const csp = html.match(/http-equiv="content-security-policy" content="([^"]+)"/)?.[1];
	if (!csp) {
		fallos.push(`${pagina}: sin <meta> CSP`);
		continue;
	}
	for (const [, tipo, contenido] of html.matchAll(BLOQUE)) {
		const hash = `sha256-${createHash('sha256').update(contenido).digest('base64')}`;
		if (!csp.includes(hash)) fallos.push(`${pagina}: <${tipo}> sin hash (${contenido.slice(0, 50)}…)`);
	}
}

if (fallos.length) {
	console.error(`CSP: ${fallos.length} problema(s)\n${fallos.join('\n')}`);
	process.exit(1);
}
console.log(`CSP: ${paginas.length} páginas, todos los bloques en línea tienen hash.`);
