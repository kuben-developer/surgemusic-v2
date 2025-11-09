"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Music, User, Tag, Calendar, BarChart2, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CampaignHeaderProps } from "../types/campaign-detail.types";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function CampaignHeader({ campaign, campaignId, generatedVideos }: CampaignHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCampaign = useMutation(api.app.campaigns.deleteCampaign);
  const router = useRouter();

  if (!campaign) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCampaign({ campaignId: campaignId as Id<"campaigns"> });
      toast.success("Campaign deleted successfully");
      router.push("/campaign");
    } catch (error) {
      toast.error("Failed to delete campaign");
      console.error("Error deleting campaign:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <motion.section
      variants={fadeInUp}
      className="relative overflow-hidden rounded-2xl p-10 shadow-xl border border-primary/10"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      
      {/* Delete button positioned at top-right */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="gap-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Delete</span>
        </Button>
      </div>

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">
                {campaign.campaignName}
              </h1>
              <p className="text-muted-foreground">Campaign Details</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href={`/campaign/${campaignId}/analytics`}>
            <Button variant="outline" className="gap-2 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40">
              <span className="relative flex items-center gap-2">
                <BarChart2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">View Analytics</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium text-muted-foreground">Song</p>
              </div>
              <p className="text-lg font-medium truncate">{campaign.songName}</p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium text-muted-foreground">Artist</p>
              </div>
              <p className="text-lg font-medium truncate capitalize">{campaign.artistName}</p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium text-muted-foreground">Genre</p>
              </div>
              <p className="text-lg font-medium truncate capitalize">{campaign.genre}</p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium text-muted-foreground">Created</p>
              </div>
              <p className="text-lg font-medium truncate">
                {new Date(campaign._creationTime).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the campaign "{campaign.campaignName}" and cannot be undone.
              All associated data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
}