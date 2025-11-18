"use client";

import { useState, useMemo } from "react";
import type {
  AnalysisSummary,
  PipelineGraph as Graph,
  PipelineIssue,
  PipelineJob,
  PipelineModel
} from "@/lib/types";
import { PipelineGraph } from "./PipelineGraph";
import { JobDetailsPanel } from "./JobDetailsPanel";
import { AnalysisSummary as AnalysisSummaryPanel } from "./AnalysisSummary";

interface PipelineGraphWithDetailsProps {
  pipeline: PipelineModel | null;
  graph: Graph;
  issues: PipelineIssue[];
  summary: AnalysisSummary;
}

export function PipelineGraphWithDetails(props: PipelineGraphWithDetailsProps) {
  const { pipeline, graph, issues, summary } = props;

  const jobsByName = useMemo(() => {
    const map = new Map<string, PipelineJob>();
    if (!pipeline) return map;
    for (const job of pipeline.jobs) {
      map.set(job.name, job);
    }
    return map;
  }, [pipeline]);

  const [selectedJobName, setSelectedJobName] = useState<string | null>(null);

  const selectedJob = selectedJobName ? jobsByName.get(selectedJobName) ?? null : null;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-4">
        <PipelineGraph graph={graph} selectedJobName={selectedJobName} onSelectJob={setSelectedJobName} />
        <AnalysisSummaryPanel summary={summary} issues={issues} />
      </div>

      <JobDetailsPanel job={selectedJob ?? null} onClearSelection={() => setSelectedJobName(null)} />
    </div>
  );
}
