"use client";

import type { ReactNode } from "react";

interface AnalyticsPageLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for the analytics page
 *
 * Simple full-width layout for analytics content.
 */
export function AnalyticsPageLayout({ children }: AnalyticsPageLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <main className="w-full max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
