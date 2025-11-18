"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parse, stringify } from "yaml";

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

export function PipelineForm() {
  const router = useRouter();
  const [value, setValue] = useState(SAMPLE_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;

    setIsSubmitting(true);

    const encoded = encodeURIComponent(value);
    router.push(`/visualize?config=${encoded}`);
  }

  function handleUseSample() {
    setValue(SAMPLE_CONFIG);
  }

  function handleClear() {
    setValue("");
  }

  function handleFormat() {
    if (!value.trim()) return;
    try {
      const parsed = parse(value);
      const formatted = stringify(parsed);
      setValue(formatted.trimEnd() + "\n");
    } catch {
      // eslint-disable-next-line no-alert
      alert("YAML is invalid, unable to format.");
    }
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

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="text-xs text-gray-400 underline underline-offset-4 hover:text-gray-200"
          onClick={handleUseSample}
        >
          Load sample pipeline
        </button>

        <button type="submit" className="button-primary" disabled={isSubmitting || !value.trim()}>
          {isSubmitting ? "Opening visualization..." : "Visualize pipeline"}
        </button>
      </div>

      <p className="mt-1 text-[11px] text-gray-500">
        The configuration is not stored yet; it is only passed to the visualization page via the URL.
      </p>
    </form>
  );
}
