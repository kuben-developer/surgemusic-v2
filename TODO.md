# TODO: TRPC to Convex Migration & Code Quality Tasks

## 🎯 Overall Progress
- [x] `/campaign` folder - COMPLETED ✅
- [ ] All other folders - PENDING

## 📋 Detailed Task List

### 🔴 HIGH PRIORITY - Core Functionality

#### 1. `/dashboard` Migration
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert all `api.*.useQuery()` to `useQuery(api.*)`
  - [ ] Fix loading states (`isLoading` → `data === undefined`)
  - [ ] Update data properties (`id` → `_id`, `createdAt` → `_creationTime`)
  - [ ] Remove all `any` types
  - [ ] Fix shadcn toast imports (useToast → sonner)
  - [ ] Create `useDashboardData` hook
  - [ ] Extract dashboard components (StatsCard, RecentActivity, etc.)

- [ ] **File: `components/*.tsx`** (if exists)
  - [ ] Migrate all component files
  - [ ] Fix type safety issues
  - [ ] Update shadcn components if deprecated

#### 2. `/create-campaign` Migration
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert `useMutation` patterns
  - [ ] Handle form submission with Convex
  - [ ] Fix file upload logic if present
  - [ ] Remove all `any` types
  - [ ] Fix shadcn form components
  - [ ] Create `useCampaignCreation` hook

- [ ] **File: `components/campaign-form.tsx`** (if exists)
  - [ ] Update form validation
  - [ ] Fix mutation calls
  - [ ] Handle success/error states with sonner

#### 3. `/settings` Migration
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert settings queries
  - [ ] Update settings mutations
  - [ ] Fix profile update logic
  - [ ] Remove all `any` types
  - [ ] Fix shadcn tabs/forms if used

- [ ] **Sub-folders to check:**
  - [ ] `/settings/profile`
  - [ ] `/settings/account`
  - [ ] `/settings/billing`
  - [ ] `/settings/notifications`

### 🟡 MEDIUM PRIORITY - Supporting Features

#### 4. `/analytics` Migration (if separate from campaign)
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert analytics queries
  - [ ] Update chart data fetching
  - [ ] Fix date range filters
  - [ ] Remove all `any` types
  - [ ] Update chart libraries if needed

#### 5. `/social-accounts` Migration
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert account queries
  - [ ] Update connection/disconnection logic
  - [ ] Fix OAuth callback handling
  - [ ] Remove all `any` types
  - [ ] Fix shadcn card/button components

- [ ] **File: `components/account-card.tsx`** (if exists)
  - [ ] Update component props
  - [ ] Fix mutation calls

#### 6. `/profile` Migration
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert profile queries
  - [ ] Update profile edit mutations
  - [ ] Fix avatar upload if present
  - [ ] Remove all `any` types
  - [ ] Fix shadcn avatar/form components

#### 7. `/videos` Migration (if exists)
- [ ] **File: `page.tsx`**
  - [ ] Replace TRPC imports with Convex imports
  - [ ] Convert video list queries
  - [ ] Update video management logic
  - [ ] Fix pagination/filtering
  - [ ] Remove all `any` types

### 🟢 LOW PRIORITY - Public Pages

#### 8. `/login` Migration
- [ ] **File: `page.tsx`**
  - [ ] Check for any API calls
  - [ ] Update authentication logic if needed
  - [ ] Fix shadcn form components
  - [ ] Remove all `any` types

#### 9. `/register` Migration
- [ ] **File: `page.tsx`**
  - [ ] Check for any API calls
  - [ ] Update registration logic if needed
  - [ ] Fix shadcn form components
  - [ ] Remove all `any` types

#### 10. `/pricing` Migration
- [ ] **File: `page.tsx`**
  - [ ] Check for pricing data API calls
  - [ ] Convert to Convex if needed
  - [ ] Fix shadcn card components
  - [ ] Remove all `any` types

#### 11. `/features` Migration
- [ ] **File: `page.tsx`**
  - [ ] Check for feature data API calls
  - [ ] Convert to Convex if needed
  - [ ] Remove all `any` types

#### 12. `/about` Migration
- [ ] **File: `page.tsx`**
  - [ ] Check for any dynamic content API calls
  - [ ] Convert to Convex if needed
  - [ ] Remove all `any` types

## 🛠️ Common Tasks for Each File

