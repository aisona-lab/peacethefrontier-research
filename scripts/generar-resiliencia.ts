import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
	DATASET_VERSION, POLICIES, simulateContinuity, summarizePolicies,
	type ContinuityRow, type PolicyMetrics,
} from '../src/lib/studio/resilience';

const ROOT = 'public/datos/studio';
const MANIFEST_PATH = `${ROOT}/manifest.json`;
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const HOURS = 48;
const LICENSE_ID = 'CC-BY-4.0';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';
// Full, byte-preserved copy of /usr/share/common-licenses/Apache-2.0 at artifact creation.
// Embedded so reproduction does not depend on the operating system's licence files.
const APACHE_LICENSE = `
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
`;
const ATTRIBUTION = `Peace The Frontier Research Studio (2026), Synthetic service continuity, v${DATASET_VERSION}`;

type Bilingual = { es: string; en: string };
export interface ArtifactFile {
	role: 'dataset' | 'schema' | 'dataset-card' | 'source-code' | 'license';
	path: string;
	repository_path: string;
	sha256: string;
	bytes: number;
	media_type: string;
	license: string;
	language?: 'es' | 'en';
}

export interface ContinuityManifest {
	manifest_version: 1;
	id: string;
	version: string;
	release_date: string;
	title: Bilingual;
	description: Bilingual;
	synthetic: true;
	status: 'synthetic-toy-experiment';
	license: { id: string; url: string; scope: string; attribution: string };
	code_license: { id: string; url: string; path: string; scope: string };
	seeds: number[];
	experiment: {
		row_count: number; hours_per_seed: number; policy_count: number; rows_per_policy: number;
		step_hours: number; initial_unavailable_slots: number; service_units_per_slot_hour: number;
		prng: { algorithm: string; multiplier: number; increment: number; modulus: number; draws_per_hour: number };
		input_schedule: string; timing: string[]; unmet_demand: string;
	};
	policies: { id: string; label: Bilingual; capacity_slots: number; recovery_slots_per_hour: number; metrics: PolicyMetrics }[];
	files: ArtifactFile[];
	metric_definitions: Record<keyof PolicyMetrics, { unit: string; description: string }>;
	reproduction: { command: string; check_command: string; source_files: string[]; manifest_checksum: string };
	limitations: Bilingual;
}

interface FieldDefinition {
	type: 'boolean' | 'string' | 'integer' | 'number';
	unit: string;
	description: string;
	description_es: string;
	minimum?: number;
	maximum?: number;
	const?: string | boolean | number;
	enum?: string[];
}

const count = (unit: string, en: string, es: string): FieldDefinition => ({ type: 'integer', minimum: 0, unit, description: en, description_es: es });
const fraction = (en: string, es: string): FieldDefinition => ({ type: 'number', minimum: 0, maximum: 1, unit: 'fraction', description: en, description_es: es });

