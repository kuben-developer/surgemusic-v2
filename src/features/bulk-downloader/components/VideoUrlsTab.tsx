"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { countValidUrls } from "../utils/url-parser.utils";

interface VideoUrlsTabProps {
  onSubmit: (rawUrls: string) => Promise<unknown>;
  isSubmitting: boolean;
}

export function VideoUrlsTab({ onSubmit, isSubmitting }: VideoUrlsTabProps) {
  const [rawUrls, setRawUrls] = useState("");

  const urlStats = useMemo(() => {
    if (!rawUrls.trim()) {
      return { total: 0, valid: 0, invalid: 0 };
    }
    return countValidUrls(rawUrls, "videos");
  }, [rawUrls]);

  const handleSubmit = async () => {
    if (urlStats.valid === 0) return;
    await onSubmit(rawUrls);
    setRawUrls("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download by Video URLs</CardTitle>
        <CardDescription>
          Paste TikTok video URLs (one per line) to download them all at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder={`Paste TikTok video URLs here, one per line:

https://www.tiktok.com/@username/video/7430180462213041441
https://www.tiktok.com/@username/video/7416746792882097440
https://www.tiktok.com/@username/video/7510665893941136683`}
            className="min-h-[200px] font-mono text-sm"
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
              Download {urlStats.valid > 0 ? `${urlStats.valid} videos` : "Videos"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
