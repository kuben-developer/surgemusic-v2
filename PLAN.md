# Migration Plan: TRPC to Convex & Code Quality Improvements

## Overview
This plan outlines the systematic migration of all remaining folders in `surgelight/src/app/(private-routes)` and `surgelight/src/app/(public-routes)` from TRPC to Convex implementation, along with TypeScript improvements and code refactoring.

## Objectives
1. **Complete TRPC to Convex Migration**: Convert all API calls from TRPC patterns to Convex patterns
2. **Remove All 'any' Types**: Ensure full TypeScript type safety
3. **Refactor Code**: Make code more modular, cleaner, and maintainable
4. **Fix All shadcn/ui Errors**: Update any deprecated shadcn components and fix related issues

## Migration Patterns to Follow

### 1. Import Changes
```typescript
// OLD (TRPC)
import { api } from "@/trpc/react"

// NEW (Convex)
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../path/to/convex/_generated/api"
import type { Id, Doc } from "../path/to/convex/_generated/dataModel"
```

### 2. Query Pattern Changes
```typescript
// OLD (TRPC)
const { data, isLoading, error } = api.module.method.useQuery({ param })

// NEW (Convex)
const data = useQuery(api.module.method, { param })
const isLoading = data === undefined
```

### 3. Mutation Pattern Changes
```typescript
// OLD (TRPC)
const { mutate, isLoading } = api.module.method.useMutation({
  onSuccess: () => { /* ... */ },
  onError: () => { /* ... */ }
})

// NEW (Convex)
const mutate = useMutation(api.module.method)
// Handle success/error in the calling function
```

### 4. Data Structure Changes
```typescript
// Common property mappings:
// TRPC → Convex
id → _id
createdAt → _creationTime
updatedAt → _creationTime (or custom field if exists)
```

### 5. Toast Implementation
```typescript
// OLD (shadcn useToast)
const { toast } = useToast()
toast({ title: "Success", description: "..." })

// NEW (sonner)
import { toast } from "sonner"
toast.success("Success message")
toast.error("Error message")
```

### 6. Common shadcn/ui Fixes
```typescript
// Check for deprecated components
// Update import paths if needed
// Fix any breaking API changes
// Ensure all shadcn components are properly imported
```

## Folders to Migrate

### Private Routes (`/src/app/(private-routes)`)
1. **✅ /campaign** - COMPLETED
2. **❌ /dashboard** - Needs migration
3. **❌ /settings** - Needs migration
4. **❌ /profile** - Needs migration
5. **❌ /analytics** - Needs migration (if separate from campaign)
6. **❌ /create-campaign** - Needs migration
7. **❌ /social-accounts** - Needs migration
8. **❌ /videos** - Needs migration (if exists)

### Public Routes (`/src/app/(public-routes)`)
1. **❌ /login** - Needs migration (if has API calls)
2. **❌ /register** - Needs migration (if has API calls)
3. **❌ /pricing** - Needs migration (if has API calls)
4. **❌ /features** - Needs migration (if has API calls)
5. **❌ /about** - Needs migration (if has API calls)

## Step-by-Step Process for Each Folder

### Phase 1: Analysis
1. **Scan for TRPC usage**:
   ```bash
   grep -r "trpc" folder_path/
   grep -r "useQuery\|useMutation" folder_path/
   ```

2. **Identify all TypeScript 'any' types**:
   ```bash
   grep -r ": any" folder_path/
   ```

3. **Map API endpoints**: Document which TRPC endpoints are being used and their Convex equivalents

### Phase 2: Migration
1. **Update imports**: Replace TRPC imports with Convex imports
2. **Convert queries**: Change from TRPC query patterns to Convex patterns
3. **Convert mutations**: Update mutation patterns
4. **Fix data structures**: Update property names (id → _id, etc.)
5. **Handle loading states**: Convex uses `undefined` for loading
6. **Update error handling**: Convex errors are handled differently

### Phase 3: Type Safety
1. **Remove all 'any' types**: Replace with proper types
2. **Use Convex types**: Import `Doc<"tableName">` and `Id<"tableName">`
3. **Create interfaces**: Define proper interfaces for complex data structures
4. **Add type annotations**: Ensure all functions have proper return types

### Phase 4: Refactoring
1. **Extract custom hooks**:
   - Data fetching logic → `useDataHooks`
   - Form handling → `useFormHooks`
   - State management → `useStateHooks`

2. **Create reusable components**:
   - Common UI patterns
   - Layout components
   - Loading/Error states

3. **Improve code organization**:
   - Group related functionality
   - Extract constants
   - Separate concerns

## Common Issues and Solutions

### Issue 1: Undefined Campaign/User IDs
**Problem**: Using `id` instead of `_id`
**Solution**: Always use `_id` for Convex documents

### Issue 2: Import Path Errors
**Problem**: Incorrect relative paths to Convex API
**Solution**: Count the correct number of `../` based on file location

### Issue 3: Type Mismatches
**Problem**: TRPC and Convex have different type structures
**Solution**: Use proper Convex types (`Doc<>`, `Id<>`)

### Issue 4: Loading State Handling
**Problem**: TRPC uses `isLoading` boolean
**Solution**: Convex uses `data === undefined` for loading

### Issue 5: shadcn/ui Component Errors
**Problem**: Deprecated components or changed APIs
**Solution**: Check shadcn documentation via context7 MCP server for latest usage

### Issue 6: Toast Implementation Errors
**Problem**: Using old shadcn toast instead of sonner
**Solution**: Replace all useToast with sonner toast imports

## Testing Checklist
After migrating each folder:
1. ✓ No TypeScript errors
2. ✓ No runtime errors
3. ✓ All API calls working
4. ✓ Proper loading states
5. ✓ Error handling works
6. ✓ No 'any' types remain
7. ✓ Code is modular and clean
8. ✓ All shadcn/ui components working correctly
9. ✓ No console errors or warnings

## Priority Order
1. **High Priority**: Core functionality
   - `/dashboard`
   - `/create-campaign`
   - `/settings`
   
2. **Medium Priority**: Supporting features
   - `/analytics`
   - `/social-accounts`
   - `/profile`
   
3. **Low Priority**: Public pages
   - `/login`
   - `/register`
   - Other public routes

## Success Metrics
- Zero TypeScript errors
- Zero 'any' types
- All TRPC references removed
- Improved code modularity
- Consistent patterns across all files
- Better type safety throughout

## Notes for the Next Agent
1. Always read the Convex schema first to understand data structures
2. Test each change incrementally
3. Use the patterns established in the `/campaign` folder as reference
4. Create reusable hooks and components where patterns repeat
5. Maintain consistency with the existing migrated code
6. **Use context7 MCP server** when you need documentation:
   - For Convex documentation: `https://context7.com/context7/convex_dev`
   - For shadcn/ui documentation: Use context7 to access shadcn docs
7. Fix all shadcn-related errors, including:
   - Deprecated component usage
   - Import path issues
   - Component API changes

## Reference Implementation
The `/campaign` folder serves as the reference implementation. Study these files:
- Migration patterns: `page.tsx`, `[id]/campaign-client.tsx`
- Custom hooks: `/hooks/useCampaignData.ts`, `/hooks/useVideoDownload.ts`
- Components: `/components/CampaignCard.tsx`, `/components/CampaignHeader.tsx`
- Type safety: Proper use of `Doc<>` and `Id<>` types throughout