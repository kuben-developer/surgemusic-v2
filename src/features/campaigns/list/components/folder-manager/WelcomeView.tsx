"use client"

import { Button } from "@/components/ui/button";
import { FolderOpen, Plus } from "lucide-react";

interface WelcomeViewProps {
  onCreateFolder: () => void;
}

export function WelcomeView({ onCreateFolder }: WelcomeViewProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <FolderOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Select a folder to manage</h3>
        <p className="text-muted-foreground mb-6">
          Choose a folder from the sidebar to view and manage its campaigns, or create a new folder to get started.
        </p>
        <Button onClick={onCreateFolder} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Folder
        </Button>
      </div>
    </div>
  );
}