// Insertion order is the CSV header and schema property order.
const FIELDS: Record<keyof ContinuityRow, FieldDefinition> = {
	synthetic: { type: 'boolean', const: true, unit: 'dimensionless', description: 'Every row is synthetic, not an observation.', description_es: 'Toda fila es sintética, no una observación.' },
	dataset_version: { type: 'string', const: DATASET_VERSION, unit: 'identifier', description: 'Synthetic artifact version.', description_es: 'Versión del artefacto sintético.' },
	seed: { ...count('identifier', 'Unsigned 32-bit scenario seed; shared across policies.', 'Semilla de escenario de 32 bits sin signo; común a las políticas.'), minimum: 1, maximum: 20 },
	policy: { type: 'string', enum: POLICIES.map(p => p.id), unit: 'identifier', description: 'Capacity and recovery policy.', description_es: 'Política de capacidad y recuperación.' },
	hour: { ...count('hour', 'Relative interval start, not a calendar timestamp.', 'Inicio relativo del intervalo, no una fecha de calendario.'), maximum: HOURS - 1 },
	step_hours: { ...count('hour', 'Interval duration.', 'Duración del intervalo.'), const: 1 },
	capacity_slots: { ...count('slot', 'Installed slots, each delivering one service unit per hour.', 'Plazas instaladas; cada una entrega una unidad de servicio por hora.'), minimum: 1 },
	recovery_budget_slots_per_hour: count('slot/hour', 'Maximum slots repairable per hour, separate from service throughput.', 'Máximo de plazas reparables por hora, separado del servicio.'),
	demand_service_units: count('service_unit', 'Demand arriving within this one-hour interval.', 'Demanda que llega en este intervalo de una hora.'),
	requested_unavailable_slots: count('slot', 'Exogenous requested loss; identical input across policies for a seed.', 'Pérdida exógena solicitada; entrada idéntica entre políticas para una semilla.'),
	newly_unavailable_slots: count('slot', 'Realized loss, capped at slots still available at interval start.', 'Pérdida efectiva, limitada a plazas disponibles al inicio.'),
	unavailable_start_slots: count('slot', 'Unavailable slots inherited from previous end of hour; initially zero.', 'Plazas no disponibles heredadas del final anterior; inicialmente cero.'),
	unavailable_during_slots: count('slot', 'Unavailable during service, after interruption and before repair.', 'Plazas no disponibles durante el servicio, tras la interrupción y antes de reparar.'),
	available_during_slots: count('slot', 'Slots able to serve demand in this interval.', 'Plazas capaces de atender demanda en este intervalo.'),
	served_service_units: count('service_unit', 'Work served, bounded by demand and available slots times one hour.', 'Servicio entregado, limitado por demanda y plazas disponibles por una hora.'),
	unmet_service_units: count('service_unit', 'Unserved work discarded at interval end; no backlog.', 'Servicio no atendido descartado al terminar el intervalo; sin cola.'),
	recovered_slots: count('slot', 'End-of-hour repairs; cannot serve work until the next interval.', 'Reparaciones al final de la hora; no sirven demanda hasta el intervalo siguiente.'),
	unavailable_end_slots: count('slot', 'Unavailable slots carried to next interval, after repair.', 'Plazas no disponibles trasladadas al intervalo siguiente, después de reparar.'),
	service_ratio: fraction('Served/demand; defined as one when demand is zero.', 'Servicio/demanda; se define como uno si la demanda es cero.'),
	capacity_availability_ratio: fraction('Available/installed capacity during service; not service fulfilment.', 'Capacidad disponible/instalada durante el servicio; no es demanda satisfecha.'),
	recovered_to_full: { type: 'boolean', unit: 'dimensionless', description: 'True only when positive unavailable capacity reaches zero at this interval end.', description_es: 'Verdadero solo cuando una pérdida positiva de capacidad llega a cero al final del intervalo.' },
};

const METRIC_DEFINITIONS: ContinuityManifest['metric_definitions'] = {
	policy: { unit: 'identifier', description: 'Policy id.' },
	rows: { unit: 'row', description: 'Number of one-hour rows.' },
	scenarios: { unit: 'scenario', description: 'Number of distinct seeds.' },
	total_demand_service_units: { unit: 'service_unit', description: 'Sum of demand across all seeds and hours.' },
	total_served_service_units: { unit: 'service_unit', description: 'Sum of served work across all seeds and hours.' },
	total_unmet_service_units: { unit: 'service_unit', description: 'Sum of discarded unmet work.' },
	service_ratio: { unit: 'fraction', description: 'Total served / total demand, or 1 for zero demand; demand weighted.' },
	capacity_availability_ratio: { unit: 'fraction', description: '1 - unavailable slot-hours / installed slot-hours.' },
	shortage_hours: { unit: 'hour', description: 'Total intervals with positive unmet work across all seeds.' },
	recovered_slots: { unit: 'slot', description: 'Sum of repairs, including repeated repairs after separate losses.' },
	fully_recovered_events: { unit: 'event', description: 'Intervals ending with zero unavailable slots after a positive loss; not independent failures or MTTR.' },
	installed_capacity_slot_hours: { unit: 'slot*hour', description: 'Sum of installed slots times interval hours; not a financial cost.' },
	unavailable_slot_hours: { unit: 'slot*hour', description: 'Sum of unavailable slots during service times interval hours.' },
	mean_final_unavailable_slots: { unit: 'slot', description: 'Mean end-of-horizon unavailable slots across all seeds, including unfinished recoveries.' },
};

