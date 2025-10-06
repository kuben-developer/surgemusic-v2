"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfilePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function ProfilePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: ProfilePaginationProps) {
  if (totalPages <= 1) return null

  const handlePageChange = (pageNumber: number) => {
    onPageChange(pageNumber)
  }

  const generatePageButtons = () => {
    const pageButtons = []
    const maxButtonsToShow = 10
    const ellipsis = (key: string) => (
      <div key={key} className="px-2 text-muted-foreground">
        ...
      </div>
    )

    // Always show first page
    pageButtons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        onClick={() => handlePageChange(1)}
        className={cn(
          "h-9 w-9",
          currentPage === 1
            ? "bg-primary text-primary-foreground"
            : "bg-background/50 border-primary/20 hover:border-primary/40"
        )}
      >
        1
      </Button>
    )

    // Calculate the range of pages to show around current page
    let startPage = Math.max(2, currentPage - Math.floor(maxButtonsToShow / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxButtonsToShow - 3)

    if (endPage - startPage < maxButtonsToShow - 3) {
      startPage = Math.max(2, endPage - (maxButtonsToShow - 3) + 1)
    }

    // Add ellipsis if there's a gap after first page
    if (startPage > 2) {
      pageButtons.push(ellipsis('start-ellipsis'))
    }

    // Add the middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(i)}
          className={cn(
            "h-9 w-9",
            currentPage === i
              ? "bg-primary text-primary-foreground"
              : "bg-background/50 border-primary/20 hover:border-primary/40"
          )}
        >
          {i}
        </Button>
      )
    }

    // Add ellipsis if there's a gap before last page
    if (endPage < totalPages - 1) {
      pageButtons.push(ellipsis('end-ellipsis'))
    }

    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      pageButtons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          className={cn(
            "h-9 w-9",
            currentPage === totalPages
              ? "bg-primary text-primary-foreground"
              : "bg-background/50 border-primary/20 hover:border-primary/40"
          )}
        >
          {totalPages}
        </Button>
      )
    }

    return pageButtons
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-6", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {generatePageButtons()}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
