import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { getTheme } from "../../theme/index.ts";
import { collection, getDocs, query, where } from "firebase/firestore"; //, or } from "firebase/firestore";
import { db, collections } from "../../services/firebase";
import { Campaign } from "../../types";

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

// Main container for the campaign list page
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// Header section containing title and create button
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

// Grid layout for campaign cards
const CampaignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

// Individual campaign card styling
const CampaignCard = styled(Link)`
  background-color: #2c3e50;
  border-radius: 8px;
  padding: 1.5rem;
  color: white;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

// Update the CampaignCard to include a game system badge
const GameSystemBadge = styled.span`
  display: inline-block;
  background-color: ${getTheme("colors.primary")};
  color: ${getTheme("colors.text.primary")};
  padding: ${getTheme("spacing.sm")} ${getTheme("spacing.md")};
  border-radius: ${getTheme("borderRadius.sm")};
  font-size: ${getTheme("fonts.size.base")};
  font-weight: ${getTheme("fonts.weight.medium")};
  margin-top: ${getTheme("spacing.md")};
`;

// Create campaign button styling
const CreateButton = styled(Link)`
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

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

const CampaignList = () => {
  // Separate states for public and private campaigns
  const [publicCampaigns, setPublicCampaigns] = useState<Campaign[]>([]);
  const [privateCampaigns, setPrivateCampaigns] = useState<Campaign[]>([]);
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Fetch public campaigns
        const publicQuery = query(
          collection(db, collections.campaigns),
          where("isPublic", "==", true)
        );
        const publicSnapshot = await getDocs(publicQuery);
        const publicData = publicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Campaign[];
        setPublicCampaigns(publicData);

        // If user is authenticated, fetch their private campaigns
        if (isAuthenticated && user?.sub) {
          const privateQuery = query(
            collection(db, collections.campaigns),
            where("isPublic", "==", false),
            where("authorizedUsers", "array-contains", user.sub)
          );
          const privateSnapshot = await getDocs(privateQuery);
          const privateData = privateSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Campaign[];
          setPrivateCampaigns(privateData);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, [isAuthenticated, user]);

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <PageContainer>
      <HeaderSection>
        <h1>TTRPG Campaigns</h1>
        {isAuthenticated && (
          <CreateButton to="/campaigns/create">
            Create New Campaign
          </CreateButton>
        )}
      </HeaderSection>

      {/* Private Campaigns Section - Only shown to authenticated users */}
      {isAuthenticated && (
        <>
          <h2>Your Private Campaigns</h2>
          <CampaignGrid>
            {privateCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                to={`/campaigns/${campaign.urlId}`}
              >
                <h2>{campaign.title}</h2>
                {campaign.gameSystem && (
                  <GameSystemBadge>{campaign.gameSystem}</GameSystemBadge>
                )}
                <p>{campaign.description}</p>
                <small>
                  Created: {campaign.createdAt.toDate().toLocaleDateString()}
                </small>
              </CampaignCard>
            ))}
          </CampaignGrid>
        </>
      )}

      {/* Public Campaigns Section */}
      <h2>Public Campaigns</h2>
      <CampaignGrid>
        {publicCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} to={`/campaigns/${campaign.id}`}>
            <h2>{campaign.title}</h2>
            {campaign.gameSystem && (
              <GameSystemBadge>{campaign.gameSystem}</GameSystemBadge>
            )}
            <p>{campaign.description}</p>
            <small>
              Created: {campaign.createdAt.toDate().toLocaleDateString()}
            </small>
          </CampaignCard>
        ))}
      </CampaignGrid>

      {/* No campaigns message */}
      {publicCampaigns.length === 0 &&
        (!isAuthenticated || privateCampaigns.length === 0) && (
          <p>
            No campaigns found.{" "}
            {!isAuthenticated && "Log in to see your private campaigns!"}
          </p>
        )}
    </PageContainer>
  );
};

export default CampaignList;
