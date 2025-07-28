"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

const ThemeProvider = dynamic(
  () => import("@/components/theme-provider").then((mod) => mod.ThemeProvider),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ConvexClientProvider>
      <ThemeProvider >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#6366f1",
              colorText: "#374151",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}