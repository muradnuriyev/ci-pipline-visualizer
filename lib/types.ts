export type IssueSeverity = "error" | "warning";

export interface PipelineIssue {
  id: string;
  severity: IssueSeverity;
  message: string;
  jobName?: string;
  stageName?: string;
}

export interface PipelineStage {
  name: string;
  index: number;
}

export interface PipelineJob {
  name: string;
  stage: string;
  script: string[];
  needs: string[];
  dependencies: string[];
  image?: string;
  only?: unknown;
  except?: unknown;
  rules?: unknown;
  artifacts?: unknown;
}

export interface PipelineModel {
  stages: PipelineStage[];
  jobs: PipelineJob[];
}

export interface ParseResult {
  pipeline: PipelineModel | null;
  issues: PipelineIssue[];
}

export interface GraphNode {
  id: string;
  jobName: string;
  stage: string;
  stageIndex: number;
  position: {
    x: number;
    y: number;
  };
}

export type EdgeKind = "needs" | "dependency";

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface PipelineGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AnalysisSummary {
  totalStages: number;
  totalJobs: number;
  errors: number;
  warnings: number;
}

