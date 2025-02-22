import  { Campaign } from "../types/index.ts";

export const isCreator = (campaign: Campaign, userId: string | undefined): boolean => {
    return campaign.creatorId === userId;
  };
  