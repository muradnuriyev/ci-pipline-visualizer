import type { AnalysisSummary, PipelineIssue } from "@/lib/types";

interface PipelineStatsStripProps {
  summary: AnalysisSummary;
  issues: PipelineIssue[];
}

export function PipelineStatsStrip(props: PipelineStatsStripProps) {
  const { summary, issues } = props;

  if (!summary.totalJobs && !summary.totalStages && issues.length === 0) {
    return null;
  }

  const hasIssues = issues.length > 0;

  return (
    <section className="grid gap-3 text-xs md:grid-cols-4">
      <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Stages</div>
        <div className="mt-1 text-base font-semibold text-slate-50">{summary.totalStages}</div>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Jobs</div>
        <div className="mt-1 text-base font-semibold text-slate-50">{summary.totalJobs}</div>
      </div>
      <div className="rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-red-300">Errors</div>
        <div className="mt-1 text-base font-semibold text-red-300">{summary.errors}</div>
      </div>
      <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">Warnings</div>
        <div className="mt-1 text-base font-semibold text-amber-200">
          {summary.warnings}
          {hasIssues && summary.warnings === 0 && summary.errors === 0 && (
            <span className="ml-1 text-[10px] text-gray-400">(from parser)</span>
          )}
        </div>
      </div>
    </section>
  );
}

