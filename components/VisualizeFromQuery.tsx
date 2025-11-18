import { analyzePipeline } from "@/lib/analyzeConfig";
import { buildGraph } from "@/lib/buildGraph";
import { parseYamlConfig } from "@/lib/parseYaml";
import { PipelineGraphWithDetails } from "./PipelineGraphWithDetails";

interface VisualizeFromQueryProps {
  encodedConfig?: string;
}

export function VisualizeFromQuery(props: VisualizeFromQueryProps) {
  const { encodedConfig } = props;

  const decodedConfig = encodedConfig ? decodeURIComponent(encodedConfig) : "";

  const parseResult = parseYamlConfig(decodedConfig);
  const analysis = analyzePipeline(parseResult.pipeline);
  const graph = buildGraph(parseResult.pipeline);

  return (
    <section className="flex flex-col gap-4">
      <PipelineGraphWithDetails
        pipeline={parseResult.pipeline}
        graph={graph}
        issues={[...parseResult.issues, ...analysis.issues]}
        summary={analysis.summary}
      />
    </section>
  );
}
