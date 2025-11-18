# CI Pipeline Visualizer

Visual tool for exploring and understanding GitLab CI pipelines. Paste a `.gitlab-ci.yml` or share a saved configuration and get an interactive graph of stages and jobs, with static analysis that points out potential problems.

The goal is to look and feel like a real developer tool you could use during day‑to‑day work on GitLab CI/CD pipelines, not just another demo CRUD app.

## Features

- Paste or tweak `.gitlab-ci.yml` on the home screen and jump to a dedicated visualization page.
- Parse GitLab CI YAML on the server using `yaml` and strongly‑typed helpers.
- Visualize pipeline structure with columns of stages and nodes for jobs.
- Show `needs`/`dependencies` as edges on an interactive graph (React Flow).
- Inspect job details (stage, image, script, needs, dependencies) in a side panel.
- Static analysis / lint‑style hints:
  - cyclic `needs` chains;
  - jobs that reference non‑existent dependencies;
  - stages that are declared but never used;
  - stages used by jobs but not listed in `stages`;
  - heuristics for "very long" pipelines by number of stages/jobs.
- Optional persistence layer via Prisma + SQLite for saving pipeline configurations and exposing public share links (`/p/<id>`).

## Tech Stack

- `Next.js` (App Router, server components, API routes)
- `TypeScript` with strict settings
- `Tailwind CSS` for styling
- `React Flow` for graph visualization
- `yaml` for parsing `.gitlab-ci.yml`
- `zod` for schema validation (ready to be used alongside the existing parse helpers)
- `Prisma` + `SQLite` for storing users and pipeline configurations
- `NextAuth` (planned) for GitHub OAuth and per‑user history

## Getting Started

```bash
git clone https://github.com/your-username/ci-pipeline-visualizer.git
cd ci-pipeline-visualizer
npm install
npm run dev
```

Then open `http://localhost:3000` and:

1. Paste a `.gitlab-ci.yml` into the textarea on the home page, or use the sample configuration.
2. Click **“Visualize pipeline”** – you will be redirected to `/visualize` with the config encoded in the URL.
3. Explore the graph: stages go left‑to‑right, jobs are grouped by stage, edges show `needs` / `dependencies`.
4. Click a job node to see job details and review warnings/errors in the analysis panel.

## Architecture

The project is split into three main layers:

- **Parsing** (`lib/parseYaml.ts`)
  - `parseYamlConfig(config: string)` → `{ pipeline, issues }`
  - Handles YAML parsing errors and applies GitLab‑like conventions (infers stages, extracts jobs, tracks `needs` / `dependencies`).

- **Graph building** (`lib/buildGraph.ts`)
  - `buildGraph(pipeline)` → `{ nodes, edges }`
  - Projects stages/jobs into coordinates suitable for React Flow; creates edges for `needs` and `dependencies`.

- **Analysis** (`lib/analyzeConfig.ts`)
  - `analyzePipeline(pipeline)` → `{ issues, summary }`
  - Runs lightweight static analysis: unused stages, missing jobs in `needs`, cyclic dependencies, long pipelines, cross‑stage ordering issues.

These helpers are used both in:

- `app/visualize/page.tsx` via the `VisualizeFromQuery` component for server‑side parsing and analysis; and
- `app/api/parse/route.ts` as a REST endpoint if you prefer driving the UI with client‑side fetches.

UI components live under `components/`:

- `PipelineForm` – textarea + button on the home page.
- `PipelineGraph` – React Flow graph for stages/jobs and edges.
- `JobDetailsPanel` – side panel with job details.
- `AnalysisSummary` – counters and list of warnings/errors.
- `PipelineGraphWithDetails` – client container that wires graph, analysis, and job details together.

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

This kind of project showcases real‑world skills around CI/CD, GitLab, and modern React/Next.js tooling, and doubles as a genuinely useful helper when reasoning about complex pipelines.

