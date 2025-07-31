"use client";

import Sidebar from "./custom-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as PublicToaster } from "sonner";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const publicPaths = ['/public', '/sign-up', '/sign-in'];
  const isPublicRoute = publicPaths.some(path => pathname.startsWith(path));

  if (isPublicRoute) {
    return (
      <>
        <div className="relative flex min-h-screen flex-col items-center">
          <main className="flex-1 w-full flex justify-center">
            <div className="w-full max-w-screen-xl">{children}</div>
          </main>
          <footer className="py-6 text-center text-sm text-muted-foreground w-full">
            © {new Date().getFullYear()} Surge Music. All rights reserved.
          </footer>
        </div>
        <PublicToaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <Sidebar>{children}</Sidebar>
      <Toaster />
    </>
  );
}