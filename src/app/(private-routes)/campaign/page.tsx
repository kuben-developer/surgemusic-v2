'use client';

// import { FolderManagerDialog } from "@/components/folder-manager-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  BarChart3,
  Folder,
  FolderOpen,
  Globe,
  Loader2,
  Music,
  Plus,
  Settings,
  Shapes,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const COLORS = [
  'text-blue-500',
  'text-green-500',
  'text-purple-500',
  'text-pink-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-indigo-500',
  'text-teal-500',
  'text-cyan-500',
] as const;

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// Type definitions for the API response
interface FolderData {
  folders: {
    id: Id<"folders">;
    name: string;
    createdAt: number;
    updatedAt: number;
    campaigns: Doc<"campaigns">[];
    campaignCount: number;
  }[];
  unorganizedCampaigns: (Doc<"campaigns"> & {
    id: Id<"campaigns">;
    createdAt: number;
    updatedAt: number;
  })[];
}

interface ProcessedCampaign extends Doc<"campaigns"> {
  isCompleted: boolean;
  id?: Id<"campaigns">;
  createdAt?: number;
  updatedAt?: number;
}

interface DataSummary {
  totalFolders: number;
  totalCampaigns: number;
  unorganizedCampaigns: number;
  organizedCampaigns: number;
  completedCampaigns: number;
  inProgressCampaigns: number;
  organizationRate: number;
}

