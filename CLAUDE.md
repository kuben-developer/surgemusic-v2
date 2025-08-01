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
├── app/                      # Next.js App Router (routing only)
│   ├── (dashboard)/          # Authenticated routes
│   ├── (public)/             # Public routes
│   └── api/                  # API routes (webhooks, cron)
├── features/                 # Feature-based modules (business logic)
│   ├── campaigns/            # Campaign feature module
│   ├── analytics/            # Analytics feature module
│   └── reports/              # Reports feature module
├── components/               # Shared components
│   ├── ui/                   # shadcn/ui components
│   └── common/               # Common components
└── hooks/                    # Global custom React hooks
```

### 3. Feature-Based Architecture

This project uses a **feature-based (vertical slice) architecture** where code is organized by business features rather than technical layers. Each feature is self-contained with its own components, hooks, types, and utilities.

#### Why Feature-Based Architecture?

1. **Better Cohesion**: Related code stays together
2. **Clear Boundaries**: Easy to understand what belongs to each feature
3. **Team Scalability**: Different teams can own different features
4. **Easier Navigation**: Everything for a feature is in one place
5. **Code Splitting**: Features can be lazy-loaded independently

#### Feature Folder Structure Pattern

Every feature in `src/features/` should follow this structure:

```
features/
└── [feature-name]/           # e.g., campaigns, analytics, reports
    ├── index.ts              # Public API - barrel exports
    ├── [FeatureName]Page.tsx # Main page component (if applicable)
    ├── components/           # Feature-specific components
    ├── hooks/                # Feature-specific hooks
    ├── types/                # Feature-specific TypeScript types
    ├── utils/                # Feature-specific utilities
    ├── constants/            # Feature-specific constants
    └── [sub-features]/       # Complex features can have sub-features
```

#### Sub-Feature Organization

When a feature becomes large and complex (like campaigns with list, detail, create, videos, analytics), split it into sub-features:

```
features/
└── campaigns/                # Main feature
    ├── list/                 # Sub-feature: Campaign list
    │   ├── index.ts
    │   ├── CampaignListPage.tsx
    │   ├── components/
    │   └── hooks/
    ├── detail/               # Sub-feature: Campaign detail
    ├── create/               # Sub-feature: Create campaign
    ├── videos/               # Sub-feature: Video management
    ├── analytics/            # Sub-feature: Campaign analytics
    └── shared/               # Shared across sub-features
        ├── components/
        ├── hooks/
        ├── types/
        └── utils/
