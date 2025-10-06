"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useAction } from "convex/react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import { PageLoader } from "@/components/loaders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"

export function OAuthCallbackPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  const syncAccounts = useAction(api.app.late.syncAccountsAfterOAuth)

  useEffect(() => {
    const handleCallback = async () => {
      // Get convexProfileId from path parameter and clean it
      // Clerk sometimes appends session tokens like: id-ct_xxx
      const rawProfileId = params.convexProfileId as string
      const convexProfileId = rawProfileId.split('-ct_')[0] // Strip Clerk token if present

      // Get Late API response parameters from query string
      const lateProfileId = searchParams.get("profileId") // Late's profile ID
      const connected = searchParams.get("connected")
      const username = searchParams.get("username")
      const error = searchParams.get("error")
      const platform = searchParams.get("platform")

      // Handle error case
      if (error) {
        setStatus("error")
        setMessage(`Failed to connect ${platform || "account"}: ${error}`)
        toast.error(`Failed to connect ${platform || "account"}`)
        return
      }

      // Validate success parameters
      if (!convexProfileId || !connected || !username) {
        setStatus("error")
        setMessage("Invalid callback parameters. Please try connecting again.")
        toast.error("Invalid callback parameters")
        return
      }

      try {
        // Sync accounts from Late API using our Convex profile ID
        const result = await syncAccounts({
          profileId: convexProfileId as Id<"lateProfiles">,
        })

        if (result.success) {
          setStatus("success")
          setMessage(`Successfully connected ${connected} account (@${username})`)
          toast.success(`Connected ${connected} account!`)

          // Redirect back to social accounts page after 2 seconds
          setTimeout(() => {
            router.push("/social-accounts-late")
          }, 2000)
        } else {
          throw new Error("Failed to sync accounts")
        }
      } catch (err) {
        setStatus("error")
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
        setMessage(`Failed to sync account data: ${errorMessage}`)
        toast.error("Failed to sync account data")
      }
    }

    void handleCallback()
  }, [params, searchParams, syncAccounts, router])

  if (status === "loading") {
    return <PageLoader text="Connecting your account..." minHeight="60vh" />
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {status === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <CardTitle>
                {status === "success" ? "Connection Successful!" : "Connection Failed"}
              </CardTitle>
              <CardDescription>
                {status === "success"
                  ? "Your social account has been connected successfully."
                  : "There was an error connecting your social account."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          {status === "success" ? (
            <p className="text-xs text-muted-foreground">
              Redirecting back to social accounts page...
            </p>
          ) : (
            <Button onClick={() => router.push("/social-accounts-late")}>
              Back to Social Accounts
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
