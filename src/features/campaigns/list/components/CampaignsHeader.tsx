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
import { ViewToggle, type ViewMode } from "@/features/campaigns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  statusFilter: "all" | "pending" | "completed" | "failed";
  onStatusFilterChange: (status: "all" | "pending" | "completed" | "failed") => void;
  dateFilter: "all" | "today" | "week" | "month" | "year";
  onDateFilterChange: (date: "all" | "today" | "week" | "month" | "year") => void;
}

export function CampaignsHeader({
  dataSummary,
  searchQuery,
  onSearchChange,
  onManageFolders,
  viewMode,
  setViewMode,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
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

      {/* Search Bar, Filters and View Toggle */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full max-w-md"
        />
        
        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>
    </div>
  );
}