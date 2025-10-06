"use client"

import { useState, useMemo } from "react"

interface UsePaginationProps {
  totalItems: number
  itemsPerPage: number
}

export function usePagination({ totalItems, itemsPerPage }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedRange = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return { startIndex, endIndex }
  }, [currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    currentPage,
    totalPages,
    paginatedRange,
    handlePageChange,
  }
}
