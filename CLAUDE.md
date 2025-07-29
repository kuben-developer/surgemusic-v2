# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SurgeLight application built with:
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Backend**: Convex (real-time database and backend)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks with Convex real-time queries
- **File Uploads**: UploadThing
- **Analytics**: ClickHouse integration

## Common Development Commands

```bash
# Development
npm run dev          # Start development server with Turbo
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Build and start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run typecheck    # Run TypeScript type checking
npm run check        # Run both lint and typecheck

# Formatting
npm run format:check # Check code formatting with Prettier
npm run format:write # Format code with Prettier
```

## Key Architecture Patterns

### 1. Convex Integration
The app uses Convex for backend functionality instead of traditional APIs. Key patterns:

- **Queries**: Use `useQuery(api.module.method, args)` - returns `undefined` while loading
- **Mutations**: Use `useMutation(api.module.method)` - handle success/error in calling function
- **Data IDs**: Convex uses `_id` (not `id`) and `_creationTime` (not `createdAt`)
- **Types**: Import from `convex/_generated/dataModel` for `Doc<>` and `Id<>` types

### 2. File Structure
```
src/
├── app/
│   ├── (private-routes)/    # Authenticated routes
│   │   ├── campaign/         # Campaign management
│   │   ├── analytics/        # Analytics dashboard
│   │   └── create-campaign/  # Campaign creation flow
│   ├── (public-routes)/      # Public routes
│   └── api/                  # API routes (webhooks, cron)
├── components/               # Shared components
│   ├── ui/                   # shadcn/ui components
│   └── analytics/            # Analytics-specific components
└── hooks/                    # Custom React hooks
```

### 3. Authentication Flow
- Clerk handles authentication with middleware protection
- Private routes require authentication via middleware
- User data synced to Convex via webhook on signup

### 4. Campaign Video Generation Flow
1. User creates campaign with details (song, themes, video count)
2. Data sent to Make.com webhook for processing
3. Videos generated and uploaded to UploadThing
4. Webhook updates Convex with video URLs
5. Users can schedule posts to social platforms via Ayrshare

### 5. State Management Patterns
- Use Convex real-time queries for data fetching
- Loading state: check if query result is `undefined`
- Error handling: wrap mutations in try-catch blocks
- Toast notifications: use `sonner` (not shadcn toast)

### 6. Common Hooks
- `useCampaignData`: Fetch campaign with videos
- `useVideoDownload`: Download videos as ZIP
- `useVideoFiltering`: Filter and sort videos

## Important Migration Context

The codebase is migrating from TRPC to Convex. The `/campaign` folder serves as the reference implementation. When working on unmigrated code:
- Replace TRPC imports with Convex equivalents
- Update query/mutation patterns
- Fix property mappings (id → _id)
- Remove all TypeScript `any` types

## Environment Variables

Key environment variables are validated in `src/env.js`:
- Convex deployment URL and keys
- Clerk authentication keys
- UploadThing keys
- Stripe keys
- Ayrshare API key

## Testing Strategy

Currently no test framework is configured. When implementing tests:
- Check for test scripts in package.json first
- Look for existing test patterns in the codebase
- Ask user for preferred testing approach

## Code Style Guidelines

- TypeScript strict mode is enabled - no `any` types allowed
- Use absolute imports with `@/` prefix
- Follow existing component patterns in `/campaign` folder
- Extract reusable logic into custom hooks
- Keep components focused and modular