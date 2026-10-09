"use client";

import { useId, useState, type FormEvent } from "react";
import { createShortUrl, type ShortenedUrl } from "@/lib/api";
import { validateUrlInput } from "@/lib/validate-url";

export function ShortenForm() {
  const inputId = useId();
  const errorId = useId();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCopied(false);
    setLoading(true);

    try {
      const normalized = validateUrlInput(url);
      const shortened = await createShortUrl(normalized);
      setResult(shortened);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to shorten that URL. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
    } catch {
      setError("Unable to copy. Please copy the URL manually.");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
            Your destination URL
          </label>
          <input
            id={inputId}
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com/your/very/long/url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M8.1 8.1 19 19" />
            <path d="M8.1 15.9 12 12" />
            <path d="m20 4-8 8" />
          </svg>
          {loading ? "Shortening..." : "Shorten URL"}
        </button>

        {error ? (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </form>

      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
        Fast · Simple · No account required
      </p>

      {result ? (
        <section
          aria-label="Shortened URL"
          className="mt-8 border-t border-slate-200 pt-6"
        >
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-emerald-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8.5 12.5 2.5 2.5 4.5-5" />
              </svg>
              Your short link is ready
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-4 py-3 text-blue-600"
              >
                {result.shortUrl}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy"}
                className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
              >
                {copied ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="11" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? "Short URL copied to clipboard." : ""}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
