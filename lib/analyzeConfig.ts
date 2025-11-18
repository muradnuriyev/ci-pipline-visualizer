import { AnalysisSummary, PipelineIssue, PipelineModel } from "./types";

function visitForCycles(name: string, graph: Map<string, string[]>, path: string[], seen: Set<string>): string[][] {
  if (path.includes(name)) {
    const cycleStart = path.indexOf(name);
    return [path.slice(cycleStart).concat(name)];
  }

  if (seen.has(name)) {
    return [];
  }

  seen.add(name);

  const neighbours = graph.get(name) ?? [];
  const cycles: string[][] = [];
  for (const neighbour of neighbours) {
    cycles.push(...visitForCycles(neighbour, graph, [...path, name], seen));
  }
  return cycles;
}

export function analyzePipeline(pipeline: PipelineModel | null): {
  issues: PipelineIssue[];
  summary: AnalysisSummary;
} {
  const issues: PipelineIssue[] = [];

  if (!pipeline) {
    return {
      issues,
      summary: {
        totalStages: 0,
        totalJobs: 0,
        errors: 0,
        warnings: issues.length
      }
    };
  }

  const { stages, jobs } = pipeline;

  const stageUsage = new Map<string, number>();
  for (const job of jobs) {
    stageUsage.set(job.stage, (stageUsage.get(job.stage) ?? 0) + 1);
  }

  for (const stage of stages) {
    if (!stageUsage.has(stage.name)) {
      issues.push({
        id: `warning-unused-stage-${stage.name}`,
        severity: "warning",
        message: `Stage "${stage.name}" is declared but not used by any job.`,
        stageName: stage.name
      });
    }
  }

  const stageIndexByName = new Map<string, number>();
  for (const stage of stages) {
    stageIndexByName.set(stage.name, stage.index);
  }

  const needsGraph = new Map<string, string[]>();
  for (const job of jobs) {
    needsGraph.set(job.name, job.needs.slice());
  }

  const cycles: string[][] = [];
  const globalSeen = new Set<string>();
  for (const job of jobs) {
    cycles.push(...visitForCycles(job.name, needsGraph, [], globalSeen));
  }

  for (const cycle of cycles) {
    if (cycle.length < 2) {
      continue;
    }

    const message = `Cyclic needs detected: ${cycle.join(" -> ")}`;
    issues.push({
      id: `error-cyclic-needs-${cycle.join("-")}`,
      severity: "error",
      message
    });
  }

  for (const job of jobs) {
    const stageIndex = stageIndexByName.get(job.stage);

    for (const need of job.needs) {
      const target = jobs.find((j) => j.name === need);
      if (!target) {
        issues.push({
          id: `error-missing-need-${job.name}-${need}`,
          severity: "error",
          message: `Job "${job.name}" declares a need on "${need}", which does not exist.`,
          jobName: job.name
        });
        continue;
      }

      const needStageIndex = stageIndexByName.get(target.stage);
      if (stageIndex !== undefined && needStageIndex !== undefined && needStageIndex > stageIndex) {
        issues.push({
          id: `warning-stage-order-${job.name}-${need}`,
          severity: "warning",
          message: `Job "${job.name}" needs "${need}", which is in a later stage ("${target.stage}"). This may create surprising execution order.`,
          jobName: job.name
        });
      }
    }
  }

  const totalStages = stages.length;
  const totalJobs = jobs.length;

  if (totalStages >= 10) {
    issues.push({
      id: "warning-many-stages",
      severity: "warning",
      message: `Pipeline has ${totalStages} stages. Consider whether all stages are necessary or can be merged.`
    });
  }

  if (totalJobs >= 30) {
    issues.push({
      id: "warning-many-jobs",
      severity: "warning",
      message: `Pipeline has ${totalJobs} jobs. You might be able to simplify or split the pipeline.`
    });
  }

  const summary: AnalysisSummary = {
    totalStages,
    totalJobs,
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length
  };

  return { issues, summary };
}

