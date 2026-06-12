"use client";

import dynamic from "next/dynamic";

const LandingPage = dynamic(
  () =>
    import("@/components/landing/landing-page").then((mod) => mod.LandingPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/50">
        Loading...
      </div>
    ),
  }
);

export function ClientShell() {
  return <LandingPage />;
}
