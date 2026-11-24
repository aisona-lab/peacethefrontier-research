// Reglas entre temas que Zod no puede ver (valida cada entrada por separado).

interface TemaMinimo {
	id: string;
	orden: number;
	slugEn: string;
}

const repetidos = (valores: readonly (string | number)[]) =>
	[...new Set(valores.filter((v, i) => valores.indexOf(v) !== i))];

/** Lanza un error legible si dos temas comparten orden o slug: rompe el build antes de publicar. */
export function validarTemas(temas: readonly TemaMinimo[]) {
	const errores = [
		...repetidos(temas.map((t) => t.orden)).map((o) => `orden ${o} repetido`),
		...repetidos(temas.map((t) => t.slugEn)).map((s) => `slug en "${s}" repetido`),
	];
	if (errores.length) throw new Error(`temas.yaml: ${errores.join('; ')}`);
}
