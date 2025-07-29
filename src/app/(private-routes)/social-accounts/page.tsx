"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Loader2, Trash2, UserPlus, Users, XCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

// SVG Icons for platforms
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" fill="currentColor" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 1.44144C10.136 1.44144 10.3893 1.44144 11.2327 1.49078C12.0127 1.53078 12.4327 1.67078 12.7193 1.79078C13.0727 1.94144 13.3593 2.13078 13.636 2.40744C13.9127 2.68411 14.1127 2.97078 14.2527 3.32411C14.3727 3.61078 14.5127 4.03078 14.5527 4.81078C14.6027 5.65411 14.6027 5.90744 14.6027 8.04344C14.6027 10.1794 14.6027 10.4328 14.5527 11.2761C14.5127 12.0561 14.3727 12.4761 14.2527 12.7628C14.1027 13.1161 13.9127 13.4028 13.636 13.6794C13.3593 13.9561 13.0727 14.1561 12.7193 14.2961C12.4327 14.4161 12.0127 14.5561 11.2327 14.5961C10.3893 14.6461 10.136 14.6461 8 14.6461C5.864 14.6461 5.61067 14.6461 4.76733 14.5961C3.98733 14.5561 3.56733 14.4161 3.28067 14.2961C2.92733 14.1461 2.64067 13.9561 2.364 13.6794C2.08733 13.4028 1.88733 13.1161 1.74733 12.7628C1.62733 12.4761 1.48733 12.0561 1.44733 11.2761C1.39733 10.4328 1.39733 10.1794 1.39733 8.04344C1.39733 5.90744 1.39733 5.65411 1.44733 4.81078C1.48733 4.03078 1.62733 3.61078 1.74733 3.32411C1.89733 2.97078 2.08733 2.68411 2.364 2.40744C2.64067 2.13078 2.92733 1.93078 3.28067 1.79078C3.56733 1.67078 3.98733 1.53078 4.76733 1.49078C5.61067 1.44144 5.864 1.44144 8 1.44144ZM8 0.0434418C5.82733 0.0434418 5.55067 0.0434418 4.69733 0.0927751C3.84733 0.142775 3.26733 0.292775 2.76733 0.492775C2.24733 0.702775 1.81733 0.982775 1.39067 1.41078C0.964 1.83744 0.684 2.26744 0.474 2.78744C0.274 3.28744 0.124 3.86744 0.0746667 4.71744C0.0253333 5.57078 0.0253333 5.84744 0.0253333 8.02011C0.0253333 10.1928 0.0253333 10.4694 0.0746667 11.3228C0.124 12.1728 0.274 12.7528 0.474 13.2528C0.684 13.7728 0.964 14.2028 1.39067 14.6294C1.81733 15.0561 2.24733 15.3361 2.76733 15.5461C3.26733 15.7461 3.84733 15.8961 4.69733 15.9461C5.55067 15.9954 5.82733 15.9954 8 15.9954C10.1727 15.9954 10.4493 15.9954 11.3027 15.9461C12.1527 15.8961 12.7327 15.7461 13.2327 15.5461C13.7527 15.3361 14.1827 15.0561 14.6093 14.6294C15.036 14.2028 15.316 13.7728 15.526 13.2528C15.726 12.7528 15.876 12.1728 15.926 11.3228C15.9753 10.4694 15.9753 10.1928 15.9753 8.02011C15.9753 5.84744 15.9753 5.57078 15.926 4.71744C15.876 3.86744 15.726 3.28744 15.526 2.78744C15.316 2.26744 15.036 1.83744 14.6093 1.41078C14.1827 0.984108 13.7527 0.704108 13.2327 0.494108C12.7327 0.294108 12.1527 0.144108 11.3027 0.0941084C10.4493 0.0434418 10.1727 0.0434418 8 0.0434418Z" fill="currentColor" />
    <path d="M8 3.89078C5.73067 3.89078 3.89067 5.73078 3.89067 8.00011C3.89067 10.2694 5.73067 12.1094 8 12.1094C10.2693 12.1094 12.1093 10.2694 12.1093 8.00011C12.1093 5.73078 10.2693 3.89078 8 3.89078ZM8 10.6694C6.52733 10.6694 5.33067 9.47278 5.33067 8.00011C5.33067 6.52744 6.52733 5.33078 8 5.33078C9.47267 5.33078 10.6693 6.52744 10.6693 8.00011C10.6693 9.47278 9.47267 10.6694 8 10.6694Z" fill="currentColor" />
    <path d="M12.2707 4.69078C12.8027 4.69078 13.2333 4.26019 13.2333 3.72811C13.2333 3.19603 12.8027 2.76544 12.2707 2.76544C11.7386 2.76544 11.308 3.19603 11.308 3.72811C11.308 4.26019 11.7386 4.69078 12.2707 4.69078Z" fill="currentColor" />
  </svg>
)

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15.6654 4.27525C15.4814 3.58325 14.9374 3.03925 14.2454 2.85525C13.0054 2.53325 7.99938 2.53325 7.99938 2.53325C7.99938 2.53325 2.99338 2.53325 1.75338 2.85525C1.06138 3.03925 0.517375 3.58325 0.333375 4.27525C0.0113752 5.51525 0.0113752 8.00725 0.0113752 8.00725C0.0113752 8.00725 0.0113752 10.4993 0.333375 11.7393C0.517375 12.4313 1.06138 12.9753 1.75338 13.1593C2.99338 13.4813 7.99938 13.4813 7.99938 13.4813C7.99938 13.4813 13.0054 13.4813 14.2454 13.1593C14.9374 12.9753 15.4814 12.4313 15.6654 11.7393C15.9874 10.4993 15.9874 8.00725 15.9874 8.00725C15.9874 8.00725 15.9874 5.51525 15.6654 4.27525ZM6.39938 10.3873V5.62725L10.5594 8.00725L6.39938 10.3873Z" fill="currentColor" />
  </svg>
)

