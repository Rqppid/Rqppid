"use client";

import { useEffect, useRef, useState } from "react";
import { ContextField } from "@/components/ContextField";
import { Disclaimer } from "@/components/Disclaimer";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultCard } from "@/components/ResultCard";
import { Spinner } from "@/components/Spinner";
import { UploadDropzone } from "@/components/UploadDropzone";
import { resizeImage } from "@/lib/resizeImage";
import type { TriageResponse, TriageResult } from "@/lib/schema";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
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
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Pothole Triage Tool
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Upload a photo of a road or footway defect to get a suggested risk category.
        </p>
      </header>

      <Disclaimer />

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
        className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
  );
}
