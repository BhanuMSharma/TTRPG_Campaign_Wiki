import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, collections } from "../../services/firebase";
import { AdventureLogPage, Campaign } from "../../types";

// Main container with responsive padding
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// View mode content styling
const ContentView = styled.div`
  background-color: #2c3e50;
  padding: 2rem;
  border-radius: 8px;
  color: white;
`;

// Edit mode form styling
const EditForm = styled.form`
  background-color: #2c3e50;
  padding: 2rem;
  border-radius: 8px;
  color: white;
`;

// Input and textarea styling for edit mode
const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background-color: #34495e;
  border: 1px solid #456789;
  border-radius: 4px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const DateInput = styled(Input)`
  width: auto; // Date inputs don't need full width
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background-color: #34495e;
  border: 1px solid #456789;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

// Button styling
const Button = styled.button`
  background-color: #2ecc71;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;

  &:hover {
    background-color: #27ae60;
  }
`;

// Metadata display styling
const MetaData = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #95a5a6;
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
  margin-top: 2rem;
`;

const DeleteButton = styled(Button)`
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
`;

const AdventureLogView = () => {
  const { campaignId, logId } = useParams();
  const { user } = useAuth0();
  const navigate = useNavigate();

  // State management
  const [log, setLog] = useState<AdventureLogPage | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    sessionDate: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
  });

  // Fetch log data and check permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId || !logId) return;

      // Fetch log data
      const logDoc = await getDoc(doc(db, collections.adventureLogs, logId));
      if (logDoc.exists()) {
        const logData = { id: logDoc.id, ...logDoc.data() } as AdventureLogPage;
        setLog(logData);
        setFormData({
          title: logData.title,
          body: logData.body,
          sessionDate: new Date(logData.sessionDate)
            .toISOString()
            .split("T")[0],
        });
      }

      // Fetch campaign data for permission check
      const campaignDoc = await getDoc(
        doc(db, collections.campaigns, campaignId)
      );
      if (campaignDoc.exists()) {
        const campaignData = {
          id: campaignDoc.id,
          ...campaignDoc.data(),
        } as Campaign;
        setCampaign(campaignData);

        // Check if user has edit access
        setHasEditAccess(
          user?.sub === campaignData.creatorId ||
            campaignData.authorizedUsers?.includes(user?.sub || "")
        );
      }
    };

    fetchData();
  }, [campaignId, logId, user]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logId) return;

    try {
      await updateDoc(doc(db, collections.adventureLogs, logId), {
        ...formData,
        sessionDate: new Date(formData.sessionDate),
        updatedAt: new Date(),
      });

      // Update local state and exit edit mode
      setLog((prev) =>
        prev
          ? {
              ...prev,
              ...formData,
              sessionDate: new Date(formData.sessionDate),
            }
          : null
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating log:", error);
    }
  };

  // Add delete handler
  const handleDelete = async () => {
    if (!logId || !window.confirm("Are you sure you want to delete this log?"))
      return;

    try {
      await deleteDoc(doc(db, collections.adventureLogs, logId));
      navigate(`/campaigns/${campaignId}/logs`);
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  if (!log) return <div>Loading...</div>;

  return (
    <PageContainer>
      <BreadcrumbNav>
        <BreadcrumbLink to={`/campaigns/${campaignId}`}>
          {campaign?.title || "Campaign"}
        </BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbLink to={`/campaigns/${campaignId}/logs`}>
          Adventure Logs
        </BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <span>{log?.title}</span>
      </BreadcrumbNav>
      {isEditing ? (
        <EditForm onSubmit={handleSubmit}>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Session Title"
            required
          />

          <div style={{ margin: "1rem 0" }}>
            <label htmlFor="sessionDate">Session Date: </label>
            <DateInput
              type="date"
              id="sessionDate"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleChange}
              required
            />
          </div>

          <Textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Session Notes"
            required
          />

          <Button type="submit">Save Changes</Button>
          <Button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </EditForm>
      ) : (
        <ContentView>
          <h1>{log.title}</h1>
          <MetaData>
            Session Date: {new Date(log.sessionDate).toLocaleDateString()}
          </MetaData>
          <div>{log.body}</div>

          {hasEditAccess && (
            <ActionButtons>
              <Button onClick={() => setIsEditing(true)}>Edit Log</Button>
              <DeleteButton onClick={handleDelete}>Delete Log</DeleteButton>
            </ActionButtons>
          )}
        </ContentView>
      )}
    </PageContainer>
  );
};

export default AdventureLogView;
