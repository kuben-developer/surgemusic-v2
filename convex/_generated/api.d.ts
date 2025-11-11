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
import type * as app_bundleSocial from "../app/bundleSocial.js";
import type * as app_bundleSocialQueries from "../app/bundleSocialQueries.js";
import type * as app_campaignV2 from "../app/campaignV2.js";
import type * as app_captions from "../app/captions.js";
import type * as app_clipper from "../app/clipper.js";
import type * as app_montager from "../app/montager.js";
import type * as app_transcription from "../app/transcription.js";
import type * as app_users from "../app/users.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as webhooks_clerk from "../webhooks/clerk.js";
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
  "app/bundleSocial": typeof app_bundleSocial;
  "app/bundleSocialQueries": typeof app_bundleSocialQueries;
  "app/campaignV2": typeof app_campaignV2;
  "app/captions": typeof app_captions;
  "app/clipper": typeof app_clipper;
  "app/montager": typeof app_montager;
  "app/transcription": typeof app_transcription;
  "app/users": typeof app_users;
  crons: typeof crons;
  http: typeof http;
  "webhooks/clerk": typeof webhooks_clerk;
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
