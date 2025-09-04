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
import { ShieldAlert, Flame, ShieldCheck } from "lucide-react";

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
            <div className="text-left space-y-4">
              <div className="flex items-start gap-3 rounded-lg border bg-muted/50 px-3 py-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 aspect-square items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                  <Flame className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Before scheduling posts, give new or inactive social accounts a short warmup period. This builds normal activity patterns, reduces spam/automation flags, and improves reach.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Quick warmup checklist</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">Post 3-5 times over the last 7-14 days (short, natural posts).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">Engage daily: like, comment, follow a few relevant creators.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">Discover content within your niche using the platform's search bar.</span>
                  </li>
                </ul>
              </div>



              <p className="text-xs text-muted-foreground">
                If you've already been active recently, you're good to continue.
              </p>
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
