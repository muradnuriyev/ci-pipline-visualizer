import { NextResponse } from "next/server";
import { parseYamlConfig } from "@/lib/parseYaml";
import { analyzePipeline } from "@/lib/analyzeConfig";
import { buildGraph } from "@/lib/buildGraph";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.config !== "string") {
    return NextResponse.json({ error: "Missing config string in body." }, { status: 400 });
  }

  const parseResult = parseYamlConfig(body.config);
  const analysis = analyzePipeline(parseResult.pipeline);
  const graph = buildGraph(parseResult.pipeline);

  return NextResponse.json({
    pipeline: parseResult.pipeline,
    issues: [...parseResult.issues, ...analysis.issues],
    summary: analysis.summary,
    graph
  });
}

