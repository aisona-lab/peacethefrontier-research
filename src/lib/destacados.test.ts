import { describe, expect, test } from 'vitest';
import { erroresDestacados, resolverDestacados, type Destacado } from './destacados';

const destacados: readonly Destacado[] = [
	{ clave: 'agentes-capacidades', etiqueta: 'agentes', temas: ['ia', 'computo'] },
];
const temas = new Set(['ia', 'computo']);
const articulos = [
	{ id: 'en/a-different-slug', data: { clave: 'agentes-capacidades', estado: 'borrador' } },
	{ id: 'es/otro-slug', data: { clave: 'agentes-capacidades', estado: 'borrador' } },
];
const referencias = articulos.map((a) => ({ id: a.id, clave: a.data.clave }));

describe('validación de destacados', () => {
	test('acepta referencias bilingües aunque los slugs sean distintos de la clave', () => {
		expect(erroresDestacados(destacados, temas, referencias)).toEqual([]);
	});

	test('rechaza entradas repetidas', () => {
		expect(erroresDestacados([...destacados, ...destacados], temas, referencias)).toEqual([
			expect.stringMatching(/agentes-capacidades.*repetid/),
		]);
	});

	test('rechaza temas inexistentes', () => {
		expect(erroresDestacados(destacados, new Set(['ia']), referencias)).toEqual([
			expect.stringMatching(/agentes-capacidades.*computo.*no existe/),
		]);
	});

	test.each(['es', 'en'])('exige una versión en %s', (lang) => {
		expect(erroresDestacados(destacados, temas, referencias.filter((a) => !a.id.startsWith(`${lang}/`)))).toEqual([
			expect.stringContaining(`no tiene versión en ${lang}`),
		]);
	});

	test('rechaza un artículo ausente en ambos idiomas', () => {
		expect(erroresDestacados(destacados, temas, [])).toEqual([
			expect.stringContaining('no tiene versión en es'),
			expect.stringContaining('no tiene versión en en'),
		]);
	});

	test.each(['es', 'en'])('rechaza dos artículos con la misma clave en %s', (lang) => {
		expect(erroresDestacados(destacados, temas, [...referencias, { id: `${lang}/duplicado`, clave: 'agentes-capacidades' }])).toEqual([
			expect.stringMatching(new RegExp(`agentes-capacidades.*repetid.*${lang}`)),
		]);
	});

	test('no confunde prefijos parecidos con un idioma válido', () => {
		expect(erroresDestacados(destacados, temas, [{ id: 'espanol/a', clave: 'agentes-capacidades' }, referencias[0]])).toEqual([
			expect.stringContaining('no tiene versión en es'),
		]);
	});
});

describe('resolución de destacados', () => {
	test.each([['es', 'es/otro-slug'], ['en', 'en/a-different-slug']] as const)('resuelve por clave e idioma %s conservando el estado editorial', (lang, id) => {
		const resultado = resolverDestacados(lang, articulos, temas, destacados);
		expect(resultado).toHaveLength(1);
		expect(resultado[0].articulo).toEqual({ id, data: { clave: 'agentes-capacidades', estado: 'borrador' } });
	});

	test('falla antes de renderizar si falta la traducción, incluso en la página española', () => {
		expect(() => resolverDestacados('es', articulos.filter((a) => a.id.startsWith('es/')), temas, destacados)).toThrow(/no tiene versión en en/);
	});
});
