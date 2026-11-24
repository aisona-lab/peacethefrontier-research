# Peace The Frontier

Sitio de investigación sobre IA y el futuro de la humanidad. Astro 7 estático, contenido en
`src/content/`, sin backend.

- Spec: `specs/peacethefrontier/` (`requirements.md` → `design.md` → `tasks.md`). Leer antes de
  cambiar algo de alcance o arquitectura.
- En la interfaz y las URLs los pilares se llaman **temas** (`/temas/<id>/`).
- Estilos: tokens en `src/styles/tokens.css` (`light-dark()`); no usar colores sueltos.
- CSP: Astro genera el `<meta>` con hashes. No añadir scripts inline sin pasar su hash con
  `Astro.csp.insertScriptHash` (ver `src/layouts/Base.astro`).
- Contenido sensible (biología, armas, vigilancia): ver R10 en el spec.

## Comandos

```
npm run dev          # desarrollo (astro dev --background para segundo plano)
npm run check        # tipos
npm test             # Vitest (src/**/*.test.ts)
npm run build        # build + validación de contenido
npm run test:e2e     # Playwright + axe sobre el build
npx lhci autorun     # Lighthouse con presupuestos (requiere build)
npx wrangler deploy  # publica dist/ en Cloudflare (beta.peacethefrontier.com; ver wrangler.jsonc)
```

Astro 7 bloquea un segundo `astro preview`; Playwright usa `--ignore-lock` para no depender de eso.