### Pre-Migration Checklist
- [ ] Run `grep -r "trpc" .` in the folder
- [ ] Run `grep -r ": any" .` in the folder
- [ ] Identify all API endpoints used
- [ ] Check Convex schema for equivalent endpoints

### Migration Steps
1. **Imports**
   - [ ] Remove: `import { api } from "@/trpc/react"`
   - [ ] Add: `import { useQuery, useMutation, useAction } from "convex/react"`
   - [ ] Add: `import { api } from "../path/to/convex/_generated/api"`
   - [ ] Add: `import type { Id, Doc } from "../path/to/convex/_generated/dataModel"`

2. **Queries**
   - [ ] Find all: `api.*.useQuery({ ... })`
   - [ ] Replace with: `useQuery(api.*, { ... })`
   - [ ] Update loading: `isLoading` → `data === undefined`

3. **Mutations**
   - [ ] Find all: `api.*.useMutation({ ... })`
   - [ ] Replace with: `useMutation(api.*)`
   - [ ] Move success/error handling to calling function

4. **Data Structure**
   - [ ] Replace all: `id` → `_id`
   - [ ] Replace all: `createdAt` → `_creationTime`
   - [ ] Replace all: `updatedAt` → `_creationTime`

5. **Toast/Notifications**
   - [ ] Remove: `const { toast } = useToast()`
   - [ ] Add: `import { toast } from "sonner"`
   - [ ] Update all toast calls to sonner format

6. **Type Safety**
   - [ ] Find all `: any` and replace with proper types
   - [ ] Add proper return types to all functions
   - [ ] Use `Doc<"tableName">` for Convex documents
   - [ ] Use `Id<"tableName">` for document IDs

### Post-Migration Testing
- [ ] Run TypeScript compiler - no errors
- [ ] Check browser console - no runtime errors
- [ ] Test all CRUD operations
- [ ] Verify loading states work
- [ ] Test error scenarios
- [ ] Check responsive design
- [ ] Verify all shadcn components render correctly

## 📁 File Structure to Create

### For Each Major Route
```
/route-name/
  ├── page.tsx (main component)
  ├── components/
  │   ├── ComponentName.tsx
  │   └── ...
  ├── hooks/
  │   ├── useRouteData.ts
  │   ├── useRouteActions.ts
  │   └── ...
  └── types/
      └── index.ts (if needed)
```

## 🔍 Search Commands for Quick Checks

```bash
# Find all TRPC imports
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/trpc"

# Find all any types
find . -name "*.tsx" -o -name "*.ts" | xargs grep ": any"

# Find all useToast usage
find . -name "*.tsx" -o -name "*.ts" | xargs grep "useToast"

# Find all api.*useQuery patterns
find . -name "*.tsx" -o -name "*.ts" | xargs grep "api\.*\.useQuery"

# Find all api.*useMutation patterns
find . -name "*.tsx" -o -name "*.ts" | xargs grep "api\.*\.useMutation"
```

## 📚 Resources to Use

1. **Context7 MCP Server**
   - Convex docs: `https://context7.com/context7/convex_dev`
   - shadcn docs: Use context7 for latest component APIs

2. **Reference Implementation**
   - Check `/campaign` folder for patterns
   - Review custom hooks in `/campaign/hooks/`
   - Study components in `/campaign/components/`

## ⚠️ Critical Reminders

1. **Always backup before major changes**
2. **Test incrementally - don't migrate everything at once**
3. **Keep the same file structure as much as possible**
4. **Maintain consistency with the `/campaign` implementation**
5. **Document any special cases or workarounds**
6. **Use proper error boundaries for better error handling**
7. **Check for deprecated shadcn components**
8. **Ensure all imports use correct relative paths**

## 🎉 Definition of Done

A folder is considered fully migrated when:
- ✅ Zero TRPC imports remain
- ✅ Zero `any` types remain  
- ✅ All Convex queries/mutations working
- ✅ Proper loading and error states
- ✅ All shadcn components updated
- ✅ Code is modular with custom hooks
- ✅ TypeScript shows no errors
- ✅ Browser console shows no errors
- ✅ All tests pass (if any exist)
- ✅ Code follows the patterns from `/campaign`

## 📝 Notes Section

Use this section to document:
- Special cases encountered
- Workarounds implemented
- Decisions made during migration
- Any technical debt created
- Future improvements identified

---

**Last Updated**: [Current Date]
**Updated By**: [Agent Name]