```

#### Complete Example: Campaign Feature Structure

Here's the complete structure for the campaigns feature as a reference:

```
features/campaigns/
├── list/
│   ├── index.ts                    # Exports: CampaignListPage, etc.
│   ├── CampaignListPage.tsx       # Main list page
│   ├── components/
│   │   └── CampaignCard.tsx       # List-specific component
│   └── hooks/
│       └── useCampaignList.ts     # List-specific hook
│
├── detail/
│   ├── index.ts
│   ├── CampaignDetailPage.tsx     # Main detail page
│   ├── components/
│   │   └── CampaignClient.tsx     # Orchestrates videos sub-feature
│   └── hooks/
│       ├── useCampaignData.ts     # Fetch campaign data
│       └── useCampaignProgress.ts # Track campaign progress
│
├── create/
│   ├── index.ts
│   ├── CampaignCreatePage.tsx     # Multi-step creation form
│   ├── components/
│   │   ├── CampaignInfo.tsx       # Step 1: Basic info
│   │   ├── ContentThemes.tsx      # Step 2: Themes
│   │   ├── GenreSelection.tsx     # Step 3: Genre
│   │   ├── SongDetails.tsx        # Step 4: Song details
│   │   ├── SongAudio.tsx          # Step 5: Audio upload
│   │   ├── VideoAssets.tsx        # Step 6: Video assets
│   │   ├── ImageAssets.tsx        # Step 7: Image assets
│   │   └── VideoCount.tsx         # Step 8: Video count
│   └── types/
│       └── create-campaign.types.ts
│
├── videos/                         # NO app route - used by detail sub-feature
│   ├── index.ts
│   ├── components/
│   │   ├── VideoTableView.tsx     # Table view of videos
│   │   ├── VideoGrid.tsx          # Grid view of videos
│   │   └── ViewToggle.tsx         # Toggle between views
│   ├── hooks/
│   │   ├── useVideoFiltering.ts   # Filter/sort videos
│   │   └── useVideoDownload.ts    # Download functionality
│   ├── dialogs/
│   │   ├── ScheduleDialog.tsx     # Schedule video dialog
│   │   └── UnscheduleDialog.tsx   # Unschedule video dialog
│   └── types/
│       └── video.types.ts
│
├── analytics/
│   ├── index.ts
│   ├── CampaignAnalyticsPage.tsx
│   ├── components/
│   │   └── AnalyticsClient.tsx
│   └── hooks/
│       └── useAnalyticsData.ts
│
├── shared/
│   ├── components/
│   │   ├── CampaignHeader.tsx     # Used across sub-features
│   │   └── CampaignProgress.tsx   # Used across sub-features
│   ├── hooks/
│   │   └── useCampaignShared.ts
│   ├── types/
│   │   └── campaign.types.ts      # Common campaign types
│   └── utils/
│       └── campaign.utils.ts
│
└── index.ts                        # Main feature exports
```

#### Guidelines for Creating New Features

When creating a new feature or sub-feature, follow these steps:

1. **Determine if it's a new feature or sub-feature**
   - New feature: Represents a major business domain (e.g., reports, social-accounts)
   - Sub-feature: Part of existing feature but complex enough for its own folder

2. **Understand sub-feature types**
   - **Page sub-features**: Have their own route in the app folder (e.g., `list`, `create`, `detail`)
   - **Component sub-features**: Used by other sub-features, no dedicated route (e.g., `videos` used by `detail`)
   
   Example routing:
   ```
   app/(dashboard)/campaign/page.tsx           → imports from features/campaigns/list
   app/(dashboard)/campaign/create/page.tsx    → imports from features/campaigns/create
   app/(dashboard)/campaign/[id]/page.tsx      → imports from features/campaigns/detail
   
   # Note: videos sub-feature has NO route - it's used internally by detail
   ```

3. **Create the folder structure**
   ```bash
   features/
   └── [new-feature]/
       ├── index.ts
       ├── [FeatureName]Page.tsx  # Only if it has a route in app folder
       ├── components/
       ├── hooks/
       └── types/
   ```

4. **Keep the App Router thin**
   - App router pages should only import and export from features
   - Not all sub-features need a corresponding app route
   - Example: `app/(dashboard)/reports/page.tsx`:
   ```typescript
   import { ReportsPage } from '@/features/reports';
   export default ReportsPage;
   ```

5. **URL Route Patterns - Resource Hierarchy**
   
   **IMPORTANT**: Always follow RESTful resource hierarchy when designing routes. Sub-resources should come AFTER the parent resource ID.

   **Correct Pattern**: `[resource]/[id]/[sub-resource]`
   ```
   ✅ campaign/[id]/analytics     # Analytics for a specific campaign
   ✅ campaign/[id]/settings      # Settings for a specific campaign
   ✅ campaign/[id]/collaborators # Collaborators for a specific campaign
   ✅ report/[id]/edit            # Edit page for a specific report
   ✅ user/[id]/profile          # Profile for a specific user
   ✅ project/[id]/tasks          # Tasks for a specific project
   ```

   **Incorrect Pattern**: `[resource]/[sub-resource]/[id]`
   ```
   ❌ campaign/analytics/[id]     # Suggests analytics is separate from campaign
   ❌ campaign/settings/[id]      # Breaks the natural hierarchy
   ❌ report/edit/[id]            # Makes edit seem like a separate section
   ❌ user/profile/[id]           # Implies profile is a separate section
   ```

   **Why This Pattern?**
   - **Natural hierarchy**: The URL mirrors the data relationship (analytics belongs to a campaign)
   - **RESTful design**: Follows REST principles where sub-resources are nested under parent resources
   - **User mental model**: Users navigate from parent to child (Campaign → Analytics)
   - **Breadcrumb clarity**: `Campaigns > Campaign Name > Analytics` is intuitive
   - **Consistency**: All sub-resources follow the same predictable pattern
   - **Better UX**: Users understand they're viewing a specific campaign's analytics, not a general analytics section

   **Route Examples in App Directory**:
   ```
   app/(dashboard)/
   ├── campaign/
   │   ├── page.tsx                    # List all campaigns
   │   ├── create/
   │   │   └── page.tsx               # Create new campaign
   │   └── [id]/
   │       ├── page.tsx               # Campaign detail
   │       ├── analytics/
   │       │   └── page.tsx           # Campaign analytics
   │       ├── settings/
   │       │   └── page.tsx           # Campaign settings
   │       └── videos/
   │           └── page.tsx           # Campaign videos (if needed)
   ├── report/
   │   ├── page.tsx                   # List all reports
   │   ├── create/
   │   │   └── page.tsx              # Create new report
   │   └── [id]/
   │       ├── page.tsx              # Report detail
   │       └── edit/
   │           └── page.tsx          # Edit report
   └── user/
       └── [id]/
           ├── page.tsx              # User profile
           ├── settings/
           │   └── page.tsx          # User settings
           └── activity/
               └── page.tsx          # User activity
   ```

   **Special Cases**:
   - **Creation routes**: Use `/[resource]/create` (e.g., `/campaign/create`)
   - **Comparison/Analytics across resources**: Use `/[resource]/analytics` without ID
   - **Global search**: Use `/[resource]/search` for searching within that resource type
   - **Bulk operations**: Use `/[resource]/bulk-[action]` (e.g., `/campaign/bulk-delete`)

   **Real-world Examples Following This Pattern**:
   - GitHub: `github.com/[owner]/[repo]/settings`, `github.com/[owner]/[repo]/insights`
   - Stripe: `dashboard.stripe.com/customers/[id]/subscriptions`
   - Linear: `linear.app/[team]/issue/[id]/activity`

6. **Use barrel exports (index.ts)**
   ```typescript
   // features/reports/index.ts
   export { ReportsPage } from './ReportsPage';
   export { useReports } from './hooks/useReports';
   export type { Report } from './types/report.types';
   ```

7. **Shared code placement**
   - Within a feature: Use the `shared/` folder
   - Across features: Use `src/components/common/` or `src/hooks/`
   - UI components: Always in `src/components/ui/`

#### Import Patterns

1. **Within a sub-feature**: Use relative imports
   ```typescript
   import { VideoCard } from './components/VideoCard';
   ```

2. **Across sub-features**: Use feature imports
   ```typescript
   import { useVideoDownload } from '@/features/campaigns/videos';
   ```

3. **From shared within feature**: Use relative imports
   ```typescript
   import { CampaignHeader } from '../shared/components/CampaignHeader';
   ```

4. **External features**: Use absolute imports
   ```typescript
   import { Button } from '@/components/ui/button';
   ```

#### How Sub-features Interact

Sub-features can be used by other sub-features within the same feature. Example from campaigns:

```typescript
// In features/campaigns/detail/components/CampaignClient.tsx
import { VideoTableView, VideoGrid, useVideoFiltering } from '@/features/campaigns/videos';
import { ScheduleDialog, UnscheduleDialog } from '@/features/campaigns/videos';

