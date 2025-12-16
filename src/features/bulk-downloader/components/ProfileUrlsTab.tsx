"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { DateFilterSelect } from "./DateFilterSelect";
import { countValidUrls, getDateFilterTimestamp } from "../utils/url-parser.utils";
import type { DateFilterOption } from "../types/bulk-downloader.types";

interface ProfileUrlsTabProps {
  onSubmit: (rawUrls: string, uploadedBefore?: number) => Promise<unknown>;
  isSubmitting: boolean;
}

export function ProfileUrlsTab({ onSubmit, isSubmitting }: ProfileUrlsTabProps) {
  const [rawUrls, setRawUrls] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("all");
  const [customDate, setCustomDate] = useState<Date | undefined>();

  const urlStats = useMemo(() => {
    if (!rawUrls.trim()) {
      return { total: 0, valid: 0, invalid: 0 };
    }
    return countValidUrls(rawUrls, "profiles");
  }, [rawUrls]);

  const handleSubmit = async () => {
    if (urlStats.valid === 0) return;

    const uploadedBefore = getDateFilterTimestamp(dateFilter, customDate);
    await onSubmit(rawUrls, uploadedBefore);
    setRawUrls("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download by Profile URLs</CardTitle>
        <CardDescription>
          Paste TikTok profile URLs to download all videos from those accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder={`Paste TikTok profile URLs here, one per line:

https://www.tiktok.com/@username1
https://www.tiktok.com/@username2
@username3`}
            className="min-h-[160px] font-mono text-sm"
            value={rawUrls}
            onChange={(e) => setRawUrls(e.target.value)}
            disabled={isSubmitting}
          />

          {/* URL validation feedback */}
          {rawUrls.trim() && (
            <div className="flex items-center gap-2 text-sm">
              {urlStats.valid > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {urlStats.valid} valid
                </Badge>
              )}
              {urlStats.invalid > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {urlStats.invalid} invalid
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Date filter */}
        <DateFilterSelect
          value={dateFilter}
          onChange={setDateFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || urlStats.valid === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting download...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download from {urlStats.valid > 0 ? `${urlStats.valid} profiles` : "Profiles"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
