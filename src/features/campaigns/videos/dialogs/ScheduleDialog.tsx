"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { StepIndicator } from "../components/StepIndicator"
import { ProfilesStep } from "../components/ProfilesStep"
import { DateStep } from "../components/DateStep"
import { TimeStep } from "../components/TimeStep"
import { ReviewStep } from "../components/ReviewStep"
import { ProgressModal } from "../components/ProgressModal"
import { useProfileSelection } from "../hooks/useProfileSelection"
import { useScheduleLogic } from "../hooks/useScheduleLogic"
import type { Step, SelectedVideo } from "../types/schedule.types"

interface ScheduleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedVideosCount: number
  selectedVideos: SelectedVideo[]
}

export function ScheduleDialog({ isOpen, onOpenChange, selectedVideosCount, selectedVideos }: ScheduleDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("profiles")
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())

  // Fetch profiles from the API
  const profiles = useQuery(api.ayrshare.getProfiles)
  const isLoadingProfiles = profiles === undefined

  // Custom hooks for managing profile selection and scheduling logic
  const profileSelection = useProfileSelection({ profiles })
  const scheduleLogic = useScheduleLogic({
    profilePlatforms: profileSelection.profilePlatforms,
    selectedTimeSlots,
    startDate,
    selectedVideos,
    profiles,
    onScheduleComplete: () => onOpenChange(false)
  })

  // Toggle time slot selection with a limit of 3
  const toggleTimeSlot = (slotId: string) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId)
      } else {
        // Enforce max 3 posts per day
        if (prev.length >= 3) {
          return prev
        }
        return [...prev, slotId]
      }
    })
  }

  // Check if current step is valid to proceed
  const isStepValid = () => {
    switch (currentStep) {
      case "profiles":
        return profileSelection.getSelectedProfiles().length > 0
      case "date":
        return true // Date is always valid as we have a default
      case "time":
        return selectedTimeSlots.length > 0
      default:
        return true
    }
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === "profiles") setCurrentStep("date")
    else if (currentStep === "date") setCurrentStep("time")
    else if (currentStep === "time") {
      setCurrentStep("review")
      scheduleLogic.generateSchedules()
    }
  }

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep === "date") setCurrentStep("profiles")
    else if (currentStep === "time") setCurrentStep("date")
    else if (currentStep === "review") setCurrentStep("time")
  }

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "profiles":
        return (
          <ProfilesStep
            profiles={profiles}
            isLoadingProfiles={isLoadingProfiles}
            profilePlatforms={profileSelection.profilePlatforms}
            lastSelectedProfileIndex={profileSelection.lastSelectedProfileIndex}
            onToggleProfilePlatform={profileSelection.toggleProfilePlatform}
            onHandleProfileClick={profileSelection.handleProfileClick}
            onSelectAllForPlatform={profileSelection.selectAllForPlatform}
            onUnselectAllForPlatform={profileSelection.unselectAllForPlatform}
            getSelectedProfiles={profileSelection.getSelectedProfiles}
            isAnyProfileSelectedForPlatform={profileSelection.isAnyProfileSelectedForPlatform}
            areAllProfilesSelectedForPlatform={profileSelection.areAllProfilesSelectedForPlatform}
          />
        )

      case "date":
        return (
          <DateStep
            startDate={startDate}
            onStartDateChange={(date) => date && setStartDate(date)}
          />
        )

      case "time":
        return (
          <TimeStep
            selectedTimeSlots={selectedTimeSlots}
            onToggleTimeSlot={toggleTimeSlot}
          />
        )

      case "review":
        return (
          <ReviewStep
            selectedVideosCount={selectedVideosCount}
            selectedTimeSlots={selectedTimeSlots}
            startDate={startDate}
            endDate={scheduleLogic.endDate}
            profiles={profiles}
            profilePlatforms={profileSelection.profilePlatforms}
            getSelectedProfiles={profileSelection.getSelectedProfiles}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Schedule {selectedVideosCount} posts</DialogTitle>
            <DialogDescription>
              Configure your posting schedule and preferences
            </DialogDescription>
          </DialogHeader>

          <StepIndicator currentStep={currentStep} />
          {renderStepContent()}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={currentStep === "profiles" ? () => onOpenChange(false) : goToPrevStep}
              className="gap-2"
              disabled={scheduleLogic.isScheduling}
            >
              {currentStep === "profiles" ? (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </>
              )}
            </Button>

            {currentStep === "review" ? (
              <Button
                onClick={scheduleLogic.batchSchedule}
                disabled={!isStepValid() || scheduleLogic.isScheduling}
                className="gap-2"
              >
                {scheduleLogic.isScheduling ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Schedule {selectedVideosCount} posts
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!isStepValid() || scheduleLogic.isScheduling}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Separate progress modal */}
      <ProgressModal
        isOpen={scheduleLogic.showProgressModal}
        onOpenChange={(open) => {
          // Only allow closing if not in progress
          if (!scheduleLogic.schedulingProgress.inProgress) {
            scheduleLogic.setShowProgressModal(open)
          }
        }}
        progress={scheduleLogic.schedulingProgress}
      />
    </>
  )
} 