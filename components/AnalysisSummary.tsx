import type { AnalysisSummary as Summary, PipelineIssue } from "@/lib/types";

interface AnalysisSummaryProps {
  summary: Summary;
  issues: PipelineIssue[];
}

export function AnalysisSummary(props: AnalysisSummaryProps) {
  const { summary, issues } = props;

  if (!summary.totalJobs && !summary.totalStages && issues.length === 0) {
    return null;
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Analysis</h2>
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
          {errors.map((issue) => (
            <li key={issue.id} className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1">
              <span className="mr-2">[error]</span>
              {issue.message}
            </li>
          ))}
          {warnings.map((issue) => (
            <li key={issue.id} className="rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1">
              <span className="mr-2">[warn]</span>
              {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400">No issues detected in this configuration.</p>
      )}
    </section>
  );
}
