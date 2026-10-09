import { ShortenForm } from "@/components/ShortenForm";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white px-5 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-9">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" />
                <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 7.07 7.07L14 18.07" />
              </svg>
            </span>
            <p className="text-xl font-semibold tracking-tight">snip</p>
          </div>
          <p className="hidden text-sm text-slate-400 sm:block">Simple URL shortener</p>
        </header>

        <div className="mt-10 text-center sm:mt-12">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Long link. Short story.
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            Turn long URLs into short, shareable links in seconds.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <ShortenForm />
        </div>
      </div>
    </main>
  );
}
