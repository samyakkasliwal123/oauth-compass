import { OAuthGuide } from "@/types/guide";
import { slackSeedGuide } from "./slack";
import { notionSeedGuide } from "./notion";
import { googleDriveSeedGuide } from "./google-drive";
import { hubspotSeedGuide } from "./hubspot";

export const SEED_GUIDES: OAuthGuide[] = [
  slackSeedGuide,
  notionSeedGuide,
  googleDriveSeedGuide,
  hubspotSeedGuide,
];

export const SEED_GUIDES_MAP: Record<string, OAuthGuide> = {
  slack: slackSeedGuide,
  notion: notionSeedGuide,
  "google-drive": googleDriveSeedGuide,
  hubspot: hubspotSeedGuide,
};
