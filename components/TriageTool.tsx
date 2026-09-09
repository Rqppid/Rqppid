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

export function TriageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contextText, setContextText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); }, []);

  function selectFile(selected: File) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(selected);
    previewUrlRef.current = url;
    setFile(selected); setPreviewUrl(url); setResult(null); setError(null); setStatus("idle");
  }

  async function handleSubmit() {
    if (!file || status === "loading") return;
    setStatus("loading"); setError(null); setResult(null);
    let resized: File;
    try { resized = await resizeImage(file); }
    catch { setError("This image could not be processed. Try a different photo."); setStatus("error"); return; }
    try {
      const formData = new FormData(); formData.set("image", resized);
      if (contextText.trim()) formData.set("context", contextText.trim());
      const res = await fetch("/api/triage", { method: "POST", body: formData });
      const body: TriageResponse = await res.json();
      if (body.ok) { setResult(body.data); setStatus("success"); }
      else { setError(body.error.message); setStatus("error"); }
    } catch { setError("Could not reach the server. Check your connection and try again."); setStatus("error"); }
  }

  const isLoading = status === "loading";
  return <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-7 px-5 py-12 sm:py-16">
    <header className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">AI-assisted report review</p><h1 className="mt-3 text-4xl font-medium tracking-[-.06em] text-white sm:text-5xl">Report a road defect.</h1><p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">Add a clear photo and a little context. HotPots will suggest a priority category for human review.</p></header>
    <Disclaimer />
    <section className="grid gap-5 lg:grid-cols-[1fr_.6fr]"><div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#0d1918] p-5 shadow-2xl shadow-black/20 sm:p-7"><UploadDropzone previewUrl={previewUrl} disabled={isLoading} onFileSelected={selectFile} onRejected={(message) => { setError(message); setStatus("error"); }} /><ContextField value={contextText} onChange={setContextText} disabled={isLoading} /><button type="button" onClick={handleSubmit} disabled={!file || isLoading} className="flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3.5 font-semibold text-[#071014] transition-all hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500">{isLoading ? <><Spinner />Checking report…</> : "Review this report →"}</button>{status === "error" && error && <ErrorBanner message={error} onRetry={file ? handleSubmit : undefined} />}{status === "success" && result && <ResultCard result={result} />}</div><aside className="rounded-3xl border border-white/10 bg-[#0a1214] p-6"><p className="text-xs font-semibold uppercase tracking-[.18em] text-lime-300">A better report</p><ol className="mt-8 space-y-6"><li><span className="text-zinc-600">01</span><h2 className="mt-1 font-medium text-white">Get close to the defect</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Include its edges and enough road surface to show scale.</p></li><li><span className="text-zinc-600">02</span><h2 className="mt-1 font-medium text-white">Add the location</h2><p className="mt-1 text-sm leading-6 text-zinc-500">A road name or nearby landmark helps the report reach the right place.</p></li><li><span className="text-zinc-600">03</span><h2 className="mt-1 font-medium text-white">Keep people in the loop</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Every suggestion is reviewed before action is taken.</p></li></ol></aside></section>
    <footer className="text-center text-xs text-zinc-500">Powered by Gemini · photos are analysed on demand and not stored.</footer>
  </main>;
}