// The detail page uses the videos sub-feature components
export function CampaignClient() {
  const { filteredVideos, statusFilter } = useVideoFiltering(videos);
  
  return (
    <>
      {viewMode === 'table' ? 
        <VideoTableView videos={filteredVideos} /> : 
        <VideoGrid videos={filteredVideos} />
      }
      <ScheduleDialog />
      <UnscheduleDialog />
    </>
  );
}
```

**Key points:**
- The `videos` sub-feature doesn't have its own page/route
- It's a collection of reusable components and hooks
- Other sub-features (like `detail`) import and use these components
- This promotes code reuse and single responsibility

#### When to Create Sub-features

Create a sub-feature when:
- The functionality is complex enough to have multiple components and hooks
- It represents a distinct user workflow or business capability
- It could potentially be reused in other contexts
- The feature folder is getting too large (>10-15 files)

Examples of good sub-features:
- `videos/` - Video management is complex with viewing, filtering, downloading, scheduling
- `create/` - Multi-step form with many components
- `analytics/` - Separate concern with its own data and visualizations

### 4. Hooks vs Utilities - IMPORTANT Distinction

**Critical**: The `hooks/` folder should ONLY contain React hooks. Many developers mistakenly place utility functions in hooks folders because they have names starting with "use". This is incorrect and should be avoided.

#### What belongs in `hooks/` folders:
- **React Hooks**: Functions that use React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, etc.)
- **Custom Hooks**: Functions that compose other hooks and follow React's rules of hooks
- **Convex Hooks**: Functions that use Convex hooks (`useQuery`, `useMutation`)

Examples of correct hook files:
```typescript
// ✅ Correct: Uses React hooks
export function useVideoFiltering(videos: Video[]) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => 
    videos.filter(v => v.name.includes(filter)), 
    [videos, filter]
  );
  return { filtered, setFilter };
}

