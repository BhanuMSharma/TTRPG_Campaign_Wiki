import {Timestamp } from 'firebase/firestore';

interface User {
    id: string;
    email: string;
    role: 'creator' | 'reader';
  }
  
  interface Campaign {
    id: string;
    title: string;
    urlId: string;
    description: string;
    creatorId: string;
    authorizedUsers: string[];  // Array of user IDs who can edit
    createdAt: Timestamp;
    isPublic: boolean;
  }
  
  interface WikiPage {
    id: string;
    urlId: string;
    campaignId: string;
    title: string;
    body: string;
    type: 'wiki';
    showInSidebar: boolean;  // New property for sidebar visibility
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  interface AdventureLogPage {
    id: string;
    campaignId: string;
    title: string;
    body: string;
    type: 'adventureLog';
    sessionDate: Date;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  type Page = WikiPage | AdventureLogPage;
  
  export type { User, Campaign, WikiPage, AdventureLogPage, Page };