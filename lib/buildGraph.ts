import { PipelineGraph, PipelineModel } from "./types";

export function buildGraph(pipeline: PipelineModel | null): PipelineGraph {
  if (!pipeline) {
    return { nodes: [], edges: [] };
  }

  const { stages, jobs } = pipeline;

  const jobsByStage = new Map<string, string[]>();
  for (const job of jobs) {
    if (!jobsByStage.has(job.stage)) {
      jobsByStage.set(job.stage, []);
    }
    jobsByStage.get(job.stage)!.push(job.name);
  }

  const stageIndexByName = new Map<string, number>();
  for (const stage of stages) {
    stageIndexByName.set(stage.name, stage.index);
  }

  const horizontalGap = 260;
  const verticalGap = 120;

  const nodes = jobs.map((job) => {
    const stageIndex = stageIndexByName.get(job.stage) ?? 0;
    const jobsInStage = jobsByStage.get(job.stage) ?? [];
    const positionInStage = jobsInStage.indexOf(job.name);

    return {
      id: job.name,
      jobName: job.name,
      stage: job.stage,
      stageIndex,
      position: {
        x: stageIndex * horizontalGap,
        y: positionInStage * verticalGap
      }
    };
  });

  const edges: PipelineGraph["edges"] = [];

  for (const job of jobs) {
    for (const need of job.needs) {
      edges.push({
        id: `needs-${need}-${job.name}`,
        from: need,
        to: job.name,
        kind: "needs"
      });
    }

    for (const dependency of job.dependencies) {
      edges.push({
        id: `dep-${dependency}-${job.name}`,
        from: dependency,
        to: job.name,
        kind: "dependency"
      });
    }
  }

  return { nodes, edges };
}

