"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert, Flame, ShieldCheck, Clock, TrendingUp } from "lucide-react";

interface WarmupReminderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function WarmupReminderDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: WarmupReminderDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[560px] rounded-xl">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="text-center mb-5">
            Did you warm up your accounts?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium leading-none">Recent activity</p>
                    <p className="text-xs text-muted-foreground">Posted and engaged in the last 7–14 days; profile looks complete.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium leading-none">Account health</p>
                    <p className="text-xs text-muted-foreground">No policy violations, spam patterns, or automation flags.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium leading-none">Gradual ramp-up</p>
                    <p className="text-xs text-muted-foreground">Scale volume over several days; avoid jumping from 0 to high output.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium leading-none">Consistent cadence</p>
                    <p className="text-xs text-muted-foreground">Keep a predictable schedule; avoid bursts and long idle periods.</p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go back</AlertDialogCancel>
          <AlertDialogAction className="gap-1.5" onClick={onConfirm}>
            <ShieldCheck className="h-4 w-4" />
            Yes, continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
