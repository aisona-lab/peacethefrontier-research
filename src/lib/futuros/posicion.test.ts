import { describe, expect, test } from 'vitest';
import { cuadranteCercano, escribirPosicion, leerPosicion, mismaPosicion, presetDe, urlFuturo } from './posicion';

const preset = presetDe('carrera');
const leer = (consulta: string) => leerPosicion(new URLSearchParams(consulta), preset);

describe('posición en la URL', () => {
	test('lee valores válidos', () => {
		expect(leer('paz=0.7&frontera=0.3')).toEqual({ paz: 0.7, frontera: 0.3 });
	});

	test('recorta fuera de rango y usa el preset si no es un número', () => {
		expect(leer('paz=5&frontera=-2')).toEqual({ paz: 1, frontera: 0 });
		expect(leer('paz=abc&frontera=Infinity')).toEqual(preset);
		expect(leer('paz=&frontera=%20')).toEqual(preset);
		expect(leer('')).toEqual(preset);
	});

	test('escribe con dos decimales y se puede releer', () => {
		const texto = escribirPosicion({ paz: 0.7, frontera: 0.35 });
		expect(texto).toBe('paz=0.70&frontera=0.35');
		expect(leer(texto)).toEqual({ paz: 0.7, frontera: 0.35 });
	});

	test('mismaPosicion compara con tolerancia', () => {
		expect(mismaPosicion(preset, { paz: 0.15, frontera: 0.85 })).toBe(true);
		expect(mismaPosicion(preset, { paz: 0.2, frontera: 0.85 })).toBe(false);
	});

	test('redondea al paso de los controles (0,05) para que control, texto y modelo coincidan', () => {
		expect(leer('paz=0.33&frontera=0.71')).toEqual({ paz: 0.35, frontera: 0.7 });
	});

	test('con un solo parámetro, el otro eje toma el valor del futuro', () => {
		expect(leer('paz=0.3')).toEqual({ paz: 0.3, frontera: preset.frontera });
		expect(leer('frontera=0.2')).toEqual({ paz: preset.paz, frontera: 0.2 });
	});
});

describe('cuadrantes', () => {
	test('el cuadrante más cercano usa 0,5 como frontera, incluida', () => {
		expect(cuadranteCercano({ paz: 0.5, frontera: 0.5 })).toBe('frontera-en-paz');
		expect(cuadranteCercano({ paz: 0.9, frontera: 0.1 })).toBe('pausa');
		expect(cuadranteCercano({ paz: 0.49, frontera: 0.99 })).toBe('carrera');
		expect(cuadranteCercano({ paz: 0, frontera: 0 })).toBe('fractura');
	});

	test('cada preset cae en su propio cuadrante', () => {
		for (const id of ['pausa', 'frontera-en-paz', 'carrera', 'fractura'] as const)
			expect(cuadranteCercano(presetDe(id))).toBe(id);
	});

	test('las URL usan el slug de cada idioma', () => {
		expect(urlFuturo('es', 'frontera-en-paz')).toBe('/futuros/frontera-en-paz/');
		expect(urlFuturo('en', 'frontera-en-paz')).toBe('/en/futures/peaceful-frontier/');
	});
});
