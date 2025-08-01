"use client";

import { FileText } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ReportNameFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    placeholder?: string;
    disabled?: boolean;
}

export function ReportNameField<T extends FieldValues>({
    control,
    name,
    placeholder = "e.g., Q3 Marketing Performance",
    disabled = false,
}: ReportNameFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        Report Name
                    </FormLabel>
                    <FormControl>
                        <Input 
                            placeholder={placeholder} 
                            disabled={disabled}
                            {...field} 
                        />
                    </FormControl>
                    <FormDescription>
                        Give your report a descriptive name.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}