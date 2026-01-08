"use client";

import { Button } from "@/components/ui/button";
import { Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PushToAnalyticsBarProps {
  selectedCount: number;
  onPush: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function PushToAnalyticsBar({
  selectedCount,
  onPush,
  onClear,
  isLoading = false,
}: PushToAnalyticsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 bg-background border shadow-lg rounded-full px-4 py-2">
            <span className="text-sm font-medium">
              {selectedCount} video{selectedCount > 1 ? "s" : ""} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              className="rounded-full h-8 w-8 p-0"
              disabled={isLoading}
            >
              <X className="size-4" />
            </Button>
            <Button
              size="sm"
              onClick={onPush}
              disabled={isLoading}
              className="rounded-full"
            >
              {isLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              Push to Analytics
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
