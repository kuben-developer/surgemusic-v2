"use client"

import { Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ViewMode = "grid" | "table"

interface ViewToggleProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-primary/10">
      
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${viewMode === 'table' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Table view</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid view</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
} 