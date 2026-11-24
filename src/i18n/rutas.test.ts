import { describe, expect, test } from 'vitest';
import { otroIdioma, ruta, rutaTema, segmentoFinal } from './rutas';

describe('rutas por idioma', () => {
	test('el español va sin prefijo y el inglés bajo /en/', () => {
		expect(ruta('es', 'inicio')).toBe('/');
		expect(ruta('en', 'inicio')).toBe('/en/');
		expect(ruta('es', 'metodologia')).toBe('/metodologia/');
		expect(ruta('en', 'metodologia')).toBe('/en/methodology/');
	});

	test('los temas usan el slug de cada idioma y terminan en barra', () => {
		expect(rutaTema('es', 'conocimiento-antiguo')).toBe('/temas/conocimiento-antiguo/');
		expect(rutaTema('en', 'ancient-knowledge')).toBe('/en/topics/ancient-knowledge/');
	});

	test('otroIdioma alterna entre los dos', () => {
		expect(otroIdioma('es')).toBe('en');
		expect(otroIdioma('en')).toBe('es');
	});
});

test('segmentoFinal extrae el último tramo de una ruta', () => {
	expect(segmentoFinal('/en/methodology/')).toBe('methodology');
	expect(segmentoFinal('/metodologia/')).toBe('metodologia');
	expect(segmentoFinal('/')).toBe('');
});
