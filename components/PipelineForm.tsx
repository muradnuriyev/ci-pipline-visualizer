"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parse, stringify } from "yaml";
import { parseYamlConfig } from "@/lib/parseYaml";
import { analyzePipeline } from "@/lib/analyzeConfig";

const SAMPLE_CONFIG = `stages:
  - build
  - test
  - deploy

build_app:
  stage: build
  script:
    - npm ci
    - npm run build

unit_tests:
  stage: test
  needs: ["build_app"]
  script:
    - npm test

deploy_prod:
  stage: deploy
  needs: ["unit_tests"]
  script:
    - ./deploy.sh
`;

const HISTORY_KEY = "ci-pipeline-history";
const HISTORY_LIMIT = 5;

export function PipelineForm() {
  const router = useRouter();
  const [value, setValue] = useState(SAMPLE_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSummary, setValidationSummary] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setHistory(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      // ignore
    }
  }, []);

  function rememberConfig(config: string) {
    if (typeof window === "undefined") return;
    const trimmed = config.trim();
    if (!trimmed) return;

    setHistory((current) => {
      const next = [trimmed, ...current.filter((entry) => entry !== trimmed)].slice(0, HISTORY_LIMIT);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;

    setIsSubmitting(true);
    rememberConfig(value);

    const encoded = encodeURIComponent(value);
    router.push(`/visualize?config=${encoded}`);
  }

  function handleUseSample() {
    setValue(SAMPLE_CONFIG);
    setValidationSummary(null);
  }

  function handleClear() {
    setValue("");
    setValidationSummary(null);
  }

  function handleFormat() {
    if (!value.trim()) return;
    try {
      const parsed = parse(value);
      const formatted = stringify(parsed);
      setValue(formatted.trimEnd() + "\n");
    } catch {
      setValidationSummary("YAML is invalid, unable to format.");
    }
  }

  function handleValidate() {
    if (!value.trim()) return;
    const parseResult = parseYamlConfig(value);
    const analysis = analyzePipeline(parseResult.pipeline);
    const combined = [...parseResult.issues, ...analysis.issues];
    const errors = combined.filter((issue) => issue.severity === "error").length;
    const warnings = combined.filter((issue) => issue.severity === "warning").length;

    rememberConfig(value);

    if (!parseResult.pipeline) {
      setValidationSummary(`Parsed with issues: ${errors} errors, ${warnings} warnings.`);
    } else if (errors === 0 && warnings === 0) {
      setValidationSummary("Configuration looks good: no errors or warnings detected.");
    } else {
      setValidationSummary(`Analysis: ${errors} errors, ${warnings} warnings.`);
    }
  }

  function handleLoadFromFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange() {
    const input = fileInputRef.current;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files.item(0);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue(reader.result);
        setValidationSummary(null);
      }
    };
    reader.readAsText(file);
    input.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-3">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">.gitlab-ci.yml</h2>
          <p className="mt-1 text-xs text-gray-400">
            Paste a GitLab CI configuration or start with the sample below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-gray-200 hover:border-slate-500"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-gray-200 hover:border-sky-500 hover:text-sky-300"
            onClick={handleFormat}
            disabled={!value.trim()}
          >
            Format YAML
          </button>
        </div>
      </div>

      <textarea
        spellCheck={false}
        className="textarea font-mono text-xs leading-relaxed"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Paste your .gitlab-ci.yml here..."
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="text-xs text-gray-400 underline underline-offset-4 hover:text-gray-200"
            onClick={handleUseSample}
          >
            Load sample pipeline
          </button>
          <button
            type="button"
            className="text-xs text-gray-400 underline underline-offset-4 hover:text-gray-200"
            onClick={handleLoadFromFile}
          >
            Load .gitlab-ci.yml file
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-gray-200 hover:border-slate-500"
            onClick={handleValidate}
            disabled={!value.trim()}
          >
            Validate only
          </button>
          <button type="submit" className="button-primary" disabled={isSubmitting || !value.trim()}>
            {isSubmitting ? "Opening visualization..." : "Visualize pipeline"}
          </button>
        </div>
      </div>

      <p className="mt-1 text-[11px] text-gray-500">
        The configuration is not stored on the server yet; it is only passed to the visualization page via the URL.
      </p>

      {validationSummary && (
        <p className="mt-1 text-[11px] text-sky-300">
          {validationSummary}
        </p>
      )}

      {history.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
          <span className="font-semibold text-gray-500">Recent configs:</span>
          {history.map((config, index) => (
            <button
              key={index}
              type="button"
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-gray-200 hover:border-sky-500"
              onClick={() => {
                setValue(config);
                setValidationSummary(null);
              }}
            >
              #{history.length - index}
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".yml,.yaml"
        className="hidden"
        onChange={handleFileChange}
      />
    </form>
  );
}
