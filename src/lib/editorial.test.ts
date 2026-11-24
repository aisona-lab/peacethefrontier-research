import { describe, expect, test } from 'vitest';
import { esDatosHasta, formatearDatosHasta } from './editorial';

describe('datosHasta', () => {
	test('acepta precisión mensual o diaria y rechaza fechas imposibles', () => {
		expect(esDatosHasta('2026-10')).toBe(true);
		expect(esDatosHasta('2026-10-23')).toBe(true);
		expect(esDatosHasta('2026-02-30')).toBe(false);
		expect(esDatosHasta('23-10-2026')).toBe(false);
	});

	test('conserva la precisión declarada en español e inglés', () => {
		expect(formatearDatosHasta('2026-10', 'es')).toBe('octubre de 2026');
		expect(formatearDatosHasta('2026-10', 'en')).toBe('October 2026');
		expect(formatearDatosHasta('2026-10-23', 'es')).toBe('23 de octubre de 2026');
	});
});