// ✅ Correct: Uses Convex hooks
export function useCampaignData(id: string) {
  const campaign = useQuery(api.campaigns.get, { id });
  const videos = useQuery(api.videos.list, { campaignId: id });
  return { campaign, videos };
}
```

#### What belongs in `utils/` folders:
- **Utility Functions**: Pure functions that perform calculations or transformations
- **Helper Functions**: Functions that don't use React hooks
- **Generators**: Iterator functions and generators
- **Data Transformers**: Functions that format or transform data

Examples of files that should be in utils:
```typescript
// ❌ WRONG: hooks/useScheduleIterators.ts
// ✅ CORRECT: utils/schedule-iterators.utils.ts
export function createCyclicIterator<T>(items: T[]) {
  return (function* () {
    let index = 0;
    while (true) {
      yield items[index % items.length];
      index++;
    }
  })();
}

// ❌ WRONG: hooks/useScheduleTracker.ts  
// ✅ CORRECT: utils/schedule-tracker.utils.ts
export function createScheduledTracker() {
  return {
    tiktok: new Set<string>(),
    instagram: new Set<string>(),
    youtube: new Set<string>(),
  };
}

// ❌ WRONG: hooks/useFormatDate.ts
// ✅ CORRECT: utils/date.utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}
```

#### Naming Conventions:
- **Hooks**: Must start with `use` and follow camelCase (e.g., `useVideoDownload`, `useCampaignForm`)
- **Utils**: Should describe what they do, with `.utils.ts` suffix (e.g., `date.utils.ts`, `validation.utils.ts`)

#### Quick Decision Guide:
Ask yourself these questions:
1. Does this function use `useState`, `useEffect`, or other React hooks? → Put in `hooks/`
2. Does this function need to follow React's rules of hooks? → Put in `hooks/`
3. Is this a pure function that just transforms data? → Put in `utils/`
4. Could this function be used outside of React components? → Put in `utils/`

Remember: Just because a function name starts with "use" doesn't make it a React hook!

### 5. Authentication Flow
- Clerk handles authentication with middleware protection
- Private routes require authentication via middleware
- User data synced to Convex via webhook on signup

### 6. Campaign Video Generation Flow
1. User creates campaign with details (song, themes, video count)
2. Data sent to Make.com webhook for processing
3. Videos generated and uploaded to UploadThing
4. Webhook updates Convex with video URLs
5. Users can schedule posts to social platforms via Ayrshare

### 7. State Management Patterns
- Use Convex real-time queries for data fetching
- Loading state: check if query result is `undefined`
- Error handling: wrap mutations in try-catch blocks
- Toast notifications: use `sonner` (not shadcn toast)

### 8. Common Hooks and Their Locations
- `useCampaignData`: Fetch campaign with videos - Located in `features/campaigns/detail/hooks/`
- `useVideoDownload`: Download videos as ZIP - Located in `features/campaigns/videos/hooks/`
- `useVideoFiltering`: Filter and sort videos - Located in `features/campaigns/videos/hooks/`

## Documentation Resources

When working with the technologies in this project, use the Context7 MCP server to access the latest documentation:

- **Convex**: `mcp__context7__search` with `search_name: "convex_dev"` (https://context7.com/context7/convex_dev)
- **Next.js**: `mcp__context7__search` with `search_name: "nextjs"` (https://context7.com/context7/nextjs)
- **shadcn/ui**: `mcp__context7__search` with `search_name: "ui_shadcn"` (https://context7.com/context7/ui_shadcn)
- **Recharts**: `mcp__context7__search` with `search_name: "recharts"` (https://context7.com/recharts/recharts)

Example usage:
```
Use mcp__context7__search with search_name: "convex_dev" and query: "useQuery hook"
```

This ensures you're always working with the most up-to-date documentation and best practices for each technology.

## Important Migration Context

The codebase is migrating from TRPC to Convex. The campaigns feature serves as the reference implementation. When working on unmigrated code:
- Replace TRPC imports with Convex equivalents
- Update query/mutation patterns
- Fix property mappings (id → _id)
- Remove all TypeScript `any` types
- Organize new features following the feature-based architecture pattern described above

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
- Follow the feature-based architecture pattern for organizing code
- Extract reusable logic into custom hooks
- Keep components focused and modular
- Use barrel exports (index.ts) for clean public APIs
- Place shared code in appropriate shared folders based on scope

## Client Components and "use client" Directive

### When to Use "use client"

**IMPORTANT**: We prioritize client-side rendering by default in this application for better interactivity and user experience. Always add the "use client" directive at the top of files (before any imports) when:

1. **Using React Hooks**: Any file that uses `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`, `useRef`, etc.
2. **Event Handlers**: Components with user interactions like `onClick`, `onChange`, `onSubmit`, etc.
3. **Browser APIs**: Code that uses `window`, `document`, `localStorage`, `navigator`, etc.
4. **Interactive Components**: Any component that responds to user input or has dynamic behavior
5. **Animation Libraries**: Components using framer-motion or other client-side animation libraries
6. **Third-party Client Libraries**: Components using libraries that require client-side execution

### When NOT to Use "use client"

Only omit the directive for:
- Pure utility functions (`.utils.ts` files)
- Type definitions (`.types.ts` files)
- Constants files (`.constants.ts` files)
- Barrel exports (`index.ts` files)
- Server-only components that explicitly need server-side rendering

### Examples

```typescript
// ✅ Good - Interactive component with event handlers
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InteractiveCard() {
  const [count, setCount] = useState(0);
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </Button>
  );
}
```

```typescript
// ✅ Good - Hook file using React hooks
"use client";

