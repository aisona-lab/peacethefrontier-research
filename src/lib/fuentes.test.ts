import { describe, expect, test } from 'vitest';
import { esquemaFuente, fechaFuente } from './fuentes';

const base = { titulo: 'A source', organizacion: 'Publisher', tipo: 'oficial', url: 'https://example.org/report' };

describe('source provenance', () => {
	test('undated works do not borrow their access year', () => {
		const f = esquemaFuente.parse({ ...base, fechaAcceso: '2026-11-12' });
		expect(f.anio).toBeUndefined();
		expect(fechaFuente(f, 'en')).toBe('n.d.');
		expect(fechaFuente(f, 'es')).toBe('s. f.');
	});
	test('publication date remains distinct from access date', () => {
		const f = esquemaFuente.parse({ ...base, anio: 2024, fechaPublicacion: '2024-06', fechaAcceso: '2026-11-12', doi: '10.1038/example', archivo: 'https://web.archive.org/web/20240101/https://example.org/report', autores: ['A. Researcher'] });
		expect(fechaFuente(f, 'en')).toBe('2024');
		expect(f.fechaPublicacion).toBe('2024-06');
		expect(f.verificacion).toBe('pendiente');
	});
	test('rejects impossible publication dates and conflicting years', () => {
		expect(esquemaFuente.safeParse({ ...base, fechaPublicacion: '2024-02-30' }).success).toBe(false);
		expect(esquemaFuente.safeParse({ ...base, anio: 2023, fechaPublicacion: '2024-02' }).success).toBe(false);
	});
	test('verification requires an actual review date and successful access', () => {
		expect(esquemaFuente.safeParse({ ...base, verificacion: 'verificada' }).success).toBe(false);
		expect(esquemaFuente.safeParse({ ...base, verificacion: 'verificada', verificado: '2026-11-12', fechaAcceso: '2026-11-12' }).success).toBe(true);
	});
	test.each([null, '', 0, '0', '2024-02-30'])('rejects an empty or invalid access date: %s', (fechaAcceso) => {
		expect(esquemaFuente.safeParse({ ...base, verificacion: 'verificada', verificado: '2026-11-13', fechaAcceso }).success).toBe(false);
	});
});
