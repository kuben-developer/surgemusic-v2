"use client";

import { ListChecks } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CampaignSelectionHeader() {
    return (
        <CardHeader>
            <CardTitle className="flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-green-600" />
                Select Campaigns
            </CardTitle>
            <CardDescription>
                Choose the campaigns to include in this report. At least one campaign must be selected.
            </CardDescription>
        </CardHeader>
    );
}