import { useState, useEffect } from "react";

export function useDataFetch() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch logic
  }, []);
  
  return data;
}
```

```typescript
// ❌ Bad - Utility file (no "use client" needed)
// No "use client" here!

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}
```

### Best Practices

1. **Default to Client Components**: When in doubt, add "use client". It's better to have unnecessary client components than missing directives that cause errors.

2. **Hook Files**: Even though hook files are imported by client components, add "use client" to hook files that use React hooks for clarity and consistency.

3. **Component Libraries**: All components in our UI library should have "use client" since they're interactive by nature.

4. **Performance Consideration**: While we prioritize client-side rendering, identify truly static content that can benefit from server-side rendering (like static marketing pages).

5. **Migration Path**: When creating new features or refactoring existing ones, ensure all interactive components have the "use client" directive.

## Component and File Size Best Practices

Based on our comprehensive refactoring, follow these guidelines to maintain code quality:

### 1. File Size Guidelines
- **Target**: Keep all files between 150-300 lines
- **Maximum**: No file should exceed 300 lines
- **Ideal**: Aim for 150-200 lines for optimal maintainability
- **Minimum**: Very small files (< 50 lines) are fine for single-purpose utilities or components

### 2. Component Decomposition Patterns

When a component exceeds 200 lines, consider these refactoring patterns:

#### Pattern 1: Extract Sub-components
```typescript
// Before: Large component with multiple sections
export function VideoSection({ ... }) {
  // 300+ lines with header, pagination, grid, etc.
}

// After: Decomposed into focused components
export function VideoSection({ ... }) {
  return (
    <>
      <VideoSectionHeader {...headerProps} />
      <VideoPagination {...paginationProps} />
      <VideoSectionContent {...contentProps} />
    </>
  );
}
```

#### Pattern 2: Extract Custom Hooks
```typescript
// Before: Component with complex logic
export function ScheduleDialog() {
  // Complex state management
  // API calls
  // Validation logic
  // UI rendering
}

// After: Logic extracted to hooks
export function ScheduleDialog() {
  const { state, actions } = useScheduleState();
  const { calculate } = useScheduleCalculation();
  const { submit, progress } = useScheduleSubmission();
  
  // Clean UI rendering only
}
```

#### Pattern 3: Extract Utility Functions
```typescript
// Before: Component with inline calculations
export function AnalyticsContent() {
  // Complex data transformations inline
  // Metric calculations in component
}

// After: Utilities extracted
// utils/analytics.utils.ts
export const transformAnalyticsData = (data) => { ... };
export const calculateMetrics = (data) => { ... };

