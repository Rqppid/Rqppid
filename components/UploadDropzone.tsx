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
      className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-zinc-500 bg-zinc-100 dark:bg-zinc-800"
          : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
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
          className="max-h-64 max-w-full rounded-lg object-contain"
        />
      ) : (
        <>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Drag a photo here, or click to choose one
          </p>
          <p className="text-xs text-zinc-500">JPEG, PNG, or WebP</p>
        </>
      )}
    </div>
  );
}
