"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  FolderOpen,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface DataSummary {
  totalFolders: number;
  totalCampaigns: number;
  unorganizedCampaigns: number;
  organizedCampaigns: number;
  completedCampaigns: number;
  inProgressCampaigns: number;
  organizationRate: number;
}

interface CampaignsHeaderProps {
  dataSummary: DataSummary | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onManageFolders: () => void;
}

export function CampaignsHeader({
  dataSummary,
  searchQuery,
  onSearchChange,
  onManageFolders,
}: CampaignsHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your content distribution campaigns
          </p>
          {dataSummary && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                {dataSummary.totalFolders} folders
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {dataSummary.totalCampaigns} campaigns
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Manage Folders Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onManageFolders}
            className="h-8 px-3 gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Manage Folders</span>
          </Button>

          <Link href="/campaign/create" className="w-full sm:w-auto">
            <Button
              className="relative group gap-2 w-full sm:w-auto px-6 py-2 h-auto bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">Create Campaign</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <Input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
    </div>
  );
}