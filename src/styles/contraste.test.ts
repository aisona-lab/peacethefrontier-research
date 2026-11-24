import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const css = readFileSync('src/styles/tokens.css', 'utf8');

/** [claro, oscuro] de un token definido con light-dark(#claro, #oscuro). */
function par(nombre: string): [string, string] {
	const m = css.match(new RegExp(`--${nombre}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`, 'i'));
	if (!m) throw new Error(`Falta el token --${nombre} en tokens.css`);
	return [m[1], m[2]];
}

const luminancia = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contraste = (a: string, b: string) => {
	const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
};

test.each(['humanidad', 'tecnologia', 'ciencia', 'planeta', 'politica'])(
	'--ambito-%s tiene contraste AA sobre fondo y superficie en ambos temas',
	(ambito) => {
		const [claro, oscuro] = par(`ambito-${ambito}`);
		for (const fondo of ['fondo', 'superficie']) {
			const [fondoClaro, fondoOscuro] = par(fondo);
			expect(contraste(claro, fondoClaro)).toBeGreaterThanOrEqual(4.5);
			expect(contraste(oscuro, fondoOscuro)).toBeGreaterThanOrEqual(4.5);
		}
	},
);

test.each(['etico', 'no-etico'])('--%s (etiquetas de los caminos) tiene contraste AA sobre fondo y superficie', (token) => {
	const [claro, oscuro] = par(token);
	for (const fondo of ['fondo', 'superficie']) {
		const [fondoClaro, fondoOscuro] = par(fondo);
		expect(contraste(claro, fondoClaro), `${token} claro sobre ${fondo}`).toBeGreaterThanOrEqual(4.5);
		expect(contraste(oscuro, fondoOscuro), `${token} oscuro sobre ${fondo}`).toBeGreaterThanOrEqual(4.5);
	}
});
