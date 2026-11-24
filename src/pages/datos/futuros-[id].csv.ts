// /datos/futuros-<cuadrante>.csv: se genera al compilar, igual para ES y EN.
import type { APIRoute, GetStaticPaths } from 'astro';
import { aCsv } from '../../lib/futuros/csv';
import { proyectarGuardado } from '../../lib/futuros/montecarlo';
import { CUADRANTE_IDS, presetDe, type CuadranteId } from '../../lib/futuros/posicion';

export const getStaticPaths = (() => CUADRANTE_IDS.map((id) => ({ params: { id } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
	new Response(aCsv(proyectarGuardado(presetDe(params.id as CuadranteId))), {
		headers: { 'Content-Type': 'text/csv; charset=utf-8' },
	});
