"use client";

import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportNameFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function ReportNameField({
    value,
    onChange,
    error,
    placeholder = "e.g., Q3 Marketing Performance",
    disabled = false,
}: ReportNameFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="report-name" className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                Report Name
            </Label>
            <Input 
                id="report-name"
                placeholder={placeholder} 
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
                Give your report a descriptive name.
            </p>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}