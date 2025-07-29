import { Toaster } from "sonner";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { type Metadata } from "next";
import { Providers } from "../(private-routes)/providers";  // Import Providers to maintain themes

// Use Geist to match main site styling, but without the sidebar
const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Surge Music - Report",
  description: "View shared analytics report",
  icons: {
    icon: "/surge_icon_white.png"
  }
};

export default function PublicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background font-sans antialiased ${geist.className}`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col items-center">
            <main className="flex-1 w-full flex justify-center">
              <div className="w-full max-w-screen-xl">{children}</div>
            </main>
            <footer className="py-6 text-center text-sm text-muted-foreground w-full">
              © {new Date().getFullYear()} Surge Music. All rights reserved.
            </footer>
          </div>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
} 