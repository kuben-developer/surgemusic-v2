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
import type * as app_analytics from "../app/analytics.js";
import type * as app_ayrshare from "../app/ayrshare.js";
import type * as app_campaigns from "../app/campaigns.js";
import type * as app_files from "../app/files.js";
import type * as app_folders from "../app/folders.js";
import type * as app_public from "../app/public.js";
import type * as app_reports from "../app/reports.js";
import type * as app_stripe from "../app/stripe.js";
import type * as app_tiktok from "../app/tiktok.js";
import type * as app_transcription from "../app/transcription.js";
import type * as app_users from "../app/users.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as utils_srt_generator from "../utils/srt_generator.js";
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
  "app/analytics": typeof app_analytics;
  "app/ayrshare": typeof app_ayrshare;
  "app/campaigns": typeof app_campaigns;
  "app/files": typeof app_files;
  "app/folders": typeof app_folders;
  "app/public": typeof app_public;
  "app/reports": typeof app_reports;
  "app/stripe": typeof app_stripe;
  "app/tiktok": typeof app_tiktok;
  "app/transcription": typeof app_transcription;
  "app/users": typeof app_users;
  crons: typeof crons;
  http: typeof http;
  "utils/srt_generator": typeof utils_srt_generator;
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
