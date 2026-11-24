import { expect, test } from 'vitest';
import { slugOg } from './og.ts';

test('cada ruta tiene un nombre de imagen único y estable', () => {
	expect(slugOg('/')).toBe('inicio');
	expect(slugOg('/en/')).toBe('en');
	expect(slugOg('/futuros/carrera/')).toBe('futuros-carrera');
	expect(slugOg('/en/articles/ai-electricity/')).toBe('en-articles-ai-electricity');
	expect(slugOg('/404')).toBe('404');
	expect(slugOg('/404.html')).toBe('404');
});
