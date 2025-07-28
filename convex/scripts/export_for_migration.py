#!/usr/bin/env python3
"""
Export PostgreSQL data to JSON for TypeScript migration script
"""

import json
from datetime import datetime
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor


class PostgresExporter:
    def __init__(self, db_url: str):
        self.conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        self.cursor = self.conn.cursor()
        
    def close(self):
        self.cursor.close()
        self.conn.close()
        
    def datetime_to_timestamp(self, dt: datetime) -> int | None:
        """Convert datetime to Unix timestamp in milliseconds"""
        if dt:
            return int(dt.timestamp() * 1000)
        return None
        
    def export_all_data(self) -> Dict[str, Any]:
        """Export all data from PostgreSQL"""
        print("Exporting data from PostgreSQL...")
        
        # Export users
        self.cursor.execute("""
            SELECT id, "stripeCustomerId", "subscriptionPriceId", "firstTimeUser", "isTrial",
                   "videoGenerationCredit", "videoGenerationAdditionalCredit",
                   "postSchedulerCredit", "postSchedulerAdditionalCredit"
            FROM "User"
            ORDER BY "createdAt"
        """)
        users = []
        for row in self.cursor.fetchall():
            users.append({
                "originalId": row["id"],
                "clerkId": row["id"],
                "billing": {
                    "stripeCustomerId": row["stripeCustomerId"],
                    "subscriptionPriceId": row["subscriptionPriceId"],
                    "firstTimeUser": row["firstTimeUser"],
                    "isTrial": row["isTrial"],
                },
                "credits": {
                    "videoGeneration": row["videoGenerationCredit"],
                    "videoGenerationAdditional": row["videoGenerationAdditionalCredit"],
                    "postScheduler": row["postSchedulerCredit"],
                    "postSchedulerAdditional": row["postSchedulerAdditionalCredit"],
                }
            })
        
        # Export campaigns
        self.cursor.execute("""
            SELECT id, "userId", "campaignName", "songName", "artistName", "campaignCoverImageUrl",
                   "videoCount", genre, themes, "isCompleted"
            FROM "Campaign"
            ORDER BY "createdAt"
        """)
        campaigns = []
        for row in self.cursor.fetchall():
            campaigns.append({
                "originalId": row["id"],
                "originalUserId": row["userId"],
                "campaignName": row["campaignName"],
                "songName": row["songName"],
                "artistName": row["artistName"],
                "campaignCoverImageUrl": row["campaignCoverImageUrl"],
                "videoCount": row["videoCount"],
                "genre": row["genre"],
                "themes": row["themes"] or [],
                "status": "completed" if row["isCompleted"] else "pending"
            })
        
        # Export AyrshareProfiles
        self.cursor.execute("""
            SELECT "profileName", "profileKey", "userId"
            FROM "AyrshareProfile"
            ORDER BY "createdAt"
        """)
        ayrshare_profiles = []
        for row in self.cursor.fetchall():
            ayrshare_profiles.append({
                "originalProfileName": row["profileName"],
                "originalUserId": row["userId"],
                "profileName": row["profileName"],
                "profileKey": row["profileKey"]
            })
        
        # Export SocialAccounts
        self.cursor.execute("""
            SELECT id, "ayrshareProfileName", platform, "profileUrl", "userImage", username
            FROM "SocialAccount"
            ORDER BY "createdAt"
        """)
        social_accounts = []
        social_account_lookup = {}  # Create lookup map by ID
        for row in self.cursor.fetchall():
            platform = row["platform"].lower()
            if platform in ["tiktok", "instagram", "youtube"]:
                account_data = {
                    "originalId": row["id"],
                    "originalProfileName": row["ayrshareProfileName"],
                    "platform": platform,
                    "profileUrl": row["profileUrl"],
                    "userImage": row["userImage"],
                    "username": row["username"]
                }
                social_accounts.append(account_data)
                # Add to lookup map for easy access by ID
                social_account_lookup[row["id"]] = account_data
        
        # Export GeneratedVideo to SocialAccount relationships
        self.cursor.execute("""
            SELECT "A", "B" FROM "_GeneratedVideoToSocialAccount"
        """)
        video_social_accounts = {}
        for row in self.cursor.fetchall():
            video_id = row["A"]
            social_id = row["B"]
            if video_id not in video_social_accounts:
                video_social_accounts[video_id] = []
            video_social_accounts[video_id].append(social_id)
        
        # Export GeneratedVideos
        self.cursor.execute("""
            SELECT id, "campaignId", "videoName", "videoUrl", "videoType",
                   "scheduledAt", "postId", "refId", "postCaption", "templateId",
                   "tiktokPosted", "instagramPosted", "youtubePosted",
                   "tiktokFailedReason", "instagramFailedReason", "youtubeFailedReason",
                   "tiktokUrl", "instagramUrl", "youtubeUrl"
            FROM "GeneratedVideo"
            ORDER BY "createdAt"
        """)
        generated_videos = []
        for row in self.cursor.fetchall():
            video = {
                "originalId": row["id"],
                "originalCampaignId": row["campaignId"],
                "video": {
                    "name": row["videoName"],
                    "url": row["videoUrl"],
                    "type": row["videoType"]
                },
                "scheduledSocialAccountIds": video_social_accounts.get(row["id"], [])
            }
            
            # Add platform-specific upload data
            if row["scheduledAt"]:
                scheduled_time = self.datetime_to_timestamp(row["scheduledAt"])
                scheduled_account_ids = video_social_accounts.get(row["id"], [])
                
                # Find social accounts by platform
                platform_accounts = {
                    "tiktok": [],
                    "instagram": [],
                    "youtube": []
                }
                
                for account_id in scheduled_account_ids:
                    if account_id in social_account_lookup:
                        account = social_account_lookup[account_id]
                        platform = account["platform"]
                        if platform in platform_accounts:
                            platform_accounts[platform].append(account_id)
                
                # Add TikTok upload if exists
                if row["tiktokPosted"] or row["tiktokFailedReason"]:
                    # Use the first TikTok account if available
                    tiktok_account_id = platform_accounts["tiktok"][0] if platform_accounts["tiktok"] else None
                    if tiktok_account_id:
                        video["tiktokUpload"] = {
                            "scheduledAt": scheduled_time,
                            "socialAccountId": tiktok_account_id,
                            "status": {
                                "isPosted": bool(row["tiktokPosted"]),
                                "isFailed": bool(row["tiktokFailedReason"]),
                                "failedReason": row["tiktokFailedReason"]
                            },
                            "post": {
                                "id": row["postId"] or "",
                                "refId": row["refId"],
                                "caption": row["postCaption"] or "",
                                "url": row["tiktokUrl"],
                                "templateId": row["templateId"]
                            }
                        }
                
                # Add Instagram upload if exists
                if row["instagramPosted"] or row["instagramFailedReason"]:
                    # Use the first Instagram account if available
                    instagram_account_id = platform_accounts["instagram"][0] if platform_accounts["instagram"] else None
                    if instagram_account_id:
                        video["instagramUpload"] = {
                            "scheduledAt": scheduled_time,
                            "socialAccountId": instagram_account_id,
                            "status": {
                                "isPosted": bool(row["instagramPosted"]),
                                "isFailed": bool(row["instagramFailedReason"]),
                                "failedReason": row["instagramFailedReason"]
                            },
                            "post": {
                                "id": row["postId"] or "",
                                "refId": row["refId"],
                                "caption": row["postCaption"] or "",
                                "url": row["instagramUrl"],
                                "templateId": row["templateId"]
                            }
                        }
                
                # Add YouTube upload if exists
                if row["youtubePosted"] or row["youtubeFailedReason"]:
                    # Use the first YouTube account if available
                    youtube_account_id = platform_accounts["youtube"][0] if platform_accounts["youtube"] else None
                    if youtube_account_id:
                        video["youtubeUpload"] = {
                            "scheduledAt": scheduled_time,
                            "socialAccountId": youtube_account_id,
                            "status": {
                                "isPosted": bool(row["youtubePosted"]),
                                "isFailed": bool(row["youtubeFailedReason"]),
                                "failedReason": row["youtubeFailedReason"]
                            },
                            "post": {
                                "id": row["postId"] or "",
                                "refId": row["refId"],
                                "caption": row["postCaption"] or "",
                                "url": row["youtubeUrl"],
                                "templateId": row["templateId"]
                            }
                        }
            
            generated_videos.append(video)
        
        # Export Report to Campaign relationships
        self.cursor.execute("""
            SELECT "A", "B" FROM "_CampaignToReport"
        """)
        report_campaigns = {}
        for row in self.cursor.fetchall():
            campaign_id = row["A"]
            report_id = row["B"]
            if report_id not in report_campaigns:
                report_campaigns[report_id] = []
            report_campaigns[report_id].append(campaign_id)
        
        # Export hidden videos
        self.cursor.execute("""
            SELECT "reportId", "videoId" FROM "ReportHiddenVideo"
        """)
        report_hidden_videos = {}
        for row in self.cursor.fetchall():
            report_id = row["reportId"]
            if report_id not in report_hidden_videos:
                report_hidden_videos[report_id] = []
            report_hidden_videos[report_id].append(row["videoId"])
        
        # Export Reports
        self.cursor.execute("""
            SELECT id, name, "userId", public_share_id
            FROM "Report"
            ORDER BY "createdAt"
        """)
        reports = []
        for row in self.cursor.fetchall():
            reports.append({
                "originalId": row["id"],
                "originalUserId": row["userId"],
                "name": row["name"],
                "publicShareId": row["public_share_id"],
                "originalCampaignIds": report_campaigns.get(row["id"], []),
                "originalHiddenVideoIds": report_hidden_videos.get(row["id"], [])
            })
        
        # Export CampaignFolder relationships
        self.cursor.execute("""
            SELECT "campaignId", "folderId" FROM "CampaignFolder"
        """)
        folder_campaigns = {}
        for row in self.cursor.fetchall():
            folder_id = row["folderId"]
            campaign_id = row["campaignId"]
            if folder_id not in folder_campaigns:
                folder_campaigns[folder_id] = []
            folder_campaigns[folder_id].append(campaign_id)
        
        # Export Folders with user inference
        self.cursor.execute("""
            SELECT id, name
            FROM "Folder"
            ORDER BY "createdAt"
        """)
        folders = []
        for row in self.cursor.fetchall():
            campaign_ids = folder_campaigns.get(row["id"], [])
            
            # Find user from campaigns
            user_id = None
            if campaign_ids:
                self.cursor.execute(
                    'SELECT "userId" FROM "Campaign" WHERE id = %s LIMIT 1',
                    (campaign_ids[0],)
                )
                result = self.cursor.fetchone()
                if result:
                    user_id = result["userId"]
            
            if user_id:
                folders.append({
                    "originalId": row["id"],
                    "originalUserId": user_id,
                    "name": row["name"],
                    "originalCampaignIds": campaign_ids
                })
        
        return {
            "users": users,
            "campaigns": campaigns,
            "ayrshareProfiles": ayrshare_profiles,
            "socialAccounts": social_accounts,
            "generatedVideos": generated_videos,
            "reports": reports,
            "folders": folders
        }
    
    def export_to_json(self):
        """Export all data to a JSON file"""
        data = self.export_all_data()
        
        with open('migration_data.json', 'w') as f:
            json.dump(data, f, indent=2)
        
        print("\nExported data summary:")
        for table, records in data.items():
            print(f"  {table}: {len(records)} records")
        
        print("\nData exported to migration_data.json")
        self.close()


def main():
    db_url = "postgres://neondb_owner:npg_oxQp32dyNtRe@ep-proud-thunder-a498d46q-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
    exporter = PostgresExporter(db_url)
    exporter.export_to_json()


if __name__ == "__main__":
    main()