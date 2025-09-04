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
import { ShieldAlert, ShieldCheck, Info } from "lucide-react";

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
      <AlertDialogContent className="sm:max-w-[590px] rounded-xl">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="text-center mb-5">
            Did you warm up your accounts?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-left space-y-4">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center gap-3">
                  <Info className="h-16 w-16 text-primary" />
                  <p className="text-sm text-muted-foreground leading-6">
                    Before scheduling posts, give new or inactive social accounts a short warmup period to establish normal activity patterns, reduce automation flags, and improve reach.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Quick warmup checklist</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">Days 1-2: Scroll FYP 15 min/day and like some posts. Don't follow any accounts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">Days 3-5: Start following some accounts, set up bio + profile pic.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-muted-foreground">Day 5+: Post 1 video daily, ramp up to 2-3/day.</span>
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