// Define types based on Convex schema
type SocialAccount = {
  _id: string;
  platform: string;
  username: string;
  userImage: string;
  profileUrl: string;
  status: string;
  connectedAt: string;
  _creationTime: number;
}

type AyrshareProfile = {
  _id: string;
  profileName: string;
  totalAccounts: number;
  createdAt: string;
  profileKey?: string;
  _creationTime: number;
  socialAccounts: SocialAccount[];
}

type ProfileWithAccounts = AyrshareProfile

type ProfileCheckResult = {
  profileName: string;
  message: string;
  status: 'success' | 'error' | 'pending';
}

export default function SocialAccountsPage() {
  const [newProfileName, setNewProfileName] = useState("")
  const [expandedProfiles, setExpandedProfiles] = useState<string[]>([])
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false)
  const [deletingProfileName, setDeletingProfileName] = useState<string | null>(null)

  // New state for sync feature
  const [isCheckingDialogOpen, setIsCheckingDialogOpen] = useState(false)
  const [profileCheckResults, setProfileCheckResults] = useState<ProfileCheckResult[]>([])
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1) // Start at -1
  const [completedChecksCount, setCompletedChecksCount] = useState(0)
  const [isSyncingInProgress, setIsSyncingInProgress] = useState(false)

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const deletedItemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch profiles data using Convex
  const profiles = useQuery(api.ayrshare.getProfiles)
  const isLoading = profiles === undefined
  const isError = false // Convex doesn't have isError
  const refetch = () => {} // Convex auto-refreshes

  const checkProfilesMutation = useMutation(api.ayrshare.checkProfiles)


  const totalProfilesToSync = useMemo(() => {
    return profiles?.filter(p => !!p.profileName).length || 0;
  }, [profiles]);

  // useEffect for auto-scrolling
  useEffect(() => {
    if (!isCheckingDialogOpen || currentCheckIndex < 0) return;
    
    // Find the currently processing profile
    const currentProfile = profileCheckResults[currentCheckIndex];
    if (!currentProfile) return;
    
    // Scroll to the appropriate section based on message
    if (currentProfile.message === "Deleted") {
      // For deleted profiles, look through deletedItemRefs
      const deletedIndex = profileCheckResults
        .filter(r => r.message === "Deleted")
        .findIndex(r => r.profileName === currentProfile.profileName);
      
      if (deletedIndex >= 0 && deletedItemRefs.current[deletedIndex]) {
        deletedItemRefs.current[deletedIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    } else {
      // For active profiles, look through itemRefs
      const activeIndex = profileCheckResults
        .filter(r => r.message !== "Deleted")
        .findIndex(r => r.profileName === currentProfile.profileName);
      
      if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
        itemRefs.current[activeIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [currentCheckIndex, isCheckingDialogOpen, profileCheckResults]);

  // Set initially expanded profiles when data loads
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setExpandedProfiles(profiles.map(profile => profile.profileName))
    }
  }, [profiles])

  // Create profile mutation
  const createProfileMutation = useMutation(api.ayrshare.createProfile)

  // Delete profile mutation
  const deleteProfileMutation = useMutation(api.ayrshare.deleteProfileMutation)

  // Generate profile manager URL mutation
  const generateUrlMutation = useMutation(api.ayrshare.generateProfileManagerUrl)


  // Function to handle checking all profiles
  const handleCheckProfiles = async () => {
    if (!profiles) return;
    const validProfiles = profiles.filter(profile => !!profile.profileName && profile.profileName);
    if (validProfiles.length === 0) {
      toast.info("No valid profiles to sync.");
      return;
    }

    setIsSyncingInProgress(true);
    setCompletedChecksCount(0);
    setCurrentCheckIndex(-1); 

    const initialResults: ProfileCheckResult[] = validProfiles.map(profile => ({
      profileName: profile.profileName!.split("|")[0] || "Unknown Profile",
      message: "Queued",
      status: 'pending'
    }));
    setProfileCheckResults(initialResults);
    
    // Initialize ref arrays for auto-scrolling
    itemRefs.current = new Array(validProfiles.length).fill(null);
    deletedItemRefs.current = new Array(validProfiles.length).fill(null);

    setIsCheckingDialogOpen(true);

    const batchSize = 10;
    for (let i = 0; i < validProfiles.length; i += batchSize) {
      const batch = validProfiles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (profile, batchIndex) => {
        const overallIndex = i + batchIndex;
        
        // Set status to "Checking..." and scroll
        setProfileCheckResults(prevResults =>
          prevResults.map((r, idx) =>
            idx === overallIndex ? { ...r, message: "Checking...", status: 'pending' } : r
          )
        );
        setCurrentCheckIndex(overallIndex); 

        try {
          const data = await checkProfilesMutation({ profileName: profile.profileName! });
          setProfileCheckResults(prevResults =>
            prevResults.map((r, idx) =>
              idx === overallIndex ? { ...r, message: data.message, status: 'success' } : r
            )
          );
        } catch (error) {
          setProfileCheckResults(prevResults =>
            prevResults.map((r, idx) =>
              idx === overallIndex ? { ...r, message: error.message || "Sync failed", status: 'error' } : r
            )
          );
        } finally {
          setCompletedChecksCount(prevCount => prevCount + 1);
        }
      });
      await Promise.all(batchPromises);
    }
    
    toast.success("Profile sync complete!", {
      description: `${completedChecksCount} of ${totalProfilesToSync} profiles checked.`
    });
    setIsSyncingInProgress(false); 
    refetch(); 
  };

  // Function to handle adding a new user profile
  const handleAddUserProfile = async () => {
    if (newProfileName.trim()) {
      try {
        await createProfileMutation({ profileName: newProfileName.trim() })
        toast.success("Profile created successfully")
        setNewProfileName("")
        setIsUserProfileDialogOpen(false)
        refetch()
      } catch (error) {
        toast.error(`Failed to create profile: ${(error as Error).message}`)
      }
    }
  }

  // Function to handle deleting a user profile
  const handleDeleteUserProfile = async (profileName: string) => {
    try {
      await deleteProfileMutation({ profileName })
      toast.success("Profile deleted successfully")
      refetch()
    } catch (error) {
      toast.error(`Failed to delete profile: ${(error as Error).message}`)
    }
  }

  // Function to toggle profile expansion
  const toggleProfileExpansion = (profileName: string) => {
    setExpandedProfiles(prev =>
      prev.includes(profileName)
        ? prev.filter(name => name !== profileName)
        : [...prev, profileName]
    )
  }

  // Function to get the appropriate icon for each platform
  const getPlatformIcon = (platform: string, className?: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <InstagramIcon className={className || "w-5 h-5 text-pink-500"} />
      case "tiktok":
        return <TikTokIcon className={className || "w-5 h-5 text-black dark:text-white"} />
      case "youtube":
        return <YouTubeIcon className={className || "w-5 h-5 text-red-600"} />
      default:
        return null
    }
  }

  // Function to get the appropriate color for each platform's badge
  const getPlatformBadgeClass = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "tiktok":
        return "bg-black text-white dark:bg-white dark:text-black"
      case "youtube":
        return "bg-red-600 text-white"
      default:
        return ""
    }
  }

  // Function to open Ayrshare profile manager
  const openProfileManager = async (profileKey: string) => {
    try {
      const data = await generateUrlMutation({ profileKey })
      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      toast.error(`Failed to generate manager URL: ${(error as Error).message}`)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and manage your social media accounts by user profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleCheckProfiles} disabled={isSyncingInProgress || isLoading}>
            {isSyncingInProgress ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync Profiles"
            )}
          </Button>
          <Dialog open={isUserProfileDialogOpen} onOpenChange={setIsUserProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <UserPlus className="h-4 w-4" />
                New Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a new user profile</DialogTitle>
                <DialogDescription>
                  Create a profile to organize your social accounts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Profile Name</Label>
                  <Input
                    id="name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserProfileDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleAddUserProfile}
                  disabled={false}
                >
                  {false ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Profile Check Results Dialog */}
      <Dialog open={isCheckingDialogOpen} onOpenChange={(open) => {
        setIsCheckingDialogOpen(open);
        if (!open && isSyncingInProgress) {
            // Consider if you need to cancel ongoing operations if dialog is closed early.
            // For now, this example doesn't implement cancellation.
            toast.info("Sync Canceled", {
              description: "Profile sync was closed before completion."
            });
            // Resetting isSyncingInProgress here might be too early if promises are still flying.
            // Better to let them finish and update state, then isSyncingInProgress is set to false in handleCheckProfiles.
        }
      }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="pb-1">
            <DialogTitle>Syncing Profiles</DialogTitle>
            <DialogDescription>
              Checking status of your social profiles
            </DialogDescription>
          </DialogHeader>

          {isCheckingDialogOpen && totalProfilesToSync > 0 && (
            <div className="my-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Progress</span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {completedChecksCount} / {totalProfilesToSync}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-200 ease-linear"
                  style={{ width: `${totalProfilesToSync > 0 ? (completedChecksCount / totalProfilesToSync) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Results in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
            {/* Active Profiles Column */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Active Profiles
              </h3>
              <div className="border rounded-md">
                <div className="space-y-0.5 p-1 max-h-[30vh] overflow-y-auto">
                  {isSyncingInProgress ? (
                    // Show all non-deleted profiles during sync
                    profileCheckResults
                      .filter(result => result.message !== "Deleted")
                      .map((result, index) => (
                        <div 
                          key={`active-${index}`} 
                          ref={el => { itemRefs.current[index] = el; }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-1.5">
                            {result.status === 'pending' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            ) : result.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium text-sm">{result.profileName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
                        </div>
                      ))
                  ) : (
                    // Show only "All Good" profiles when sync is complete
                    profileCheckResults
                      .filter(result => result.message === "All Good")
                      .map((result, index) => (
                        <div 
                          key={`active-${index}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">{result.profileName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
                        </div>
                      ))
                  )}
                  {!isSyncingInProgress && profileCheckResults.filter(r => r.message === "All Good").length === 0 && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No active profiles found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deleted Profiles Column */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-red-500" />
                Deleted Profiles
              </h3>
              <div className="border rounded-md">
                <div className="space-y-0.5 p-1 max-h-[30vh] overflow-y-auto">
                  {isSyncingInProgress ? (
                    // Show deleted profiles during sync
                    profileCheckResults
                      .filter(result => result.message === "Deleted")
                      .map((result, index) => (
                        <div 
                          key={`deleted-${index}`}
                          ref={el => { deletedItemRefs.current[index] = el; }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-1.5">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-sm">{result.profileName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
                        </div>
                      ))
                  ) : (
                    // Show only deleted profiles when sync is complete
                    profileCheckResults
                      .filter(result => result.message === "Deleted")
                      .map((result, index) => (
                        <div 
                          key={`deleted-${index}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-1.5">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-sm">{result.profileName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
                        </div>
                      ))
                  )}
                  {!isSyncingInProgress && profileCheckResults.filter(r => r.message === "Deleted").length === 0 && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No deleted profiles
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button 
              onClick={() => {
                setIsCheckingDialogOpen(false);
              }} 
              size="sm" 
              variant="secondary"
              disabled={isSyncingInProgress} // Disable close button while syncing is truly active
            >
              {isSyncingInProgress ? "Syncing..." : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading profiles...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-destructive">
          <p>Error loading profiles. Please try again later.</p>
        </div>
      ) : profiles?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No user profiles</h3>
          <p className="text-muted-foreground mt-1 mb-4 max-w-md text-sm">
            Create a user profile to organize your social accounts
          </p>
          <Button onClick={() => setIsUserProfileDialogOpen(true)}>Create User Profile</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles?.map((profile) => (
            <Card key={profile.profileName} className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleProfileExpansion(profile.profileName || '')}
                    >
                      {expandedProfiles.includes(profile.profileName) ?
                        <ChevronUp className="h-4 w-4" /> :
                        <ChevronDown className="h-4 w-4" />}
                    </Button>

                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{profile.profileName.split("|")[0]}</h3>
                      <Badge variant="outline" className="text-xs">
                        {profile.socialAccounts.length} {profile.socialAccounts.length === 1 ? 'account' : 'accounts'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7 text-xs"
                      onClick={() => openProfileManager(profile.profileKey || '')}
                      disabled={false}
                    >
                      {false ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      Link / Unlink Accounts
                    </Button>

                    <Dialog open={deletingProfileName === profile.profileName} onOpenChange={(open) => {
                      if (!open) setDeletingProfileName(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-7 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => setDeletingProfileName(profile.profileName || '')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Delete Profile</DialogTitle>
                          <DialogDescription className="pt-1.5">
                            Are you sure you want to delete the profile "{profile.profileName.split("|")[0]}"?
                          </DialogDescription>
                          {profile.socialAccounts.length > 0 && (
                            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800/50 text-xs">
                              <span className="font-medium">Warning:</span> This profile has connected social accounts.
                              You must first unlink all accounts before deleting the profile.
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs h-7"
                                  onClick={() => {
                                    openProfileManager(profile.profileKey);
                                    setDeletingProfileName(null);
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Unlink Accounts
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground">
                            This action cannot be undone. It will permanently delete the profile and all of its data.
                          </p>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteUserProfile(profile.profileName || '')}
                            disabled={profile.socialAccounts.length > 0}
                          >
                            {false ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : profile.socialAccounts.length > 0 ? (
                              "Unlink Accounts First"
                            ) : (
                              "Delete Profile"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              {expandedProfiles.includes(profile.profileName) && (
                <CardContent className="pt-0 px-4 pb-3">
                  {profile.socialAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        No accounts connected to this profile.
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => openProfileManager(profile.profileKey || '')}
                      >
                        Connect an account
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {profile.socialAccounts.map((account) => (
                        <div key={account._id} className="bg-muted/30 rounded-md p-3 flex items-center gap-3">
                          {account.userImage ? (
                            <img
                              src={account.userImage}
                              alt={account.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            getPlatformIcon(account.platform)
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-medium text-sm truncate">{account.username}</p>
                              {account.profileUrl && (
                                <a
                                  href={account.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Connected {new Date(account._creationTime).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <Badge className={`${getPlatformBadgeClass(account.platform)} text-xs px-2 py-0.5`}>
                            {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 