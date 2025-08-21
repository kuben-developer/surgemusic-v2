'use client';

import Image from 'next/image';
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "@/components/common/theme-switcher";

export function PublicReportHeader() {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/surge_white.png" : "/surge_black.png";

  return (
    <div className="pb-6 border-b mt-8 flex items-center justify-between">
      <Image
        src={logoSrc}
        alt="Surge Logo"
        width={120}
        height={40}
        priority
      />
      <ThemeSwitcher />
    </div>
  );
}