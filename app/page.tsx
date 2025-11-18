import Link from "next/link";
import { PipelineForm } from "@/components/PipelineForm";

export default function HomePage() {
  return (
    <main className="pipeline-main">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          CI Pipeline Visualizer
        </h1>
        <p className="max-w-2xl text-sm text-gray-300">
          Paste your <code>.gitlab-ci.yml</code>, visualize stages and jobs, and get
          quick feedback on potential issues in your pipeline.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <PipelineForm />

        <aside className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent configurations</h2>
          </div>
          <p className="text-sm text-gray-300">
            Persistence and sharing via Prisma and NextAuth can be wired here.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            For now this is just a static placeholder. In a real deployment this would show your latest configs and
            links like <code>/p/&lt;id&gt;</code> for sharing visualizations.
          </p>
          <div className="mt-4 text-xs text-gray-500">
            Jump directly to the visualization surface at{" "}
            <Link href="/visualize" className="underline underline-offset-4">
              /visualize
            </Link>
            .
          </div>
        </aside>
      </section>
    </main>
  );
}