const LABELS: Record<string, Bilingual> = {
	steady: { es: 'Recuperación gradual', en: 'Steady recovery' },
	'rapid-recovery': { es: 'Recuperación rápida', en: 'Rapid recovery' },
	'extra-capacity': { es: 'Capacidad adicional', en: 'Extra capacity' },
};

const LIMITATIONS: Bilingual = {
	es: 'Experimento de juguete totalmente sintético, sin calibración empírica ni validación externa. No son datos reales de ciberseguridad, tráfico de red ni incidentes. No representa atacantes ni procedimientos ofensivos. No es un modelo entrenado, un entorno de entrenamiento validado ni evidencia de eficacia en producción. Las políticas usan recursos distintos y no comparan costes equivalentes.',
	en: 'Entirely synthetic toy experiment without empirical calibration or external validation. These are not real cybersecurity, network traffic or incident data. No adversaries or offensive procedures are represented. This is not a trained model, a validated training environment or evidence of production effectiveness. Policies use different resources and are not a cost-equivalent comparison.',
};

const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';

function datasetCard(language: 'es' | 'en', policies: ContinuityManifest['policies']): string {
	const table = policies.map(p => `| ${p.id} | ${p.capacity_slots} | ${p.recovery_slots_per_hour} | ${p.metrics.total_served_service_units} | ${p.metrics.total_unmet_service_units} | ${(100 * p.metrics.service_ratio).toFixed(2)}% | ${p.metrics.shortage_hours} |`).join('\n');
	if (language === 'es') return `# Ficha del conjunto: continuidad de servicio sintética

Versión ${DATASET_VERSION} · 2026-11-14 · **100% sintético** · Peace The Frontier Research Studio.

## Pregunta y procedencia

¿Cómo cambian el servicio no atendido y la recuperación al variar plazas instaladas o velocidad de reparación? Este artefacto original se genera con código determinista; no incorpora datos de personas, organizaciones, sistemas reales ni fuentes de terceros. Elaborado con asistencia de IA; no se declara aprobación editorial humana ni revisión científica independiente.

## Composición y unidades

2.880 filas = 20 semillas (1–20) × 48 intervalos de una hora × 3 políticas. Una fila es una hora de una política y semilla; la clave es (policy, seed, hour). hour=0…47 es tiempo relativo. synthetic=true aparece en todas las filas. CSV UTF-8, coma, punto decimal, booleanos true/false, salto LF, sin valores ausentes. schema.json describe cada columna, tipo y unidad.

Una plaza entrega una unidad abstracta de servicio por hora. La demanda y el servicio son cantidades durante el intervalo; las plazas son capacidad, no personas, máquinas, bytes ni peticiones reales. Cada escenario empieza con todas las plazas disponibles. La pérdida exógena se limita a las plazas aún disponibles; el servicio usa la capacidad restante; la reparación ocurre al final y beneficia la hora siguiente. La demanda no atendida se descarta, sin cola. No hay topología ni competencia entre reparación y servicio.

## Generación y supuestos

PRNG LCG32: s=(1664525×s+1013904223) mod 2^32; u=s/2^32, con multiplicación entera de 32 bits. Tres extracciones por hora: variación de demanda entera uniforme entre −8 y +8, probabilidad de interrupción y magnitud entera entre 20 y 45 plazas. La demanda usa una tabla diaria de 24 horas definida en resilience.ts. Hay interrupciones obligatorias en las horas 8, 24 y 36, y probabilidad 0,08 en las otras horas desde la 4. La magnitud se extrae incluso sin interrupción, para conservar el orden aleatorio. Cada semilla comparte demanda e interrupciones solicitadas entre políticas; las pérdidas efectivas pueden diferir por saturación. Las tres políticas se ejecutan por separado.

## Resultados efectivamente generados

| Política | Plazas | Reparación (plazas/h) | Servicio (unidades) | No atendido (unidades) | Servicio/demanda | Horas con déficit |
|---|---:|---:|---:|---:|---:|---:|
${table}

Cada política tiene 960 filas. La fracción de servicio es servicio total/demanda total; no el promedio de fracciones horarias. Demanda cero da fracción 1. Disponibilidad de capacidad y cumplimiento de demanda son métricas distintas. manifest.json incluye todos los resultados exactos y sus unidades. Las recuperaciones inconclusas al terminar 48 horas permanecen en mean_final_unavailable_slots; no se inventa tiempo de recuperación posterior.

## Uso previsto y límites

Enseñanza, comprobaciones de conservación y prototipos exploratorios de continuidad, detección abstracta y recuperación. No se entrena ni evalúa un detector aquí. ${LIMITATIONS.es}

No usar para decisiones operativas, dimensionamiento real, clasificar ataques, validar seguridad ni estimar frecuencias de incidentes. Las semillas son escenarios de una única distribución elegida, no observaciones independientes del mundo; no hay intervalos de confianza ni ranking universal. Recuperación rápida triplica el presupuesto de reparación; capacidad adicional instala 25% más plazas. No se estiman costes, personal ni energía. Si se explora aprendizaje, separar por semilla manteniendo juntas todas sus políticas; dividir filas al azar filtra escenarios compartidos. No existe partición de entrenamiento validada.

## Reproducir e integridad

Desde la raíz: node scripts/generar-resiliencia.mjs. Verificar sin reescribir: node scripts/generar-resiliencia.mjs --check. Se requiere la versión de Node y dependencias del repositorio. El wrapper esbuild local no modifica scripts globales. manifest.json mantiene una versión de formato y de artefacto; contiene rutas públicas/locales, tamaño en bytes y SHA-256 de CSV, esquema, ambas fichas, código descargable y ambas licencias. [simulator.ts](simulator.ts) es una copia exacta del nuevo módulo autónomo resilience.ts, sin dependencias de Astro, navegador ni otros módulos del proyecto. El manifiesto no incluye su propio hash para evitar autorreferencia; no usa reloj ni entradas de red. Los tests documentados en docs/research-studio/simulation.md comprueban determinismo, conservación y casos de recuperación calculados a mano. Son comprobaciones del software, no validación empírica.

## Licencia y cita

Solo los nuevos datos sintéticos y su documentación (CSV, esquema, manifiesto, fichas y aviso CC BY) se ofrecen bajo [CC BY 4.0](${LICENSE_URL}). Ver [aviso de datos](LICENSE-CC-BY-4.0.txt) y los términos legales enlazados. Cita: ${ATTRIBUTION}. Al redistribuir los datos, conservar atribución y enlace a la licencia, indicar cambios y no sugerir respaldo.

El nuevo código del simulador se ofrece separadamente bajo **Apache-2.0**: solo src/lib/studio/resilience.ts y su copia descargable [simulator.ts](simulator.ts), con identificador SPDX y [licencia completa](LICENSE-Apache-2.0.txt). Esa licencia no se aplica a los datos sintéticos. Ninguna de estas licencias cambia los términos de otro código, del repositorio, de artículos, de modelos previos ni de fuentes externas.
`;
	return `# Dataset card: synthetic service continuity

Version ${DATASET_VERSION} · 2026-11-14 · **100% synthetic** · Peace The Frontier Research Studio.

## Question and provenance

How do unmet service and recovery change with installed capacity or repair speed? This original artifact is generated by deterministic code; it contains no observations of people, organizations, real systems or third-party datasets. Prepared with AI assistance; no human editorial approval or independent scientific review is claimed.

## Composition and units

2,880 rows = 20 seeds (1–20) × 48 one-hour intervals × 3 policies. A row is one hour of one policy and seed; the key is (policy, seed, hour). hour=0…47 is relative time. Every row has synthetic=true. CSV uses UTF-8, comma delimiters, decimal points, true/false booleans and LF endings, with no missing values. schema.json describes each column, type and unit.

One slot delivers one abstract service unit per hour. Demand and service are quantities over the interval; slots represent capacity, not people, machines, bytes or real requests. Every scenario starts fully available. Exogenous loss is capped at surviving slots; service uses remaining capacity; repair occurs at interval end and benefits the next hour. Unmet demand is discarded without a backlog. There is no topology or contention between repair and service.

## Generation and assumptions

LCG32 PRNG: s=(1664525×s+1013904223) mod 2^32; u=s/2^32, using 32-bit integer multiplication. Three draws per hour: integer demand jitter uniform from −8 to +8, interruption probability and integer magnitude from 20 to 45 slots. Demand follows a 24-hour baseline table in resilience.ts. Interruptions are forced at hours 8, 24 and 36, with probability 0.08 at other hours from hour 4 onward. Magnitude is drawn even without an interruption, preserving random draw order. A seed shares demand and requested interruptions across policies; realized losses can differ because of saturation. Policies run separately.

## Actually generated results

| Policy | Slots | Repair (slots/h) | Served (units) | Unmet (units) | Served/demand | Shortage hours |
|---|---:|---:|---:|---:|---:|---:|
${table}

Each policy contains 960 rows. Service ratio is total served/total demand, not the mean of hourly ratios. Zero demand yields ratio 1. Capacity availability and demand fulfilment are distinct metrics. manifest.json includes exact metrics and their units. Recoveries unfinished after 48 hours remain in mean_final_unavailable_slots; no later recovery time is invented.

## Intended use and limitations

Teaching, conservation checks and exploratory prototypes for continuity, abstract detection and recovery. No detector is trained or evaluated here. ${LIMITATIONS.en}

Do not use for operational decisions, real capacity sizing, attack classification, security validation or incident-frequency estimates. Seeds sample a single chosen distribution, not independent world observations; there are no confidence intervals or universal policy rankings. Rapid recovery triples repair budget; extra capacity installs 25% more slots. Costs, staff and energy are not estimated. For exploratory learning, split by seed and keep all its policies together; random row splits leak shared scenarios. No validated training split is supplied.

## Reproduction and integrity

From the repository root: node scripts/generar-resiliencia.mjs. Verify without rewriting: node scripts/generar-resiliencia.mjs --check. Use the repository's Node version and dependencies. The local esbuild wrapper does not change global scripts. manifest.json versions the format and artifact; it records public/local paths, byte counts and SHA-256 for the CSV, schema, both cards, downloadable code and both licences. [simulator.ts](simulator.ts) is an exact copy of the new standalone resilience.ts module, without Astro, browser or other project-module dependencies. The manifest excludes its own hash to avoid self-reference and uses no wall clock or network inputs. Tests documented in docs/research-studio/simulation.md check determinism, conservation and hand-calculated recovery cases. These are software checks, not empirical validation.

## Licence and citation

Only the new synthetic data and its documentation (CSV, schema, manifest, cards and CC BY notice) are offered under [CC BY 4.0](${LICENSE_URL}). See the [data licence notice](LICENSE-CC-BY-4.0.txt) and its linked legal terms. Cite: ${ATTRIBUTION}. Data redistribution must retain attribution and the licence link, indicate changes and avoid implying endorsement.

New simulator code is separately offered under **Apache-2.0**: only src/lib/studio/resilience.ts and its downloadable copy [simulator.ts](simulator.ts), with SPDX identifier and [full licence](LICENSE-Apache-2.0.txt). That licence does not apply to the synthetic data. Neither licence changes terms for other code, the repository, papers, previous models or external sources.
`;
}

