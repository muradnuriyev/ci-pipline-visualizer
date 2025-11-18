import Link from "next/link";
import { Suspense } from "react";
import { VisualizeFromQuery } from "@/components/VisualizeFromQuery";

interface VisualizePageProps {
  searchParams: {
    config?: string;
  };
}

export default function VisualizePage(props: VisualizePageProps) {
  const { searchParams } = props;

  return (
    <main className="pipeline-main">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pipeline visualization
          </h1>
          <p className="max-w-2xl text-sm text-gray-300">
            Interactive view of stages, jobs and dependencies based on the current configuration.
          </p>
        </div>
        <div className="mt-2 flex gap-2 md:mt-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:border-sky-500"
          >
            New pipeline
          </Link>
        </div>
      </header>

      <Suspense fallback={<p className="text-sm text-gray-300">Loading visualization...</p>}>
        <VisualizeFromQuery encodedConfig={searchParams.config} />
      </Suspense>
    </main>
  );
}
