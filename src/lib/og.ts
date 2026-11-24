// Nombre de la imagen para redes de cada ruta: /futuros/carrera/ → futuros-carrera.
// Lo usan Base.astro y scripts/generar-og.mjs (Node ejecuta TypeScript sin compilar).
export function slugOg(ruta: string): string {
	return ruta.replace(/\.html$/, '').replace(/^\/+|\/+$/g, '').replaceAll('/', '-') || 'inicio';
}
