import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, collections } from "../../services/firebase";
import { AdventureLogPage, Campaign } from "../../types";

// Main container styling
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// Header section with title and create button
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

// Create new log button
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

// Log entry card styling
const LogCard = styled(Link)`
  display: block;
  background-color: #2c3e50;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(10px);
    background-color: #34495e;
  }
`;

const LogCardContainer = styled.div`
  background-color: #2c3e50;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  color: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(10px);
    background-color: #34495e;
  }
`;

const LogCardContent = styled(Link)`
  color: white;
  text-decoration: none;
  display: block;
`;

// Date display styling
const SessionDate = styled.span`
  color: #95a5a6;
  font-size: 0.9rem;
`;

const BreadcrumbNav = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreadcrumbLink = styled(Link)`
  color: #3498db;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #95a5a6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background-color: #2ecc71;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #27ae60;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
`;

const AdventureLogList = () => {
  const navigate = useNavigate();

  const { campaignId } = useParams();
  const { user } = useAuth0();
  const [logs, setLogs] = useState<AdventureLogPage[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [hasEditAccess, setHasEditAccess] = useState(false);

  // Fetch logs and check permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) return;
      ////////////////////////////////////////////////////////////////////////////////////////
      console.log("Fetching data for campaign:", campaignId);

      try {
        // Fetch campaign data for permissions
        const campaignDoc = await getDoc(
          doc(db, collections.campaigns, campaignId)
        );
        ////////////////////////////////////////////////////////////////////////////////////////
        console.log("Campaign data:", campaignDoc.data());

        if (campaignDoc.exists()) {
          const campaignData = {
            id: campaignDoc.id,
            ...campaignDoc.data(),
          } as Campaign;

          setCampaign(campaignData);
          setHasEditAccess(
            user?.sub === campaignData.creatorId ||
              campaignData.authorizedUsers?.includes(user?.sub || "")
          );
        }

        // Fetch all adventure logs for this campaign
        const logsQuery = query(
          collection(db, collections.adventureLogs),
          where("campaignId", "==", campaignId),
          orderBy("sessionDate", "desc") // Most recent sessions first
        );

        const logsSnapshot = await getDocs(logsQuery);
        ////////////////////////////////////////////////////////////////////////////////////////
        console.log(
          "Logs data:",
          logsSnapshot.docs.map((doc) => doc.data())
        );

        const logsData = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdventureLogPage[];

        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchData();
  }, [campaignId, user]);

  // Add delete handler
  const handleDelete = async (logId: string) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    try {
      await deleteDoc(doc(db, collections.adventureLogs, logId));
      setLogs(logs.filter((log) => log.id !== logId));
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  return (
    <PageContainer>
      <BreadcrumbNav>
        <BreadcrumbLink to={`/campaigns/${campaignId}`}>
          {campaign?.title || "Campaign"}
        </BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <span>Adventure Logs</span>
      </BreadcrumbNav>
      <HeaderSection>
        <h1>Adventure Logs</h1>
        {hasEditAccess && (
          <CreateButton to={`/campaigns/${campaignId}/logs/create`}>
            Create New Log
          </CreateButton>
        )}
      </HeaderSection>

      {/* Display logs chronologically */}
      {logs.map((log) => (
        <LogCardContainer key={log.id}>
          <LogCardContent to={`/campaigns/${campaignId}/logs/${log.id}`}>
            <h2>{log.title}</h2>
            <SessionDate>
              Session Date: {new Date(log.sessionDate).toLocaleDateString()}
            </SessionDate>
            <p>{log.body.substring(0, 150)}...</p>
          </LogCardContent>

          {hasEditAccess && (
            <ActionButtons>
              <Button
                onClick={() =>
                  navigate(`/campaigns/${campaignId}/logs/${log.id}`)
                }
              >
                Edit
              </Button>
              <DeleteButton onClick={() => handleDelete(log.id)}>
                Delete
              </DeleteButton>
            </ActionButtons>
          )}
        </LogCardContainer>
      ))}

      {/* Message when no logs exist */}
      {logs.length === 0 && (
        <p>
          No adventure logs yet. {hasEditAccess && "Create your first log!"}
        </p>
      )}
    </PageContainer>
  );
};

export default AdventureLogList;
