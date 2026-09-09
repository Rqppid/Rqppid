"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

export function UploadDropzone({
  previewUrl,
  disabled,
  onFileSelected,
  onRejected,
}: {
  previewUrl: string | null;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onRejected: (message: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
        onRejected("Please upload a JPEG, PNG, or WebP photo.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onRejected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
      className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-zinc-300 bg-zinc-50/80 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Selected road defect photo"
          className="max-h-64 max-w-full rounded-lg object-contain shadow-sm"
        />
      ) : (
        <>
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              isDragging
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                : "bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
            aria-hidden="true"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </span>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Drag a photo here, or click to choose one
          </p>
          <p className="text-xs text-zinc-500">JPEG, PNG, or WebP</p>
        </>
      )}
    </div>
  );
}
