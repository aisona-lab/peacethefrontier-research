import { expect, test } from 'vitest';
import { validarTemas } from './validar-temas';

const tema = (id: string, orden: number, slugEn = id) => ({ id, orden, slugEn });

test('acepta temas con orden y slug únicos', () => {
	expect(() => validarTemas([tema('ia', 1, 'ai'), tema('salud', 2, 'health')])).not.toThrow();
});

test('rechaza un orden repetido', () => {
	expect(() => validarTemas([tema('ia', 1), tema('salud', 1)])).toThrow('orden 1 repetido');
});

test('rechaza un slug en inglés repetido', () => {
	expect(() => validarTemas([tema('ia', 1, 'ai'), tema('computo', 2, 'ai')])).toThrow(
		'slug en "ai" repetido',
	);
});
