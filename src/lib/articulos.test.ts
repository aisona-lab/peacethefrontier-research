import { describe, expect, test } from 'vitest';
import { erroresArticulo, erroresPares, erroresRevision, erroresNotas } from './articulos';

test('las referencias declaradas deben citarse en el cuerpo y en orden', () => {
	expect(erroresNotas('es/prueba', ['a', 'b'], '<Nota f="a" /> y <Nota f="b" /> <Nota f="a" />')).toEqual([]);
	expect(erroresNotas('es/prueba', ['a'], 'Sin citas')).toEqual([expect.stringContaining('sin cita')]);
	expect(erroresNotas('es/prueba', ['a'], '<Nota f="a" /> <Nota f="inventada" />')).toEqual([expect.stringContaining('no declarada')]);
	expect(erroresNotas('es/prueba', ['a', 'b'], '<Nota f="b" /> <Nota f="a" />')).toEqual([expect.stringContaining('orden')]);
});

test.each(['{/* <Nota f="a" /> */}', '`<Nota f="a" />`', '```mdx\n<Nota f="a" />\n```'])('las citas no visibles no cuentan: %s', (cuerpo) => {
	expect(erroresNotas('es/prueba', ['a'], cuerpo)).toEqual([expect.stringContaining('sin cita')]);
});

const temas = new Set(['computo', 'energia']);
const base = { id: 'es/computo', evidencia: 'emergente' as const, temas: ['computo'], tiposFuentes: ['preprint', 'oficial'] };

describe('validación de artículos (R2.4)', () => {
	test('un artículo válido no da errores', () => {
		expect(erroresArticulo(base, temas)).toEqual([]);
	});

	test('sin fuente oficial ni revisada por pares falla, salvo si es un escenario', () => {
		const soloPreprints = { ...base, tiposFuentes: ['preprint', 'analisis'] };
		expect(erroresArticulo(soloPreprints, temas)).toEqual([expect.stringMatching(/R2\.4/)]);
		expect(erroresArticulo({ ...soloPreprints, evidencia: 'escenario-ficcion' }, temas)).toEqual([]);
	});

	test('un tema que no existe falla', () => {
		expect(erroresArticulo({ ...base, temas: ['computo', 'magia'] }, temas)).toEqual([expect.stringMatching(/magia/)]);
	});
});

describe('pares de idioma', () => {
	test('cada clave tiene versión en español y en inglés', () => {
		expect(erroresPares([{ id: 'es/a', clave: 'a' }, { id: 'en/a-en', clave: 'a' }])).toEqual([]);
		expect(erroresPares([{ id: 'es/a', clave: 'a' }])).toEqual([expect.stringMatching(/a.*en/)]);
	});
	test('rechaza dos versiones del mismo idioma para una clave', () => {
		expect(erroresPares([{ id: 'es/a', clave: 'a' }, { id: 'es/otro', clave: 'a' }, { id: 'en/a', clave: 'a' }])).toEqual([expect.stringMatching(/duplicad/)]);
	});
});

describe('integridad editorial', () => {
	const ficha = { id: 'es/a', clave: 'a', fuentes: ['oficial'], evidencia: 'emergente', estado: 'borrador', publicado: new Date('2026-10-02'), revisado: new Date('2026-11-12') };
	test('no permite referencias ausentes aunque otra fuente sea fiable', () => {
		expect(erroresRevision([ficha, { ...ficha, id: 'en/a', fuentes: ['oficial', 'inexistente'] }], new Set(['oficial']))).toContainEqual(expect.stringMatching(/inexistente/));
	});
	test('la traducción no puede cambiar fuentes o nivel de evidencia silenciosamente', () => {
		expect(erroresRevision([ficha, { ...ficha, id: 'en/a', evidencia: 'consenso' }], new Set(['oficial']))).toContainEqual(expect.stringMatching(/evidencia/));
	});
	test('la fecha de investigación no puede ser posterior a la revisión', () => {
		expect(erroresRevision([{ ...ficha, investigadoHasta: '2026-12-01' }], new Set(['oficial']))).toContainEqual(expect.stringMatching(/investig/));
	});
	test('las fechas de publicación y revisión deben coincidir entre traducciones', () => {
		for (const campo of ['publicado', 'revisado'] as const) {
			expect(erroresRevision([ficha, { ...ficha, id: 'en/a', [campo]: new Date('2026-11-13') }], new Set(['oficial']))).toContainEqual(expect.stringContaining(campo));
		}
	});
	test('hipótesis, experimento y repositorioCodigo deben coincidir y apuntar a artefactos reales', () => {
		const conExp = { ...ficha, hipotesis: 'H1', experimento: 'h1-delegacion-autonoma', repositorioCodigo: 'experiments/h1-delegacion-autonoma' };
		expect(erroresRevision([conExp, { ...conExp, id: 'en/a' }], new Set(['oficial']), new Set(['h1-delegacion-autonoma']))).toEqual([]);
		expect(erroresRevision([conExp, { ...conExp, id: 'en/a', hipotesis: 'H2' }], new Set(['oficial']), new Set(['h1-delegacion-autonoma']))).toContainEqual(expect.stringContaining('hipotesis'));
		expect(erroresRevision([{ ...conExp, repositorioCodigo: undefined }], new Set(['oficial']), new Set(['h1-delegacion-autonoma']))).toContainEqual(expect.stringContaining('repositorioCodigo'));
		expect(erroresRevision([conExp], new Set(['oficial']), new Set(['otro']))).toContainEqual(expect.stringContaining('experimento inexistente'));
	});
	test('un working paper de hipótesis no puede subir a v1.0 sin calibración empírica y >= 2 revisores externos (R23.2)', () => {
		const wp = { ...ficha, tipoPublicacion: 'working-paper', hipotesis: 'H1', version: '1.0.0', calibradoConDatosReales: false, revisoresExternos: [] };
		expect(erroresRevision([wp], new Set(['oficial']))).toContainEqual(expect.stringMatching(/R23\.2/));
		expect(erroresRevision([{ ...wp, version: '0.2.0' }], new Set(['oficial']))).toEqual([]);
		expect(erroresRevision([{ ...wp, calibradoConDatosReales: true, revisoresExternos: [{ nombre: 'Rev 1' }, { nombre: 'Rev 2' }] }], new Set(['oficial']))).toEqual([]);
	});
});
