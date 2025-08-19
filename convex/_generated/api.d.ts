/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as ayrshare from "../ayrshare.js";
import type * as campaigns from "../campaigns.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as public_ from "../public.js";
import type * as reports from "../reports.js";
import type * as stripe from "../stripe.js";
import type * as users from "../users.js";
import type * as webhooks_ayrshare from "../webhooks/ayrshare.js";
import type * as webhooks_clerk from "../webhooks/clerk.js";
import type * as webhooks_make from "../webhooks/make.js";
import type * as webhooks_stripe from "../webhooks/stripe.js";
import type * as webhooks_test from "../webhooks/test.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  ayrshare: typeof ayrshare;
  campaigns: typeof campaigns;
  folders: typeof folders;
  http: typeof http;
  public: typeof public_;
  reports: typeof reports;
  stripe: typeof stripe;
  users: typeof users;
  "webhooks/ayrshare": typeof webhooks_ayrshare;
  "webhooks/clerk": typeof webhooks_clerk;
  "webhooks/make": typeof webhooks_make;
  "webhooks/stripe": typeof webhooks_stripe;
  "webhooks/test": typeof webhooks_test;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
