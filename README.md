# CI Pipeline Visualizer

Visual tool for exploring and understanding GitLab CI pipelines. Paste a `.gitlab-ci.yml` (or load it from a file), and the app renders an interactive graph of stages and jobs with static analysis that highlights potential problems.

The goal is to look and feel like a real developer tool you could use in day‑to‑day work on GitLab CI/CD, not just another demo CRUD app.

---

## Highlights

- **Interactive graph** – stages laid out left‑to‑right, jobs grouped by stage, `needs` / `dependencies` drawn as edges.
- **Job inspection** – click any node to see stage, image, scripts, `needs`, `dependencies` and more in a details panel.
- **Static analysis** – built‑in “lint” that spots cyclic `needs`, missing jobs, unused stages, and very long pipelines.
- **Quick tooling** – YAML formatting, “Validate only”, load from `.gitlab-ci.yml` file, recent configs history.
- **API access** – `/api/parse` endpoint returns parsed pipeline, graph and analysis for external tools.
- **Realistic examples** – several complex test pipelines in `examples/` plus a working `.gitlab-ci.yml` for this repo.

---

## Tech Stack

- **Framework:** Next.js (App Router, API routes, server components)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Graphs:** React Flow
- **Parsing / validation:** `yaml`, `zod` (ready for richer schemas)
- **Persistence (optional):** Prisma + SQLite
- **Auth (planned):** NextAuth (GitHub OAuth, per‑user history)

---

## Getting Started

```bash
git clone https://github.com/your-username/ci-pipeline-visualizer.git
cd ci-pipeline-visualizer
npm install
npm run dev
```

Then open `http://localhost:3000` and:

1. Paste a `.gitlab-ci.yml` into the textarea on the home page, use one of the examples from `examples/*.gitlab-ci.yml`, or load a file via **“Load .gitlab-ci.yml file”**.
2. Optionally click **“Validate only”** to run parsing + static analysis without leaving the page.
3. Click **“Visualize pipeline”** – you will be redirected to `/visualize` with the config encoded in the URL.
4. Explore the graph: stages go left‑to‑right, jobs are grouped by stage, edges show `needs` / `dependencies`.
5. Click a job node to see job details and review warnings/errors in the analysis panel.
6. Use **“New pipeline”** on the visualization page to jump back and try another config.

---

## UI Overview

**Home (`/`)**

- YAML editor with:
  - sample pipeline loader;
  - “Load .gitlab-ci.yml file”;
  - “Format YAML”, “Validate only”, “Visualize pipeline”;
  - tiny “recent configs” history stored in `localStorage`.

**Visualization (`/visualize`)**

- **Pipeline stats strip** – cards with stages, jobs, error and warning counts.
- **Pipeline graph** – React Flow surface with:
  - stage headers above columns;
  - toggles for `needs` and `dependencies` edges;
  - “Fit view” control;
  - legend describing colours for edges.
- **Job details panel** – right‑hand side, with a “Reset” button to clear selection.
- **Analysis panel**:
  - switch between `All / Errors / Warnings`;
  - “Copy report” to clipboard;
  - “Download JSON” for machine‑readable reports.

---

## Architecture

The project is split into three main layers:

- **Parsing** – `lib/parseYaml.ts`  
  `parseYamlConfig(config: string)` → `{ pipeline, issues }`  
  Handles YAML parsing errors and applies GitLab‑like conventions (infers stages, extracts jobs, tracks `needs` / `dependencies`).

- **Graph building** – `lib/buildGraph.ts`  
  `buildGraph(pipeline)` → `{ nodes, edges }`  
  Maps stages/jobs into coordinates for React Flow and creates edges for `needs` and `dependencies`.

- **Analysis** – `lib/analyzeConfig.ts`  
  `analyzePipeline(pipeline)` → `{ issues, summary }`  
  Runs lightweight static analysis: unused stages, missing jobs in `needs`, cyclic dependencies, long pipelines, and cross‑stage ordering issues.

These helpers are used both in:

- `app/visualize/page.tsx` via the `VisualizeFromQuery` component for server‑side parsing and analysis; and
- `app/api/parse/route.ts` as a REST endpoint if you prefer driving the UI with client‑side fetches.

UI components live under `components/`:

- `PipelineForm` – YAML editor + actions on the home page.
- `PipelineGraph` – React Flow graph for stages, jobs and edges.
- `JobDetailsPanel` – side panel with job details.
- `AnalysisSummary` – filters, counters and list of warnings/errors.
- `PipelineStatsStrip` – high‑level metrics above the graph.
- `PipelineGraphWithDetails` – client container wiring graph, analysis and job details together.

---

## Example Pipelines

You can use the repository itself as a source of realistic `.gitlab-ci.yml` files for testing:

- Root CI for this project: `.gitlab-ci.yml`
- Monorepo example: `examples/monorepo.gitlab-ci.yml`
- Microservices example: `examples/microservices.gitlab-ci.yml`
- Intentionally problematic example: `examples/problematic.gitlab-ci.yml`

Copy any of these directly into the editor or load them via the file picker to see how the graph and analysis behave on non‑trivial configurations.

---

## Development

Useful scripts:

- `npm run dev` – run the Next.js dev server.
- `npm run lint` – run ESLint.
- `npm run build` – create a production build.
- `npm run start` – start the production server.
- `npm run prisma:generate` – generate Prisma client.
- `npm run prisma:migrate` – run Prisma migrations in dev.

---

## Roadmap

- **GitLab API integration** – load `.gitlab-ci.yml` directly from GitLab projects by URL or project ID.
- **GitHub Actions support** – alternative parser/visualizer for `workflow.yml`.
- **Auth + history** – NextAuth + Prisma:
  - GitHub OAuth login;
  - per‑user list of saved pipeline configs;
  - public/private flags with shareable URLs.
- **Dark/light themes** – refine design tokens and add a theme toggle.
- **Deeper static analysis** – more GitLab‑specific rules: `rules:exists`, `only/except`, artifact usage, caching hints.
- **i18n** – switchable UI languages (e.g. EN / RU).

This project is designed as a practical developer tool: it demonstrates CI/CD, GitLab and modern React/Next.js skills while remaining genuinely useful when reasoning about complex pipelines.

