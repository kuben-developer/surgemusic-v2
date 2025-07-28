"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimeAgo } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Heart, MessageSquare, RefreshCcw, User, Sparkles, TrendingUp, ExternalLink, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface Comment {
  text: string
  createdAt: string
  likeCount: number
  username: string
}

interface PostComment {
  campaignId: string
  postCaption: string
  tiktokUrl: string
  comments: Comment[]
  fetchedAt: string
}

interface CommentsData {
  timestamp: string
  totalPosts: number
  data: PostComment[]
}

interface CommentsSectionProps {
  campaignIds?: string[]
  className?: string
}

const ITEMS_PER_PAGE = 10
const COMMENTS_DATA_URL = "https://zessa1ux5tl2b8nb.public.blob.vercel-storage.com/comments-data.json"

export function CommentsSection({ campaignIds, className }: CommentsSectionProps) {
  const [commentsData, setCommentsData] = useState<CommentsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCommentsData()
  }, [])

  const fetchCommentsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(COMMENTS_DATA_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`)
      }
      const data: CommentsData = await response.json()
      setCommentsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePostExpansion = (postUrl: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postUrl)) {
        newSet.delete(postUrl)
      } else {
        newSet.add(postUrl)
      }
      return newSet
    })
  }

  // Filter posts based on campaign IDs and sort by most recent comment
  const filteredPosts = (commentsData?.data.filter(post =>
    !campaignIds || campaignIds.length === 0 || campaignIds.includes(post.campaignId)
  ) || []).sort((a, b) => {
    // Get the most recent comment date from each post
    const getMostRecentCommentDate = (post: PostComment) => {
      if (post.comments.length === 0) return new Date(0)
      return new Date(Math.max(...post.comments.map(c => new Date(c.createdAt).getTime())))
    }

    const aLatestComment = getMostRecentCommentDate(a)
    const bLatestComment = getMostRecentCommentDate(b)

    // Sort by most recent comment date, latest first
    return bLatestComment.getTime() - aLatestComment.getTime()
  })

  // Calculate total comments for display
  const totalComments = filteredPosts.reduce((sum, post) => sum + post.comments.length, 0)

  // Paginate posts
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  // Loading state
  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={`${className}`}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-base font-medium mb-2">Failed to Load Comments</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
            <Button variant="outline" onClick={fetchCommentsData} size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // No data state
  if (!filteredPosts.length) {
    return (
      <Card className={`${className}`}>
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20">
              <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-base font-semibold">Recent Comments</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Track engagement across your campaigns</p>
        </div>
        <div className="p-6">
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-4 mb-4">
              <Sparkles className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium mb-1">No Comments Yet</h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              {campaignIds?.length ?
                "No comments found for the selected campaigns." :
                "Comments will appear here once your content receives engagement."
              }
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-base font-semibold">Recent Comments</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Track engagement across your campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-sm text-emerald-700 dark:text-emerald-300">{totalComments}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">total</span>
            </div> */}
            {commentsData && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>Updated {formatTimeAgo(new Date(commentsData.timestamp))}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {paginatedPosts.map((post, index) => {
              const isExpanded = expandedPosts.has(post.tiktokUrl)
              // Sort comments by date (latest first) before displaying
              const sortedComments = [...post.comments].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              const displayComments = isExpanded ? sortedComments : sortedComments.slice(0, 2)

              return (
                <motion.div
                  key={`${post.tiktokUrl}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="bg-gradient-to-br from-muted/10 to-muted/5 rounded-xl p-5 hover:from-muted/20 hover:to-muted/10 transition-all border border-muted/20 hover:border-muted/30"
                >
                  <div className="mb-4">
                    <p className="text-sm font-medium line-clamp-1 mb-2">{post.postCaption}</p>
                    <div className="flex items-center gap-4">
                      <a
                        href={post.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
                      >
                        View on TikTok
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <div className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-purple-500/10">
                        <MessageCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-purple-700 dark:text-purple-300 font-medium">{post.comments.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {displayComments.map((comment, commentIndex) => (
                      <motion.div
                        key={`${comment.username}-${commentIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: commentIndex * 0.03 }}
                        className="flex gap-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">@{comment.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                            {comment.likeCount > 0 && (
                              <span className="flex items-center gap-1 text-xs ml-auto px-2 py-0.5 rounded-full bg-red-500/10">
                                <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                                <span className="text-red-600 dark:text-red-400 font-medium">{comment.likeCount}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">{comment.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {post.comments.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePostExpansion(post.tiktokUrl)}
                      className="mt-3 w-full h-8 text-xs"
                    >
                      {isExpanded ? 'Show less' : `View all ${post.comments.length} comments`}
                    </Button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              Showing {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center px-3">
                <span className="text-xs text-muted-foreground">
                  {currentPage + 1} / {totalPages}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}