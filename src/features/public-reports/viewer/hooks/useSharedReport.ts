"use client"

import { useState, useEffect } from 'react';
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { SharedReportData, PublicReportError } from '../types';

export const useSharedReport = (shareId: string, dateRange: string) => {
  const getSharedReport = useAction(api.public.getSharedReport);
  const [data, setData] = useState<SharedReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<PublicReportError | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchReport = async () => {
    if (!shareId || shareId.length < 16) return;
    
    try {
      setIsFetching(true);
      setIsError(false);
      setError(null);
      const result = await getSharedReport({
        shareId,
        days: parseInt(dateRange, 10)
      });
      setData(result);
    } catch (err) {
      setIsError(true);
      // Convert unknown error to our typed error interface
      const typedError: PublicReportError = {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        name: err instanceof Error ? err.name : 'Error',
        cause: err
      };
      setError(typedError);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      setIsRefetching(false);
    }
  };

  const refetch = () => {
    setIsRefetching(true);
    fetchReport();
  };

  useEffect(() => {
    fetchReport();
  }, [shareId, dateRange]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching shared report:", error);
    }
  }, [error]);

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isRefetching,
    refetch
  };
};