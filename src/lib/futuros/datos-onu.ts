// ONU, World Population Prospects 2024, variante media, mundo (miles de millones, a 1 de julio).
// Verificado el 2026-10-02 contra la serie oficial (vía Our World in Data); 2100: 10,18, intervalo 95 % 9,0–11,4.
export const POBLACION_ONU: readonly (readonly [anio: number, poblacion: number])[] = [
	[2025, 8.23],
	[2030, 8.57],
	[2035, 8.89],
	[2040, 9.18],
	[2045, 9.44],
	[2050, 9.66],
	[2055, 9.85],
	[2060, 9.99],
	[2065, 10.1],
	[2070, 10.19],
	[2075, 10.25],
	[2080, 10.28],
	[2085, 10.29],
	[2090, 10.27],
	[2095, 10.24],
	[2100, 10.18],
];

/** Interpola la variante media; después de 2100 prolonga la tasa 2095–2100 (la ONU no proyecta más allá). */
export function poblacionOnu(anio: number): number {
	const [primero] = POBLACION_ONU;
	const ultimo = POBLACION_ONU[POBLACION_ONU.length - 1];
	const penultimo = POBLACION_ONU[POBLACION_ONU.length - 2];
	if (anio <= primero[0]) return primero[1];
	if (anio >= ultimo[0]) {
		const tasa = (ultimo[1] / penultimo[1]) ** (1 / (ultimo[0] - penultimo[0]));
		return ultimo[1] * tasa ** (anio - ultimo[0]);
	}
	const i = POBLACION_ONU.findIndex(([a]) => a > anio);
	const [a0, v0] = POBLACION_ONU[i - 1];
	const [a1, v1] = POBLACION_ONU[i];
	return v0 + ((v1 - v0) * (anio - a0)) / (a1 - a0);
}
