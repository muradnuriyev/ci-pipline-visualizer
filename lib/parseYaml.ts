import { parse } from "yaml";
import { PipelineIssue, PipelineJob, PipelineModel, PipelineStage, ParseResult } from "./types";

const RESERVED_TOP_LEVEL_KEYS = new Set([
  "stages",
  "default",
  "include",
  "variables",
  "workflow",
  "image",
  "services",
  "cache",
  "before_script",
  "after_script"
]);

function createIssue(params: Omit<PipelineIssue, "id">): PipelineIssue {
  return {
    id: `${params.severity}-${Math.random().toString(36).slice(2, 9)}`,
    ...params
  };
}

export function parseYamlConfig(source: string): ParseResult {
  const issues: PipelineIssue[] = [];

  if (!source.trim()) {
    issues.push(
      createIssue({
        severity: "warning",
        message: "Configuration is empty. Paste a .gitlab-ci.yml to start."
      })
    );
    return { pipeline: null, issues };
  }

  let raw: unknown;

  try {
    raw = parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown YAML parsing error.";
    issues.push(
      createIssue({
        severity: "error",
        message: `Invalid YAML: ${message}`
      })
    );
    return { pipeline: null, issues };
  }

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    issues.push(
      createIssue({
        severity: "error",
        message: "Top-level structure must be a mapping of jobs and options."
      })
    );
    return { pipeline: null, issues };
  }

  const root = raw as any;

  const stagesValue = root.stages;
  const explicitStages: string[] = Array.isArray(stagesValue)
    ? stagesValue
        .map((value) => (typeof value === "string" ? value : null))
        .filter((value): value is string => value !== null)
    : [];

  if (explicitStages.length === 0) {
    issues.push(
      createIssue({
        severity: "warning",
        message: "No explicit stages defined. GitLab will infer a default stage ordering."
      })
    );
  }

  const jobs: PipelineJob[] = [];

  for (const [key, value] of Object.entries(root)) {
    if (RESERVED_TOP_LEVEL_KEYS.has(key) || key.startsWith(".")) {
      continue;
    }

    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      issues.push(
        createIssue({
          severity: "warning",
          message: `Top-level key "${key}" does not look like a job definition.`
        })
      );
      continue;
    }

    const jobNode = value as any;

    let stage = typeof jobNode.stage === "string" ? jobNode.stage : "test";
    if (jobNode.stage === undefined) {
      issues.push(
        createIssue({
          severity: "warning",
          message: `Job "${key}" has no stage defined; assuming "test".`,
          jobName: key
        })
      );
    }

    const scriptValue = jobNode.script;
    const script: string[] = [];

    if (typeof scriptValue === "string") {
      script.push(scriptValue);
    } else if (Array.isArray(scriptValue)) {
      for (const entry of scriptValue) {
        if (typeof entry === "string") {
          script.push(entry);
        }
      }
    }

    if (script.length === 0) {
      issues.push(
        createIssue({
          severity: "warning",
          message: `Job "${key}" does not define a script.`,
          jobName: key
        })
      );
    }

    const needsValue = jobNode.needs;
    const needs: string[] = [];
    if (Array.isArray(needsValue)) {
      for (const item of needsValue) {
        if (typeof item === "string") {
          needs.push(item);
        } else if (item && typeof item === "object" && "job" in item && typeof (item as any).job === "string") {
          needs.push((item as any).job);
        }
      }
    }

    const dependenciesValue = jobNode.dependencies;
    const dependencies: string[] = [];
    if (Array.isArray(dependenciesValue)) {
      for (const dep of dependenciesValue) {
        if (typeof dep === "string") {
          dependencies.push(dep);
        }
      }
    }

    const job: PipelineJob = {
      name: key,
      stage,
      script,
      needs,
      dependencies,
      image: typeof jobNode.image === "string" ? jobNode.image : undefined,
      only: jobNode.only,
      except: jobNode.except,
      rules: jobNode.rules,
      artifacts: jobNode.artifacts
    };

    jobs.push(job);
  }

  const stageNamesFromJobs = Array.from(new Set(jobs.map((job) => job.stage)));
  const allStageNames = explicitStages.length > 0 ? explicitStages.slice() : stageNamesFromJobs.slice();

  for (const stageName of stageNamesFromJobs) {
    if (!allStageNames.includes(stageName)) {
      allStageNames.push(stageName);
      issues.push(
        createIssue({
          severity: "warning",
          message: `Stage "${stageName}" is used by jobs but not listed in stages.`,
          stageName
        })
      );
    }
  }

  const stages: PipelineStage[] = allStageNames.map((name, index) => ({
    name,
    index
  }));

  if (jobs.length === 0) {
    issues.push(
      createIssue({
        severity: "warning",
        message: "No jobs detected in configuration."
      })
    );
  }

  const pipeline: PipelineModel = {
    stages,
    jobs
  };

  return { pipeline, issues };
}
