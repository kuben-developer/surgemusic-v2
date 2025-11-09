"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CampaignSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CampaignSearchInput({ 
  value, 
  onChange, 
  placeholder = "Search campaigns..." 
}: CampaignSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}