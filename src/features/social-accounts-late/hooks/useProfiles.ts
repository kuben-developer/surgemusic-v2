"use client"

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { LateProfileWithAccounts } from "../types/social-accounts.types";

export function useProfiles() {
  const profiles = useQuery(api.app.late.getProfiles);

  return {
    profiles: (profiles as LateProfileWithAccounts[] | undefined) || [],
    isLoading: profiles === undefined,
  };
}
