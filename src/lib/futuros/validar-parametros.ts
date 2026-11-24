// Validación de los parámetros con Zod. Vive aparte de parametros.ts porque la isla del navegador importa
// parametros.ts, y Zod en el navegador intenta usar eval (bloqueado por la CSP). Solo la usan el build y las pruebas.
import { z } from 'astro/zod';
import { PARAMETROS, type Parametro } from './parametros';

const bilingue = z.object({ es: z.string().trim().min(1), en: z.string().trim().min(1) });

const esquema = z
	.object({
		simbolo: z.string().min(1),
		descripcion: bilingue,
		unidad: bilingue,
		periodo: bilingue,
		notas: bilingue,
		central: z.number(),
		min: z.number(),
		max: z.number(),
		relacion: z.enum(['observado', 'estimado', 'derivado', 'calibrado', 'supuesto']),
		fuente: z.string().min(1).optional(),
	})
	.refine((p) => p.min <= p.central && p.central <= p.max, {
		message: 'el valor central queda fuera del rango',
	})
	.refine((p) => p.relacion === 'supuesto' || p.fuente, { message: 'una relación observada, estimada, derivada o calibrada necesita fuente' });

/** Lanza un error con el nombre del parámetro inválido: rompe el build antes de publicar. */
export function validarParametros(parametros: Record<string, Parametro> = PARAMETROS): void {
	for (const [nombre, p] of Object.entries(parametros)) {
		const r = esquema.safeParse(p);
		if (!r.success) throw new Error(`Parámetro ${nombre}: ${r.error.issues[0]?.message}`);
	}
}