// Component focuses on presentation
export function AnalyticsContent() {
  const transformed = transformAnalyticsData(data);
  const metrics = calculateMetrics(transformed);
}
```

### 3. Custom Hook Guidelines

Create custom hooks when:
- Logic is used in multiple components
- Component has complex state management
- You need to separate data fetching from UI
- Business logic can be tested independently

#### Hook Composition Pattern
```typescript
// Compose smaller hooks into larger ones
export function useCampaignForm() {
  const state = useCampaignFormState();
  const validation = useCampaignFormValidation(state);
  const navigation = useCampaignFormNavigation(state);
  const submission = useCampaignFormSubmission(state);
  
  return {
    ...state,
    ...validation,
    ...navigation,
    ...submission
  };
}
```

### 4. Component Organization Best Practices

#### Single Responsibility Principle
Each component should have ONE clear purpose:
- ❌ `ProfileCard` - Handles display, editing, deletion, and API calls
- ✅ `ProfileCard` - Display only
- ✅ `ProfileActions` - Action buttons
- ✅ `ProfileHeader` - Header section
- ✅ `useProfileActions` - API calls and business logic

#### Props Interface Pattern
Always define clear prop interfaces:
```typescript
interface VideoGridItemProps {
  video: Doc<"generatedVideos">;
  isDownloading: boolean;
  onDownload: (url: string, name: string, id: string) => void;
}
```

### 5. Folder Structure for Refactored Features

When refactoring a large component, organize files like this:
```
components/
├── VideoSection/
│   ├── index.ts                    # Barrel export
│   ├── VideoSection.tsx            # Main orchestrator (< 150 lines)
│   ├── VideoSectionHeader.tsx      # Header component
│   ├── VideoSectionContent.tsx     # Content area
│   ├── VideoPagination.tsx         # Pagination logic
│   └── VideoGridItem.tsx           # Individual item
└── hooks/
    ├── useVideoSection.ts          # Main hook
    ├── useVideoPagination.ts       # Pagination logic
    └── useVideoFiltering.ts        # Filtering logic
```

### 6. Type Safety Best Practices

#### Avoid `any` at all costs
```typescript
// ❌ Bad
const handleData = (data: any) => { ... };

// ✅ Good
interface DataResponse {
  items: Array<{ id: string; name: string }>;
  total: number;
}
const handleData = (data: DataResponse) => { ... };
```

#### Create specific types for component props
```typescript
// ❌ Bad: Inline types
export function Component({ 
  data, 
  onSave 
}: { 
  data: any; 
  onSave: Function;
}) { ... }

// ✅ Good: Named interfaces
interface ComponentProps {
  data: CampaignData;
  onSave: (campaign: CampaignData) => Promise<void>;
}
export function Component({ data, onSave }: ComponentProps) { ... }
```

### 7. Performance Optimization Patterns

#### Memoization for expensive operations
```typescript
const expensiveCalculation = useMemo(() => {
  return calculateComplexMetrics(data);
}, [data]);
```

#### Callback optimization
```typescript
const handleClick = useCallback((id: string) => {
  // Handle click
}, [dependency]);
```

### 8. Error Handling Standards

Always implement comprehensive error handling:
```typescript
export function useDataFetch() {
  const [error, setError] = useState<Error | null>(null);
  
  try {
    // API call
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Unknown error'));
    toast.error('Failed to fetch data');
  }
  
  return { data, error, isLoading };
}
```

### 9. Constants and Magic Numbers

Extract all magic numbers and repeated strings:
```typescript
// ❌ Bad
if (items.length > 10) { ... }
const isValid = status === 'active' || status === 'pending';

// ✅ Good
// constants/pagination.ts
export const ITEMS_PER_PAGE = 10;

// constants/status.ts
export const ACTIVE_STATUSES = ['active', 'pending'] as const;

// Usage
if (items.length > ITEMS_PER_PAGE) { ... }
const isValid = ACTIVE_STATUSES.includes(status);
```

### 10. Barrel Exports Best Practices

Organize exports for clean public APIs:
```typescript
// features/reports/index.ts
// Components
export { ReportsPage } from './ReportsPage';
export { ReportsList } from './components/ReportsList';

// Hooks
export { useReports } from './hooks/useReports';
export { useReportActions } from './hooks/useReportActions';

// Types
export type { Report, ReportStatus } from './types/report.types';

// Utils (only if needed externally)
export { formatReportDate } from './utils/report.utils';

// Constants (only if needed externally)
export { REPORT_STATUSES } from './constants/report.constants';
```

### Code Review Checklist

When reviewing code or creating new features, ensure:
- [ ] No files exceed 300 lines
- [ ] Components follow single responsibility principle
- [ ] Complex logic is extracted to custom hooks
- [ ] No `any` types are used
- [ ] Props have proper TypeScript interfaces
- [ ] Constants are extracted and named
- [ ] Error handling is comprehensive
- [ ] Barrel exports are organized
- [ ] Performance optimizations are applied where needed
- [ ] Folder structure follows feature-based architecture