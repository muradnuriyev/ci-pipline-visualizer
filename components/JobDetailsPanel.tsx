"use client";

import type { PipelineJob } from "@/lib/types";

interface JobDetailsPanelProps {
  job: PipelineJob | null;
  onClearSelection?(): void;
}

export function JobDetailsPanel(props: JobDetailsPanelProps) {
  const { job, onClearSelection } = props;

  if (!job) {
    return (
      <aside className="panel h-full text-xs text-gray-400">
        Click on a job node in the graph to inspect its details.
      </aside>
    );
  }

  return (
    <aside className="panel h-full text-xs">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Job details</h2>
          <p className="mt-1 font-mono text-sm text-gray-100">{job.name}</p>
        </div>
        {onClearSelection && (
          <button
            type="button"
            className="rounded-md border border-slate-600 bg-slate-900 px-2 py-0.5 text-[11px] text-gray-200 hover:border-slate-400"
            onClick={onClearSelection}
          >
            Reset
          </button>
        )}
      </div>

      <dl className="space-y-2">
        <div>
          <dt className="font-semibold text-gray-300">Stage</dt>
          <dd className="text-gray-200">{job.stage}</dd>
        </div>

        {job.image && (
          <div>
            <dt className="font-semibold text-gray-300">Image</dt>
            <dd className="font-mono text-[11px] text-gray-200">{job.image}</dd>
          </div>
        )}

        <div>
          <dt className="font-semibold text-gray-300">Script</dt>
          <dd>
            {job.script.length > 0 ? (
              <pre className="mt-1 max-h-48 overflow-auto rounded bg-black/60 p-2 font-mono text-[11px] leading-relaxed text-gray-100">
                {job.script.join("\n")}
              </pre>
            ) : (
              <span className="text-gray-400">No script defined.</span>
            )}
          </dd>
        </div>

        {job.needs.length > 0 && (
          <div>
            <dt className="font-semibold text-gray-300">Needs</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {job.needs.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-300 ring-1 ring-sky-500/40"
                >
                  {name}
                </span>
              ))}
            </dd>
          </div>
        )}

        {job.dependencies.length > 0 && (
          <div>
            <dt className="font-semibold text-gray-300">Dependencies</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {job.dependencies.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] text-blue-300 ring-1 ring-blue-400/40"
                >
                  {name}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </aside>
  );
}
