"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ContextField } from "@/components/ContextField";
import { Disclaimer } from "@/components/Disclaimer";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultCard } from "@/components/ResultCard";
import { Spinner } from "@/components/Spinner";
import { UploadDropzone } from "@/components/UploadDropzone";
import { resizeImage } from "@/lib/resizeImage";
import type { TriageResponse, TriageResult } from "@/lib/schema";

type Status = "idle" | "loading" | "success" | "error";

export default function ToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contextText, setContextText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function selectFile(selected: File) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(selected);
    previewUrlRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  async function handleSubmit() {
    if (!file || status === "loading") return;
    setStatus("loading");
    setError(null);
    setResult(null);

    let resized: File;
    try {
      resized = await resizeImage(file);
    } catch {
      setError("This image could not be processed. Try a different photo.");
      setStatus("error");
      return;
    }

    try {
      const formData = new FormData();
      formData.set("image", resized);
      if (contextText.trim()) formData.set("context", contextText.trim());

      const res = await fetch("/api/triage", { method: "POST", body: formData });
      const body: TriageResponse = await res.json();

      if (body.ok) {
        setResult(body.data);
        setStatus("success");
      } else {
        setError(body.error.message);
        setStatus("error");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <Link
        href="/"
        className="flex items-center gap-1 self-center text-sm text-zinc-500 transition-colors hover:text-blue-600 sm:self-start dark:text-zinc-500 dark:hover:text-blue-400"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to overview
      </Link>

      <header className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg shadow-blue-600/25"
            aria-hidden="true"
          >
            🚧
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Pothole Triage Tool
          </h1>
        </div>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Upload a photo of a road or footway defect to get a suggested risk category.
        </p>
      </header>

      <Disclaimer />

      <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-xl shadow-zinc-900/5 backdrop-blur-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <UploadDropzone
          previewUrl={previewUrl}
          disabled={isLoading}
          onFileSelected={selectFile}
          onRejected={(message) => {
            setError(message);
            setStatus("error");
          }}
        />

        <ContextField value={contextText} onChange={setContextText} disabled={isLoading} />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
        >
          {isLoading ? (
            <>
              <Spinner />
              Analyzing photo…
            </>
          ) : (
            "Analyze photo"
          )}
        </button>

        {status === "error" && error && (
          <ErrorBanner message={error} onRetry={file ? handleSubmit : undefined} />
        )}

        {status === "success" && result && <ResultCard result={result} />}
      </div>

      <footer className="text-center text-xs text-zinc-400 dark:text-zinc-600">
        Powered by Gemini · your photo is analyzed on demand and not stored.
      </footer>
    </div>
  );
}
