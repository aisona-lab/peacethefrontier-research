# Referentes: qué hacen bien los mejores sitios de research

> Investigación del 2026-10-02 (capturas a 1440 px + lectura de cada sitio). Adoptamos **patrones**, no
> diseños: copiar la identidad visual de otro sitio tiene problemas de derechos y borraría lo que nos hace
> distintos.

## Lo que hace cada uno mejor que nadie

| Sitio | Qué hace mejor | Qué adoptamos | Qué evitamos |
|---|---|---|---|
| **AI 2027** (ai-2027.com) | Escenario narrativo con **panel lateral fijo** que se actualiza al hacer scroll (fecha, capacidades, cifras). Dos finales (*race* / *slowdown*). Desplegables técnicos, notas al pie, PDF, audio y vídeo. Botones “¿Qué es esto? ¿Cómo lo escribimos? ¿Quiénes somos?”. Traducciones ES/FR/IT. Suplementos de investigación por pronóstico. | Panel de indicadores ligado al scroll en escenarios (R5.3). Desplegables. Enlaces de orientación bajo la portada. Suplemento de metodología por escenario. | El lector no decide nada: solo hay dos finales fijos. |
| **AI Futures Simulator** | Seis factores con deslizadores que cambian el desenlace. | La idea de factores explícitos. | Interfaz de dashboard SaaS oscuro; porcentajes sin fuente. |
| **Our World in Data** | “Cita este trabajo” (texto + BibTeX), licencia CC BY, gráficos embebibles y descargables, pestañas Introducción / Gráficos / Investigación, “Data insights” (un gráfico, un hallazgo), temas relacionados, donaciones visibles. | Citar y reutilizar en cada página. Formato “hallazgo” corto. Datos descargables. Relacionados. | Banner de cookies que tapa el contenido. |
| **Epoch AI** | Métricas de tendencia en la portada **con intervalo de confianza** (“3,4×/año, IC 90 %”). Tipos de pieza etiquetados (Informe / Hallazgo de datos). Bases de datos públicas. | Métricas con incertidumbre explícita cuando haya datos. Tipos de pieza. | Tarjetas uniformes; banner de cookies. |
| **The Pudding** | Cada historia es un ensayo visual. Filtros por formato (audio, vídeo, “tu respuesta”, “se actualiza”). | Filtro por formato. Piezas que se actualizan con fecha. | Tarjetas de colores sin significado. |
| **Bartosz Ciechanowski** | Explicaciones interactivas: palabras del texto con el mismo color que su elemento en el diagrama; todo se puede arrastrar. | Texto y gráfico enlazados por color. Interactivos manipulables (timeline, regla). | — |
| **Gwern.net** | Notas al margen, vista previa de enlaces, modo lectura, registro de cambios, **nivel de confianza por ensayo**. | Notas al margen en escritorio. Estado y fecha de revisión visibles. Registro de cambios. | Densidad que abruma al lector nuevo. |
| **Distill** | Ficha de publicación (autores, afiliación, fecha, DOI), diagrama como portada, sección de correcciones. | Ficha de publicación. Sección “Correcciones”. | — |
| **Works in Progress / Asterisk / Quanta** | Ediciones numeradas, ilustración de autor, audio. | Más adelante: ediciones temáticas y audio. | Ilustración genérica de banco de imágenes. |

## Cómo superarlos (lo que ninguno hace junto)

1. **Escala + tiempo + decisión.** Nadie conecta la neurona con el universo, la Antigüedad con 2100, y las
   decisiones éticas con sus consecuencias. Nosotros: regla de escala (hecho), línea de tiempo (fase 4),
   caminos (fase 5).
2. **El lector elige.** AI 2027 tiene dos finales fijos; el simulador tiene deslizadores sin fuentes. Aquí
   cada decisión tiene su fuente y el porqué de su etiqueta ética.
3. **Señales tempranas.** Cada escenario declara qué medir para saber si vamos hacia él, y un panel de
   señales lo sigue en el tiempo. Convierte la ficción en algo verificable.
4. **Evidencia y opinión separadas.** Nivel de evidencia por estilo de línea (hecho) y un bloque explícito
   “Punto de vista” para la opinión del autor. Tu punto de vista suma sin contaminar los datos.
5. **Bilingüe de origen**, con URLs propias en cada idioma (`/temas/ia/` ↔ `/en/topics/ai/`).
6. **Sin cookies ni rastreadores, sin banner.** Todos los referentes muestran un banner de consentimiento
   al entrar. Nosotros no lo necesitamos.

## Temas añadidos a partir de los referentes

- **Cómputo y chips** (P16, escala del transistor): el motor físico de la IA; lo que Epoch mide.
- **Sentido y propósito** (P17, escala de la persona): ningún referente lo trata y es la pregunta que queda
  cuando las máquinas pueden hacerlo casi todo.
- Plazos y despegue de la IA → dentro de *Inteligencia artificial*. Robo de pesos y ciberseguridad → dentro
  de *Poder* y *Gobernanza*. Estudios del progreso → dentro de *Los caminos de la humanidad*.

## Fuentes
- https://ai-2027.com/
- https://ai-futures.vercel.app/
- https://ourworldindata.org/artificial-intelligence
- https://epoch.ai/
- https://pudding.cool/
- https://ciechanow.ski/gps/
- https://gwern.net/
- https://distill.pub/2020/circuits/zoom-in/
- https://worksinprogress.co/ · https://asteriskmag.com/ · https://www.quantamagazine.org/
