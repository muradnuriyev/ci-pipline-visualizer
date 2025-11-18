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
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pipeline visualization
        </h1>
        <p className="max-w-2xl text-sm text-gray-300">
          Interactive view of stages, jobs and dependencies based on the current configuration.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-gray-300">Loading visualization...</p>}>
        <VisualizeFromQuery encodedConfig={searchParams.config} />
      </Suspense>
    </main>
  );
}

