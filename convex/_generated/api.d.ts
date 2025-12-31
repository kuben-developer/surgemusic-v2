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
import type * as app_airtable from "../app/airtable.js";
import type * as app_analytics from "../app/analytics.js";
import type * as app_bulkDownloader_actions from "../app/bulkDownloader/actions.js";
import type * as app_bulkDownloader_mutations from "../app/bulkDownloader/mutations.js";
import type * as app_bulkDownloader_queries from "../app/bulkDownloader/queries.js";
import type * as app_bulkDownloader_utils from "../app/bulkDownloader/utils.js";
import type * as app_bundle from "../app/bundle.js";
import type * as app_campaignAssets from "../app/campaignAssets.js";
import type * as app_campaignValidation from "../app/campaignValidation.js";
import type * as app_captions from "../app/captions.js";
import type * as app_clipperDb from "../app/clipperDb.js";
import type * as app_clipperS3 from "../app/clipperS3.js";
import type * as app_directUploadS3 from "../app/directUploadS3.js";
import type * as app_files from "../app/files.js";
import type * as app_insertTiktokPosts from "../app/insertTiktokPosts.js";
import type * as app_montager from "../app/montager.js";
import type * as app_montagerDb from "../app/montagerDb.js";
import type * as app_tiktok from "../app/tiktok.js";
import type * as app_transcription from "../app/transcription.js";
import type * as app_users from "../app/users.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as services_openai from "../services/openai.js";
import type * as services_tokapi_comments from "../services/tokapi/comments.js";
import type * as services_tokapi_followers from "../services/tokapi/followers.js";
import type * as services_tokapi_following from "../services/tokapi/following.js";
import type * as services_tokapi_post from "../services/tokapi/post.js";
import type * as services_tokapi_user from "../services/tokapi/user.js";
import type * as services_tokapi_utils from "../services/tokapi/utils.js";
import type * as webhooks_campaignAnalytics from "../webhooks/campaignAnalytics.js";
import type * as webhooks_campaignAnalyticsQueries from "../webhooks/campaignAnalyticsQueries.js";
import type * as webhooks_clerk from "../webhooks/clerk.js";
import type * as webhooks_clipper from "../webhooks/clipper.js";
import type * as webhooks_montager from "../webhooks/montager.js";
import type * as webhooks_montagerVideos from "../webhooks/montagerVideos.js";
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
  "app/airtable": typeof app_airtable;
  "app/analytics": typeof app_analytics;
  "app/bulkDownloader/actions": typeof app_bulkDownloader_actions;
  "app/bulkDownloader/mutations": typeof app_bulkDownloader_mutations;
  "app/bulkDownloader/queries": typeof app_bulkDownloader_queries;
  "app/bulkDownloader/utils": typeof app_bulkDownloader_utils;
  "app/bundle": typeof app_bundle;
  "app/campaignAssets": typeof app_campaignAssets;
  "app/campaignValidation": typeof app_campaignValidation;
  "app/captions": typeof app_captions;
  "app/clipperDb": typeof app_clipperDb;
  "app/clipperS3": typeof app_clipperS3;
  "app/directUploadS3": typeof app_directUploadS3;
  "app/files": typeof app_files;
  "app/insertTiktokPosts": typeof app_insertTiktokPosts;
  "app/montager": typeof app_montager;
  "app/montagerDb": typeof app_montagerDb;
  "app/tiktok": typeof app_tiktok;
  "app/transcription": typeof app_transcription;
  "app/users": typeof app_users;
  crons: typeof crons;
  http: typeof http;
  "services/openai": typeof services_openai;
  "services/tokapi/comments": typeof services_tokapi_comments;
  "services/tokapi/followers": typeof services_tokapi_followers;
  "services/tokapi/following": typeof services_tokapi_following;
  "services/tokapi/post": typeof services_tokapi_post;
  "services/tokapi/user": typeof services_tokapi_user;
  "services/tokapi/utils": typeof services_tokapi_utils;
  "webhooks/campaignAnalytics": typeof webhooks_campaignAnalytics;
  "webhooks/campaignAnalyticsQueries": typeof webhooks_campaignAnalyticsQueries;
  "webhooks/clerk": typeof webhooks_clerk;
  "webhooks/clipper": typeof webhooks_clipper;
  "webhooks/montager": typeof webhooks_montager;
  "webhooks/montagerVideos": typeof webhooks_montagerVideos;
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
