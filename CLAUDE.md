# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tenko ROI Calculator frontend (Vue 3 + Vuetify 3 + Vite), built on top of a purchased admin-template stack ("company Vue template"). The actual product lives in the ROI-specific files; most of the repo (`src/@core`, `src/@layouts`, `src/views/demos`, `src/pages/pages`, navigation menus, fake-api demo handlers) is template scaffolding that should generally not be modified.

## Commands

Package manager is **pnpm** (pnpm-lock.yaml is the maintained lockfile).

- `pnpm install` — postinstall runs `build:icons` (generates Iconify bundle) and `msw init public/`
- `pnpm dev` — Vite dev server
- `pnpm build` — production build (no type-check step)
- `pnpm preview` — serves build on port 5050
- `pnpm lint` — ESLint with `--fix` (@antfu config + airbnb-base; .eslintrc.cjs)

There are no tests. `build:tag` references `./scripts/build-with-tag.mjs`, which does not exist in the repo.

## ROI application code (the part that matters)

Entry route: `src/pages/index.vue` renders `src/views/roi/RoiCalculatorPage.vue` (blank layout, public). Print/preview routes: `src/pages/roi-report-print.vue` and `roi-report-preview.vue` → `src/views/roi/RoiPrintPage.vue`.

- `src/views/roi/` — page components (RoiCalculatorPage, RoiPrintPage, RoiNavbar, RoiScenarioBrowser, RoiPrintReport)
- `src/stores/roi.js` — Pinia store; single source of truth for calculator input, presets, and saved scenarios. Scenarios persist to localStorage (`tenko-roi-scenarios`) and sync to remote API when `VITE_API_BASE_URL` is set (`hasScenarioApiConfig()`); local and remote items merge by `remoteId`.
- `src/services/roi-scenarios.js` — ofetch client for `/api/roi/scenarios` CRUD against `VITE_API_BASE_URL`
- `src/services/roi-products.js` — product catalog served from the **local mock catalog** (`src/plugins/fake-api/roi/products.js`), not the network, by design (see commit 671940a)
- `src/utils/roi/` — pure calculation and content modules: `calculate-roi.js` (formulas, versioned via `FORMULA_VERSION` in `constants.js`), `presets.js` (default input + presets), `ui-copy.js` / `ui-help-copy.js` / `ui-scenario-copy.js` (bilingual UI text — the calculator carries its own en/th copy instead of using vue-i18n), `print-snapshot.js`
- `src/assets/styles/roi.scss` — ROI-specific styling

**Duplicate .js/.ts files:** `src/stores/roi.ts` and `src/services/roi-scenarios.ts` exist from the initial import but are dead — active imports explicitly use the `.js` paths. Edit the `.js` versions.

## Template stack conventions

- **Auto-imports everywhere** (unplugin-auto-import): Vue/Pinia/vue-router/VueUse APIs plus everything in `src/utils/`, `src/composables/`, `src/@core/utils`, `src/@core/composable` are available without import statements. Components under `src/components`, `src/@core/components`, `src/views/demos` auto-register (unplugin-vue-components).
- **File-based routing** (unplugin-vue-router): routes come from `src/pages/`; use `definePage({ meta: { ... } })` for layout/public flags. Route names are kebab-case. Layouts in `src/layouts/` via vite-plugin-vue-meta-layouts.
- **Path aliases:** `@` → src, `@core`, `@layouts`, `@styles`, `@images`, `@themeConfig`, `@db` → `src/plugins/fake-api/handlers/`, `@api-utils`, `@configured-variables` → `src/assets/styles/variables/_template.scss`.
- **Plugins** register from `src/plugins/` in filename order (`1.router`, `2.pinia.js`, …) via `registerPlugins`. Router guards are a no-op (`guards.js`) — all auth/ACL from the template is disabled.
- **MSW mocks** only activate when `VITE_ENABLE_MSW=true` (off in all committed .env files); ROI handlers live in `src/plugins/fake-api/handlers/roi/`.

## Environment

`.env.development` points `VITE_API_BASE_URL` at the deployed backend (`https://tenko-roi-calculator.vercel.app`); leave it empty to run purely on localStorage. Docker (`dev.Dockerfile`, `prod.Dockerfile`, docker-compose files, `nginx.conf`) and `vercel.json` exist for deployment.
