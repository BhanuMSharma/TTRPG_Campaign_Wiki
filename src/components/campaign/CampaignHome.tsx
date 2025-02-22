import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, collections } from "../../services/firebase";
import { Campaign, WikiPage, AdventureLogPage } from "../../types";

// Main container for the campaign home page
const HomeContainer = styled.div`
  padding: 2rem;
`;

// Header section with campaign info
const CampaignHeader = styled.div`
  background-color: #2c3e50;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

// Grid layout for statistics cards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

// Individual stat card
const StatCard = styled.div`
  background-color: #34495e;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
`;

// Action buttons container
const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
`;

// Styled button for actions
const ActionButton = styled(Link)`
  background-color: #2ecc71;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #27ae60;
  }
`;

// Content sections layout
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContentLink = styled(Link)`
  color: #ecf0f1; // Light gray color for better visibility
  background-color: #34495e;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background-color: rgb(11, 11, 12);
    color: white;
  }
`;

const CampaignHome = () => {
  const { campaignId } = useParams();
  const { user } = useAuth0();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recentWikiPages, setRecentWikiPages] = useState<WikiPage[]>([]);
  const [recentLogs, setRecentLogs] = useState<AdventureLogPage[]>([]);
  const [stats, setStats] = useState({
    wikiCount: 0,
    logCount: 0,
  });

  // Fetch campaign data and related content
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;

      try {
        // Fetch campaign details
        const campaignDoc = await getDoc(
          doc(db, collections.campaigns, campaignId)
        );
        if (campaignDoc.exists()) {
          setCampaign({
            id: campaignDoc.id,
            ...campaignDoc.data(),
          } as Campaign);
        }

        // Fetch recent wiki pages
        const wikiQuery = query(
          collection(db, collections.wikiPages),
          where("campaignId", "==", campaignId),
          limit(5)
        );
        const wikiDocs = await getDocs(wikiQuery);
        setRecentWikiPages(
          wikiDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as WikiPage[]
        );

        // Fetch recent adventure logs
        const logsQuery = query(
          collection(db, collections.adventureLogs),
          where("campaignId", "==", campaignId),
          limit(5)
        );
        const logDocs = await getDocs(logsQuery);
        setRecentLogs(
          logDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as AdventureLogPage[]
        );

        // Update statistics
        setStats({
          wikiCount: wikiDocs.size,
          logCount: logDocs.size,
        });
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchCampaignData();
  }, [campaignId]);

  return (
    <HomeContainer>
      <CampaignHeader>
        <h1>{campaign?.title}</h1>
        <p>{campaign?.description}</p>
      </CampaignHeader>

      <StatsGrid>
        <StatCard>
          <h3>Wiki Pages</h3>
          <p>{stats.wikiCount}</p>
        </StatCard>
        <StatCard>
          <h3>Adventure Logs</h3>
          <p>{stats.logCount}</p>
        </StatCard>
      </StatsGrid>

      <ActionButtons>
        <ActionButton to={`/campaigns/${campaignId}/wiki/create`}>
          Create Wiki Page
        </ActionButton>
        <ActionButton to={`/campaigns/${campaignId}/logs/create`}>
          Add Adventure Log
        </ActionButton>
      </ActionButtons>

      <ContentGrid>
        <ContentSection>
          <h2>Recent Wiki Pages</h2>
          {recentWikiPages.map((page) => (
            <ContentLink
              key={page.id}
              to={`/campaigns/${campaignId}/wiki/${page.id}`}
            >
              {page.title}
            </ContentLink>
          ))}
        </ContentSection>

        <ContentSection>
          <h2>Latest Adventure Logs</h2>
          {recentLogs.map((log) => (
            <ContentLink
              key={log.id}
              to={`/campaigns/${campaignId}/logs/${log.id}`}
            >
              {log.title}
            </ContentLink>
          ))}
        </ContentSection>
      </ContentGrid>
    </HomeContainer>
  );
};

export default CampaignHome;
