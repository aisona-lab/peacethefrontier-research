import { describe, expect, test } from 'vitest';
import { destino, escribirElecciones, etiqueta, leerElecciones, recorrer, type Decision } from './motor';

const neutro = { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 0 } as const;
const opcion = (id: string, paz: number, frontera: number) => ({
	id,
	texto: { es: id, en: id },
	criterios: neutro,
	efecto: { paz, frontera },
});
const DECISIONES: Decision[] = [
	{ id: 'a', anio: 2026, titulo: { es: 'a', en: 'a' }, contexto: { es: '', en: '' }, fuentes: ['x'], opciones: [opcion('si', 0.3, -0.2), opcion('no', -0.1, 0.1)] },
	{ id: 'b', anio: 2027, titulo: { es: 'b', en: 'b' }, contexto: { es: '', en: '' }, fuentes: ['x'], opciones: [opcion('si', 0.3, -0.2), opcion('no', -0.4, 0)] },
];

describe('etiqueta ética: suma de los cuatro criterios', () => {
	test('≥ 2 es ética, ≤ −2 no ética y en medio ambigua', () => {
		expect(etiqueta({ danio: 1, consentimiento: 1, reparto: 0, reversibilidad: 0 })).toBe('etico');
		expect(etiqueta({ danio: -1, consentimiento: 0, reparto: -1, reversibilidad: 0 })).toBe('no-etico');
		expect(etiqueta({ danio: 1, consentimiento: -1, reparto: 1, reversibilidad: 0 })).toBe('ambiguo');
		expect(etiqueta(neutro)).toBe('ambiguo');
	});
});

describe('recorrer', () => {
	test('parte de hoy y suma el efecto de cada elección; sin elegir, no se mueve', () => {
		const pasos = recorrer(DECISIONES, ['si', undefined], { paz: 0.25, frontera: 1 });
		expect(pasos).toHaveLength(3);
		expect(pasos[1].paz).toBeCloseTo(0.55, 10);
		expect(pasos[1].frontera).toBeCloseTo(0.8, 10);
		expect(pasos[2]).toEqual(pasos[1]);
	});

	test('cada paso se queda dentro de la matriz', () => {
		const pasos = recorrer(DECISIONES, ['no', 'no'], { paz: 0.25, frontera: 1 });
		expect(pasos[1]).toEqual({ paz: expect.closeTo(0.15, 10), frontera: 1 });
		expect(pasos[2].paz).toBe(0);
	});
});

describe('elecciones en la URL', () => {
	test('ida y vuelta, ignorando ids que no existen', () => {
		expect(escribirElecciones(['si', undefined])).toBe('si');
		expect(escribirElecciones([undefined, 'no'])).toBe('.no');
		expect(leerElecciones(DECISIONES, '.no')).toEqual([undefined, 'no']);
		expect(leerElecciones(DECISIONES, 'quizas.si.extra')).toEqual([undefined, 'si']);
		expect(leerElecciones(DECISIONES, null)).toEqual([undefined, undefined]);
	});
});

describe('destino', () => {
	test('el futuro más cercano, con la posición redondeada al paso de la matriz', () => {
		expect(destino({ paz: 0.81, frontera: 0.12 }, 'es')).toEqual({ id: 'pausa', url: '/futuros/pausa/?paz=0.80&frontera=0.10' });
		expect(destino({ paz: 0.15, frontera: 0.85 }, 'en')).toEqual({ id: 'carrera', url: '/en/futures/race/' });
	});
});