export function buildArtifactBundle(): { manifest: ContinuityManifest; files: Record<string, string> } {
	const rows = POLICIES.flatMap(policy => SEEDS.flatMap(seed => simulateContinuity({ seed, policy })));
	const metrics = summarizePolicies(rows);
	const policies = POLICIES.map((p, i) => ({
		id: p.id, label: LABELS[p.id]!, capacity_slots: p.capacitySlots,
		recovery_slots_per_hour: p.recoverySlotsPerHour, metrics: metrics[i]!,
	}));
	const columns = Object.keys(FIELDS) as (keyof ContinuityRow)[];
	const csv = [columns.join(','), ...rows.map(row => columns.map(key => String(row[key])).join(','))].join('\n') + '\n';
	const schema = {
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Synthetic service-continuity CSV row v' + DATASET_VERSION,
		description: 'Schema applies to typed CSV values: booleans true/false, decimal numbers; every record is synthetic. Units and Spanish descriptions are annotations. See dataset cards for conservation equations and limits.',
		type: 'object', additionalProperties: false, required: columns, properties: FIELDS,
	};
	const files: Record<string, string> = {};
	const entries: ArtifactFile[] = [];
	const add = (name: string, role: ArtifactFile['role'], media_type: string, content: string, language?: 'es' | 'en', license = LICENSE_ID) => {
		const repository_path = `${ROOT}/${name}`;
		files[repository_path] = content;
		entries.push({
			role, path: `/datos/studio/${name}`, repository_path,
			sha256: createHash('sha256').update(content).digest('hex'), bytes: Buffer.byteLength(content),
			media_type, license, ...(language ? { language } : {}),
		});
	};
	add('continuidad-servicio-v1.csv', 'dataset', 'text/csv', csv);
	add('schema.json', 'schema', 'application/schema+json', json(schema));
	add('dataset-card.es.md', 'dataset-card', 'text/markdown', datasetCard('es', policies), 'es');
	add('dataset-card.en.md', 'dataset-card', 'text/markdown', datasetCard('en', policies), 'en');
	add('LICENSE-CC-BY-4.0.txt', 'license', 'text/plain', `Synthetic service continuity / Continuidad de servicio sintética — v${DATASET_VERSION}
Copyright 2026 Peace The Frontier Research Studio

This new synthetic artifact is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
Este nuevo artefacto sintético se ofrece bajo Creative Commons Atribución 4.0 Internacional (CC BY 4.0).

Scope / Alcance: continuidad-servicio-v1.csv, schema.json, manifest.json, dataset-card.es.md, dataset-card.en.md and this notice in public/datos/studio/ only.
simulator.ts is separately licensed under Apache-2.0; see LICENSE-Apache-2.0.txt. It is not covered by this data licence.
simulator.ts se ofrece por separado bajo Apache-2.0; ver LICENSE-Apache-2.0.txt. No está cubierto por esta licencia de datos.
No other repository content, code, existing model or third-party source is relicensed.
No cambia la licencia de ningún otro contenido, código, modelo previo ni fuente de terceros.

Attribution / Atribución: ${ATTRIBUTION}.
Keep attribution, link to the licence, indicate changes and do not imply endorsement.
Conservar atribución y enlace a la licencia, indicar cambios y no sugerir respaldo.

Licence summary / Resumen: ${LICENSE_URL}
Binding legal terms / Términos legales: https://creativecommons.org/licenses/by/4.0/legalcode.en
The linked legal terms govern. This notice is not a substitute for them. The artifact is supplied without warranties.
Rigen los términos legales enlazados; este aviso no los sustituye. El artefacto se ofrece sin garantías.
`);
	add('simulator.ts', 'source-code', 'text/plain', readFileSync('src/lib/studio/resilience.ts', 'utf8'), undefined, 'Apache-2.0');
	add('LICENSE-Apache-2.0.txt', 'license', 'text/plain', APACHE_LICENSE, undefined, 'Apache-2.0');
	const manifest: ContinuityManifest = {
		manifest_version: 1, id: 'ptf-synthetic-service-continuity', version: DATASET_VERSION, release_date: '2026-11-14',
		title: { es: 'Continuidad de servicio sintética', en: 'Synthetic service continuity' },
		description: { es: 'Tres políticas de capacidad y recuperación sobre interrupciones abstractas exógenas.', en: 'Three capacity and recovery policies under abstract exogenous interruptions.' },
		synthetic: true, status: 'synthetic-toy-experiment',
		license: { id: LICENSE_ID, url: LICENSE_URL, scope: 'Only this newly generated synthetic dataset, schema, manifest, dataset cards and licence notice; excludes code, existing content and third-party sources.', attribution: ATTRIBUTION },
		code_license: { id: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0', path: '/datos/studio/LICENSE-Apache-2.0.txt', scope: 'Only new src/lib/studio/resilience.ts and its identical public/datos/studio/simulator.ts copy. No other repository code or data is relicensed.' },
		seeds: [...SEEDS],
		experiment: {
			row_count: rows.length, hours_per_seed: HOURS, policy_count: policies.length, rows_per_policy: SEEDS.length * HOURS,
			step_hours: 1, initial_unavailable_slots: 0, service_units_per_slot_hour: 1,
			prng: { algorithm: 'LCG32', multiplier: 1664525, increment: 1013904223, modulus: 4294967296, draws_per_hour: 3 },
			input_schedule: 'Daily baseline table in resilience.ts plus integer jitter [-8,8]; requested loss 20..45 slots at hours 8,24,36 and with probability 0.08 at other hours >=4; three draws every hour. All policies share inputs for a seed.',
			timing: ['inherit previous end-of-hour loss', 'apply bounded exogenous interruption', 'serve demand for one hour', 'repair within hourly budget at interval end'],
			unmet_demand: 'Discarded every hour; no backlog.',
		},
		policies, files: entries, metric_definitions: METRIC_DEFINITIONS,
		reproduction: {
			command: 'node scripts/generar-resiliencia.mjs', check_command: 'node scripts/generar-resiliencia.mjs --check',
			source_files: ['src/lib/studio/resilience.ts', 'scripts/generar-resiliencia.ts', 'scripts/generar-resiliencia.mjs'],
			manifest_checksum: 'Manifest is excluded from its own checksum list to avoid self-reference. Checksums describe UTF-8 bytes, not authenticity or empirical validity.',
		},
		limitations: LIMITATIONS,
	};
	files[MANIFEST_PATH] = json(manifest);
	return { manifest, files };
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/generar-resiliencia.mjs [--check]');
	const check = args.includes('--check');
	const { manifest, files } = buildArtifactBundle();
	for (const [path, content] of Object.entries(files)) {
		if (check) {
			if (await readFile(path, 'utf8') !== content) throw new Error(`Generated artifact differs: ${path}`);
		} else {
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, content, 'utf8');
		}
	}
	console.log(json({ mode: check ? 'verified' : 'generated', manifest: MANIFEST_PATH, version: manifest.version, rows: manifest.experiment.row_count, files: Object.keys(files).length, policies: manifest.policies.map(p => ({ id: p.id, ...p.metrics })) }));
}

// esbuild's CJS entry runs the CLI; test imports only build the in-memory bundle.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
	main().catch(error => { console.error(error); process.exitCode = 1; });
}
