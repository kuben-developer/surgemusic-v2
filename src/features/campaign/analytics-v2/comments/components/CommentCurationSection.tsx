"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrapeCommentsControls } from "./ScrapeCommentsControls";
import { CommentsList } from "./CommentsList";
import { useCommentCuration, type CommentFilterBy } from "../hooks/useCommentCuration";
import { useCommentScrape } from "../hooks/useCommentScrape";
import { fadeInUp } from "../../constants/metrics-v2";

interface CommentCurationSectionProps {
  campaignId: string;
}

export function CommentCurationSection({ campaignId }: CommentCurationSectionProps) {
  const [topNCount, setTopNCount] = useState(20);
  const [isSelectingTopN, setIsSelectingTopN] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Scrape functionality
  const scrape = useCommentScrape({ campaignId });

  // Curation functionality
  const curation = useCommentCuration({ campaignId });

  // Handle select top N
  const handleSelectTopN = async () => {
    setIsSelectingTopN(true);
    try {
      await curation.selectTopByLikes(topNCount, true);
    } finally {
      setIsSelectingTopN(false);
    }
  };

  // Handle save selections
  const handleSaveSelections = async (isSelected: boolean) => {
    setIsSaving(true);
    try {
      await curation.saveSelections(isSelected);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Comment Curation</h3>
            <p className="text-xs text-muted-foreground">
              Scrape and select best comments to display publicly
            </p>
          </div>
        </div>

        {/* Scrape Controls */}
        <div className="mb-4 pb-4 border-b">
          <ScrapeCommentsControls
            totalComments={scrape.totalComments}
            selectedCount={scrape.selectedCount}
            lastScrapedAt={scrape.lastScrapedAt}
            isActive={scrape.isActive}
            progressPercent={scrape.progressPercent}
            onStartScrape={scrape.startScrape}
          />
        </div>

        {/* Filter Tabs & Quick Actions */}
        {(curation.selectedCount > 0 || curation.unselectedCount > 0) && (
          <div className="space-y-4 mb-4 pb-4 border-b">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Tabs
                value={curation.filterBy}
                onValueChange={(value) => curation.handleFilterChange(value as CommentFilterBy)}
              >
                <TabsList>
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All ({curation.selectedCount + curation.unselectedCount})
                  </TabsTrigger>
                  <TabsTrigger value="selected" className="text-xs sm:text-sm">
                    Displayed ({curation.selectedCount})
                  </TabsTrigger>
                  <TabsTrigger value="unselected" className="text-xs sm:text-sm">
                    Not Displayed ({curation.unselectedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Quick select top N */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Quick Select Top</span>
                    <span className="sm:hidden">Top N</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Select Top Comments</h4>
                      <p className="text-xs text-muted-foreground">
                        Automatically select the top N comments by likes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={topNCount}
                        onChange={(e) => setTopNCount(Number(e.target.value))}
                        className="w-20"
                      />
                      <Button
                        onClick={handleSelectTopN}
                        disabled={isSelectingTopN}
                        size="sm"
                      >
                        {isSelectingTopN ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Select"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will clear existing selections
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Bulk actions for local selection */}
            {curation.selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {curation.selectedIds.size} checked
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleSaveSelections(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Add to Display</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleSaveSelections(false)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Remove from Display</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Comments List */}
        <CommentsList
          comments={curation.comments}
          isLoading={curation.isLoading}
          totalCount={curation.totalCount}
          currentPage={curation.currentPage}
          totalPages={curation.totalPages}
          sortBy={curation.sortBy}
          sortOrder={curation.sortOrder}
          selectedIds={curation.selectedIds}
          onPageChange={curation.goToPage}
          onSortChange={curation.handleSortChange}
          onToggleSelection={curation.toggleSelection}
          onSelectAll={curation.selectAll}
          onDeselectAll={curation.deselectAll}
        />
      </Card>
    </motion.div>
  );
}
