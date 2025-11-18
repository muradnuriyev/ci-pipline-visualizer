"use client";

import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type ReactFlowInstance
} from "reactflow";
import "reactflow/dist/style.css";

import type { PipelineGraph as Graph } from "@/lib/types";

interface PipelineGraphProps {
  graph: Graph;
  selectedJobName: string | null;
  onSelectJob(jobName: string | null): void;
}

export function PipelineGraph(props: PipelineGraphProps) {
  const { graph, selectedJobName, onSelectJob } = props;
  const [showNeeds, setShowNeeds] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);

  const stageHeaders = useMemo(
    () => {
      const map = new Map<number, string>();
      for (const node of graph.nodes) {
        if (!map.has(node.stageIndex)) {
          map.set(node.stageIndex, node.stage);
        }
      }
      return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, name]) => name);
    },
    [graph.nodes]
  );

  const nodes = useMemo<Node[]>(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        position: node.position,
        data: {
          label: node.jobName,
          stage: node.stage
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          borderRadius: 6,
          borderWidth: selectedJobName === node.id ? 2 : 1,
          borderColor: selectedJobName === node.id ? "#38bdf8" : "#4b5563",
          background: "rgba(15,23,42,0.95)",
          color: "#e5e7eb",
          padding: 8,
          fontSize: 11,
          minWidth: 140
        }
      })),
    [graph.nodes, selectedJobName]
  );

  const edges = useMemo<Edge[]>(
    () =>
      graph.edges
        .filter((edge) => {
          if (edge.kind === "needs") return showNeeds;
          if (edge.kind === "dependency") return showDependencies;
          return true;
        })
        .map((edge) => ({
          id: edge.id,
          source: edge.from,
          target: edge.to,
          animated: edge.kind === "needs",
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.Arrow
          },
          style: {
            strokeWidth: 1.5,
            stroke: edge.kind === "needs" ? "#22c55e" : "#60a5fa"
          }
        })),
    [graph.edges, showNeeds, showDependencies]
  );

  return (
    <div className="panel h-[480px] min-h-[320px] w-full">
      <div className="panel-header">
        <h2 className="panel-title">Pipeline graph</h2>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            className={`rounded-md border px-2 py-0.5 ${showNeeds ? "border-green-500/60 bg-green-500/10 text-green-300" : "border-slate-600 bg-slate-900 text-gray-300"}`}
            onClick={() => setShowNeeds((value) => !value)}
          >
            needs
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-0.5 ${showDependencies ? "border-sky-500/60 bg-sky-500/10 text-sky-300" : "border-slate-600 bg-slate-900 text-gray-300"}`}
            onClick={() => setShowDependencies((value) => !value)}
          >
            dependencies
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-600 bg-slate-900 px-2 py-0.5 text-[11px] text-gray-200 hover:border-sky-500"
            onClick={() => instance?.fitView({ padding: 0.2 })}
          >
            Fit view
          </button>
        </div>
      </div>
      <div className="relative h-[420px] rounded border border-slate-700 bg-slate-950/80">
        {stageHeaders.length > 0 && (
          <div className="pointer-events-none absolute left-0 right-0 top-1 z-10 flex h-7 items-end justify-between px-8 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {stageHeaders.map((name) => (
              <div key={name} className="flex min-w-[140px] flex-col items-center">
                <span>{name}</span>
                <span className="mt-1 h-px w-10 bg-slate-700" />
              </div>
            ))}
          </div>
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md border border-slate-700 bg-slate-950/90 px-3 py-2 text-[10px] text-gray-400">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Legend</div>
          <div className="flex items-center gap-2">
            <span className="h-px w-4 bg-green-400" />
            <span>needs</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-4 bg-sky-400" />
            <span>dependencies</span>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => onSelectJob(node.id)}
          onInit={(nextInstance) => setInstance(nextInstance)}
        >
          <Background gap={24} color="#1f2937" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
