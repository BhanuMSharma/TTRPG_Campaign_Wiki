import { Link, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Campaign, WikiPage } from "../../types";
import { db, collections } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// Main sidebar container - fixed to the left side
const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 60px;
  background-color: #34495e;
  color: white;
  padding: 1rem;
  overflow-y: auto;
`;

// Section headers in the sidebar
const SectionHeader = styled.h3`
  color: #ecf0f1;
  margin-top: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
`;

// Container for the list of pages
const PageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Individual page link styling
const PageLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: block;
  padding: 0.5rem;
  margin: 0.2rem 0;
  border-radius: 4px;

  &:hover {
    background-color: #2c3e50;
  }
`;

const Sidebar = () => {
  // Get campaignId from URL parameters
  const { campaignId } = useParams();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  console.log("campaignId:", campaignId);

  // State management for campaign data and pages
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sidebarWikiPages, setSidebarWikiPages] = useState<WikiPage[]>([]);

  // Fetch campaign data and pages when component mounts or campaignId changes
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;

      // Fetch campaign details using document reference
      const campaignDoc = await getDoc(
        doc(db, collections.campaigns, campaignId)
      );
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      console.log("campaignDoc.exists():", campaignDoc.exists());
      console.log("campaignDoc:", campaignDoc.data());
      if (campaignDoc.exists()) {
        setCampaign({ id: campaignDoc.id, ...campaignDoc.data() } as Campaign);
      }

      // Fetch wiki pages marked for sidebar
      const wikiRef = collection(db, collections.wikiPages);
      const wikiSnap = await getDocs(
        query(
          wikiRef,
          where("campaignId", "==", campaignId),
          where("showInSidebar", "==", true)
        )
      );
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      console.log(
        "Wiki pages:",
        wikiSnap.docs.map((doc) => doc.data())
      );

      setSidebarWikiPages(
        wikiSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WikiPage[]
      );
    };

    fetchCampaignData();
  }, [campaignId]);

  return (
    <SidebarContainer>
      <h2>{campaign?.title || "Loading..."}</h2>

      {/* Campaign Home Link - New Addition */}
      <SectionHeader>Navigation</SectionHeader>
      <PageList>
        <PageLink to={`/campaigns/${campaignId}`}>Campaign Home</PageLink>
        <PageLink to={`/campaigns/${campaignId}/logs`}>Adventure Logs</PageLink>
        <PageLink to={`/campaigns/${campaignId}/wiki`}>All Wiki Pages</PageLink>
      </PageList>

      <SectionHeader>Quick Links</SectionHeader>
      <PageList>
        {sidebarWikiPages.map((page) => (
          <li key={page.id}>
            <PageLink to={`/campaigns/${campaignId}/wiki/${page.urlId}`}>
              {page.title}
            </PageLink>
          </li>
        ))}
      </PageList>
    </SidebarContainer>
  );
};

export default Sidebar;
