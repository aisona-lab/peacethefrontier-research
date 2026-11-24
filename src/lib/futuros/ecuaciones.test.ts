import temml from 'temml';
import { expect, test } from 'vitest';
import { ECUACIONES } from './ecuaciones';
import { PARAMETROS } from './parametros';

test('hay una ecuación por cada pieza del modelo (spec §5.2)', () => {
	expect(ECUACIONES.map((e) => e.id)).toEqual([
		'capacidad',
		'automatizacion',
		'empleo',
		'desigualdad',
		'robots',
		'ciencia',
		'energiaIA',
		'energiaLimpia',
		'energia',
		'temperatura',
		'poblacion',
		'poder',
		'riesgo',
		'crisis',
	]);
});

test.each(ECUACIONES.map((e) => [e.id, e.latex]))('%s se convierte en MathML sin errores', (_, latex) => {
	const mathml = temml.renderToString(latex, { displayMode: true });
	expect(mathml).toMatch(/^<math/);
	expect(mathml).not.toMatch(/merror|tml-error/);
});

test.each(Object.entries(PARAMETROS).map(([n, p]) => [n, p.simbolo]))('el símbolo de %s se convierte sin errores', (_, simbolo) => {
	expect(temml.renderToString(simbolo)).not.toMatch(/merror|tml-error/);
});

test('las ecuaciones reflejan el modelo actual: techo de electricidad, poder en U y riesgo desde 0', () => {
	const latex = (id: string) => ECUACIONES.find((e) => e.id === id)!.latex;
	expect(latex('energiaIA')).toContain('tanh');
	expect(latex('energia')).toContain('\\gamma(f)');
	expect(latex('poder')).toContain('c_{inst}');
	expect(latex('riesgo')).toContain('\\tau < t');
});
