"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CampaignSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function CampaignSearchBar({
  searchQuery,
  onSearchChange,
  placeholder = "Search campaigns by name, song, artist, or genre...",
}: CampaignSearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10"
      />
    </div>
  );
}