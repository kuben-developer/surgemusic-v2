"use client"
import { AppSidebar } from "@/components/app-sidebar";
import { CreditsDisplay } from "@/components/credits-display";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { UserButton } from "@clerk/nextjs";

export default function Sidebar({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 w-full justify-between">
                    <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center space-x-1 gap-2">
                            {/* <CreditsDisplay /> */}
                            <ThemeSwitcher />
                            <UserButton />
                        </div>
                        
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