export default function Campaign() {
  const router = useRouter()

  // State management for folder and campaign data
  const [selectedView, setSelectedView] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [folderManagerOpen, setFolderManagerOpen] = useState(false);

  // Fetch folder and campaign data using Convex
  const folderData = useQuery(api.campaigns.getAllWithFolders) as FolderData | undefined;
  const isLoading = folderData === undefined;
  const error = null; // Convex handles errors differently

  // Transform data and memoized data processing
  const { processedData, dataSummary } = useMemo<{
    processedData: {
      folders: FolderData["folders"];
      allCampaigns: ProcessedCampaign[];
      filteredCampaigns: ProcessedCampaign[];
      unorganizedCampaigns: FolderData["unorganizedCampaigns"];
    };
    dataSummary: DataSummary | null;
  }>(() => {
    if (!folderData) return {
      processedData: { folders: [], allCampaigns: [], filteredCampaigns: [], unorganizedCampaigns: [] },
      dataSummary: null
    };

    // Combine all campaigns from folders and unorganized campaigns
    // Use a Map to ensure uniqueness by campaign ID
    const campaignMap = new Map<Id<"campaigns">, ProcessedCampaign>();
    let duplicateCount = 0;
    
    // Add campaigns from folders
    folderData.folders.forEach(folder => {
      folder.campaigns.forEach(campaign => {
        if (campaignMap.has(campaign._id)) {
          duplicateCount++;
        }
        campaignMap.set(campaign._id, { ...campaign, isCompleted: campaign.status === 'completed' });
      });
    });
    
    // Add unorganized campaigns (won't overwrite if already exists)
    folderData.unorganizedCampaigns.forEach(campaign => {
      if (!campaignMap.has(campaign._id)) {
        campaignMap.set(campaign._id, { ...campaign, isCompleted: campaign.status === 'completed' });
      } else {
        duplicateCount++;
      }
    });
    
    // Log warning if duplicates were found
    if (duplicateCount > 0) {
      console.warn(`Found ${duplicateCount} duplicate campaign(s) in data. This may indicate a data consistency issue.`);
    }
    
    // Sort all campaigns chronologically (newest first)
    const allCampaigns = Array.from(campaignMap.values()).sort((a, b) => 
      new Date(b.createdAt || b._creationTime).getTime() - new Date(a.createdAt || a._creationTime).getTime()
    );

    // Create data summary directly from raw data
    const completedCampaigns = allCampaigns.filter(campaign => campaign.isCompleted).length;
    const summary = {
      totalFolders: folderData.folders.length,
      totalCampaigns: allCampaigns.length,
      unorganizedCampaigns: folderData.unorganizedCampaigns.length,
      organizedCampaigns: allCampaigns.length - folderData.unorganizedCampaigns.length,
      completedCampaigns,
      inProgressCampaigns: allCampaigns.length - completedCampaigns,
      organizationRate: allCampaigns.length > 0
        ? Math.round(((allCampaigns.length - folderData.unorganizedCampaigns.length) / allCampaigns.length) * 100)
        : 0,
    };

    // Filter campaigns based on selected view and search query
    let filteredCampaigns: ProcessedCampaign[] = allCampaigns;

    if (selectedView !== 'all') {
      const selectedFolder = folderData.folders.find(folder => folder.id === selectedView);
      filteredCampaigns = selectedFolder ? selectedFolder.campaigns.map(c => ({ ...c, isCompleted: c.status === 'completed' })) : [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(query) ||
        campaign.songName.toLowerCase().includes(query) ||
        campaign.artistName.toLowerCase().includes(query) ||
        campaign.genre.toLowerCase().includes(query)
      );
    }

    // Ensure filtered campaigns are also sorted chronologically (newest first)
    filteredCampaigns = filteredCampaigns.sort((a, b) => 
      new Date(b.createdAt || b._creationTime).getTime() - new Date(a.createdAt || a._creationTime).getTime()
    );

    return {
      processedData: {
        folders: folderData.folders,
        allCampaigns,
        filteredCampaigns,
        unorganizedCampaigns: folderData.unorganizedCampaigns
      },
      dataSummary: summary
    };
  }, [folderData, selectedView, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Failed to load campaigns</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Render campaign card component
  const renderCampaignCard = (campaign: ProcessedCampaign, index: number) => (
    <Card
      key={`campaign-${campaign._id}-${index}`}
      className="group relative overflow-hidden border-primary/10 bg-card/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-muted/30">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60 z-10" />
          <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-background/50 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium border border-primary/10">
                {campaign.videoCount} VIDEOS
              </div>
              <div className="bg-background/50 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium border border-primary/10">
                {campaign.genre.toUpperCase()}
              </div>
            </div>
            <h2 className="text-xl font-semibold line-clamp-1 drop-shadow-sm">
              {campaign.campaignName}
            </h2>
          </div>
          {campaign.campaignCoverImageUrl ? (
            <Image
              src={campaign.campaignCoverImageUrl}
              alt={campaign.campaignName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <Shapes className={`h-24 w-24 ${getRandomColor()}`} />
            </div>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Music className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium truncate">{campaign.songName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
              <p className="text-sm text-muted-foreground truncate">{campaign.artistName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {campaign.themes?.map((theme, index) => (
              <div
                key={index}
                className="text-[10px] px-2.5 py-1 rounded-md bg-primary/5 text-foreground border border-primary/10"
              >
                {theme}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${campaign.isCompleted ? 'bg-green-600' : 'bg-orange-400 animate-pulse'}`} />
              {campaign.isCompleted ? 'Completed' : 'In Progress'}
            </div>
            <div className="text-muted-foreground">
              {new Date(campaign.createdAt || campaign._creationTime).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="relative group w-full gap-2 bg-primary/5 hover:bg-primary/10 text-foreground border-primary/10 hover:border-primary/30 transition-colors"
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/campaign/${campaign._id}`)}
        >
          <Globe className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>View Campaign</span>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your content distribution campaigns
          </p>
          {dataSummary && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                {dataSummary.totalFolders} folders
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {dataSummary.totalCampaigns} campaigns
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Manage Folders Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFolderManagerOpen(true)}
            className="h-8 px-3 gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Manage Folders</span>
          </Button>

          <Link href="/create-campaign" className="w-full sm:w-auto">
            <Button
              className="relative group gap-2 w-full sm:w-auto px-6 py-2 h-auto bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">Create Campaign</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Folder Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2.5">
          {/* All Campaigns Button */}
          <button
            onClick={() => setSelectedView('all')}
            className={`
              flex items-center px-3.5 py-2.5 rounded-lg 
              transition-all duration-200 
              ${selectedView === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted hover:bg-muted/80 text-foreground'
              }
            `}
          >
            {selectedView === 'all' ? (
              <FolderOpen className="h-5 w-5 shrink-0" />
            ) : (
              <Folder className="h-5 w-5 shrink-0" />
            )}
            <div className="ml-2.5 flex flex-col items-start">
              <span className="font-medium text-sm leading-tight">All</span>
              <span className="text-xs text-current/70 leading-tight mt-0.5">
                {processedData.allCampaigns.length} Campaign{processedData.allCampaigns.length !== 1 ? 's' : ''}
              </span>
            </div>
          </button>

          {/* Individual Folder Buttons */}
          {processedData.folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedView(folder.id)}
              className={`
                flex items-center px-3.5 py-2.5 rounded-lg 
                transition-all duration-200 
                ${selectedView === folder.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
                }
              `}
            >
              {selectedView === folder.id ? (
                <FolderOpen className="h-5 w-5 shrink-0" />
              ) : (
                <Folder className="h-5 w-5 shrink-0" />
              )}
              <div className="ml-2.5 flex flex-col items-start">
                <span className="font-medium text-sm leading-tight truncate max-w-[120px]">{folder.name}</span>
                <span className="text-xs text-current/70 leading-tight mt-0.5">
                  {folder.campaignCount} Campaign{folder.campaignCount !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      {/* Grid View Content */}
      {processedData.filteredCampaigns.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5 py-24">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
          <div className="relative flex flex-col items-center justify-center text-center">
            <Shapes className="h-16 w-16 text-primary/40 mb-4" />
            <h2 className="text-2xl font-semibold text-foreground/80 mb-2">
              {searchQuery ? 'No campaigns found' : 'No campaigns yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first campaign to get started'
              }
            </p>
            {!searchQuery && (
              <Link href="/create-campaign">
                <Button
                  className="relative group gap-2 px-6 py-2 h-auto bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Create Campaign</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedData.filteredCampaigns.map((campaign, index) => 
            renderCampaignCard(campaign, index)
          )}
        </div>
      )}

      {/* Folder Manager Dialog */}
      {/* <FolderManagerDialog
        open={folderManagerOpen}
        onOpenChange={(open) => {
          setFolderManagerOpen(open);
          // Convex automatically syncs data when dialog closes
          if (!open) {
            // No need to manually refetch with Convex
          }
        }}
      /> */}
    </div>
  )
}
