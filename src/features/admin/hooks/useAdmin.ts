"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface UseAdminResult {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAdmin(): UseAdminResult {
  const result = useQuery(api.app.admin.isAdmin);
  return {
    isAdmin: Boolean(result),
    isLoading: result === undefined,
  };
}

