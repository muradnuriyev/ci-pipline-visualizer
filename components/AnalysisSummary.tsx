"use client";

import { useMemo, useState } from "react";
import type { AnalysisSummary as Summary, PipelineIssue } from "@/lib/types";

interface AnalysisSummaryProps {
  summary: Summary;
  issues: PipelineIssue[];
}

type Filter = "all" | "error" | "warning";

export function AnalysisSummary(props: AnalysisSummaryProps) {
  const { summary, issues } = props;

  const [filter, setFilter] = useState<Filter>("all");
  const [copyLabel, setCopyLabel] = useState("Copy report");

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        if (filter === "all") return true;
        return issue.severity === filter;
      }),
    [issues, filter]
  );

  function handleCopy() {
    if (typeof navigator === "undefined" || !filteredIssues.length) return;
    const lines = filteredIssues.map((issue) => {
      const tag = issue.severity === "error" ? "ERROR" : "WARN";
      const scope = issue.jobName ?? issue.stageName ?? "";
      const suffix = scope ? ` [${scope}]` : "";
      return `${tag}${suffix}: ${issue.message}`;
    });
    const header = `CI pipeline analysis: ${filteredIssues.length} issues (${summary.errors} errors, ${summary.warnings} warnings)`;
    const text = [header, "", ...lines].join("\n");
    navigator.clipboard.writeText(text).catch(() => undefined);
    setCopyLabel("Copied!");
    window.setTimeout(() => setCopyLabel("Copy report"), 1500);
  }

  function handleDownload() {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify(
      {
        summary,
        issues
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ci-pipeline-report.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Analysis</h2>
        <div className="flex items-center gap-2 text-[11px]">
          <div className="inline-flex rounded-md border border-slate-700 bg-slate-900">
            <button
              type="button"
              className={`px-2 py-0.5 ${filter === "all" ? "bg-slate-800 text-gray-100" : "text-gray-400"}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 ${filter === "error" ? "bg-slate-800 text-red-300" : "text-gray-400"}`}
              onClick={() => setFilter("error")}
            >
              Errors
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 ${filter === "warning" ? "bg-slate-800 text-amber-200" : "text-gray-400"}`}
              onClick={() => setFilter("warning")}
            >
              Warnings
            </button>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-gray-200 hover:border-slate-500"
            onClick={handleCopy}
            disabled={!filteredIssues.length}
          >
            {copyLabel}
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-gray-200 hover:border-slate-500"
            onClick={handleDownload}
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-200">
        <div>
          <span className="font-semibold">Stages:</span> {summary.totalStages}
        </div>
        <div>
          <span className="font-semibold">Jobs:</span> {summary.totalJobs}
        </div>
        <div className="text-red-400">
          <span className="font-semibold">Errors:</span> {summary.errors}
        </div>
        <div className="text-amber-300">
          <span className="font-semibold">Warnings:</span> {summary.warnings}
        </div>
      </div>

      {issues.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto text-xs">
          {filteredIssues.map((issue) => {
            const isError = issue.severity === "error";
            const badge = isError ? "[error]" : "[warn]";
            const classes = isError
              ? "rounded border border-red-500/40 bg-red-500/10 px-2 py-1"
              : "rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1";
            return (
              <li key={issue.id} className={classes}>
                <span className="mr-2">{badge}</span>
                {issue.message}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-gray-400">No issues detected in this configuration.</p>
      )}
    </section>
  );
}
