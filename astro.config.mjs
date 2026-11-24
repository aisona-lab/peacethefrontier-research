// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { urlsArticulosBorrador } from './src/lib/sitemap-borradores.ts';
import { opcionesPerfil, dominioEspacio } from './src/lib/studio/espacios.ts';

const perfil = opcionesPerfil(process.env);
const SITE = `https://${perfil.multisite ? dominioEspacio(perfil.superficie) : 'peacethefrontier.com'}`;
const borradoresSitemap = urlsArticulosBorrador(SITE);

export default defineConfig({
	site: SITE,
	trailingSlash: 'always',
	build: {
		// Astro inserta en línea, sin hash CSP, el CSS de componentes usados dentro de MDX.
		// Con hojas externas todo queda cubierto por 'self'.
		inlineStylesheets: 'never',
	},
	integrations: [
		mdx(),
		sitemap({
			// Solo los borradores se sirven con noindex; no pedir que Google los rastree.
			filter: (pagina) => !borradoresSitemap.has(pagina),
		}),
	],
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Spectral',
			cssVariable: '--fuente-serif',
			weights: [200, 400, 600],
			styles: ['normal', 'italic'],
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Archivo',
			cssVariable: '--fuente-sans',
			weights: [400, 600],
			styles: ['normal'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
	],
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self' data:",
				"font-src 'self'",
				// Beacon manual: envía a cloudflareinsights.com (auto-install no inyecta en Workers Assets)
				"connect-src 'self' https://cloudflareinsights.com",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			// Cloudflare Web Analytics (auto-install / beacon). Sin esto el CSP bloquea el script.
			scriptDirective: {
				resources: ["'self'", 'https://static.cloudflareinsights.com'],
			},
			styleDirective: {
				// ponytail: atributos style="--x:…" para posicionar la regla; los <style> siguen con hash
				resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
			},
		},
	},
});
