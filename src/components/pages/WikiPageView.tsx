import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db, collections } from "../../services/firebase";
import { WikiPage, Campaign } from "../../types";

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

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

const MetadataSection = styled.div`
  margin: 0.5rem 0 1.5rem;
  font-size: 0.8rem;
  color: #95a5a6;
  display: flex;
  gap: 1.5rem;
`;

const MetadataItem = styled.span`
  display: inline-flex;
  gap: 0.3rem;
`;

const MetadataLabel = styled.span`
  color: #3498db;
`;

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const WikiPageView = () => {
  const { campaignId, urlId } = useParams();
  console.log("URL Parameters:", { campaignId, urlId });
  const { user } = useAuth0();
  const navigate = useNavigate();

  // State management
  const [page, setPage] = useState<WikiPage | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    showInSidebar: false,
  });

  // Fetch page data and check permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId || !urlId) return;

      console.log("Constructing query with:", {
        campaignTitle: campaign?.title,
        campaignId,
        urlId,
      });
      // Fetch page data by urlId
      const pageQuery = query(
        collection(db, collections.wikiPages),
        where("campaignId", "==", campaignId),
        where("urlId", "==", urlId)
      );

      const pageSnapshot = await getDocs(pageQuery);
      if (!pageSnapshot.empty) {
        const pageDoc = pageSnapshot.docs[0];
        const pageData = { id: pageDoc.id, ...pageDoc.data() } as WikiPage;
        console.log("Page data:", pageData);
        setPage(pageData);
        setFormData({
          title: pageData.title,
          body: pageData.body,
          showInSidebar: pageData.showInSidebar || false,
        });
      }

      console.log(
        "Page Snapshot:",
        pageSnapshot.docs.map((doc) => doc.data())
      );

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
  }, [campaignId, urlId, user]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlId) return;

    try {
      await updateDoc(doc(db, collections.wikiPages, urlId), {
        ...formData,
        updatedAt: new Date(),
      });

      // Update local state and exit edit mode
      setPage((prev) => (prev ? { ...prev, ...formData } : null));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating page:", error);
    }
  };

  // Add delete handler
  const handleDelete = async () => {
    if (!urlId || !window.confirm("Are you sure you want to delete this page?"))
      return;

    try {
      await deleteDoc(doc(db, collections.wikiPages, urlId));
      navigate(`/campaigns/${campaignId}/wiki`);
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  if (!page) return <div>Loading...</div>;

  ///////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <PageContainer>
      <BreadcrumbNav>
        <BreadcrumbLink to={`/campaigns/${campaignId}`}>
          {campaign?.title || "Campaign"}
        </BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbLink to={`/campaigns/${campaignId}/wiki`}>
          Wiki Pages
        </BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <span>{page?.title}</span>
      </BreadcrumbNav>
      {isEditing ? (
        <EditForm onSubmit={handleSubmit}>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Page Title"
            required
          />

          <Textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Page Content"
            required
          />

          <div style={{ margin: "1rem 0" }}>
            <input
              type="checkbox"
              id="showInSidebar"
              name="showInSidebar"
              checked={formData.showInSidebar}
              onChange={handleChange}
            />
            <label htmlFor="showInSidebar"> Show in Sidebar</label>
          </div>

          <Button type="submit">Save Changes</Button>
          <Button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </EditForm>
      ) : (
        <ContentView>
          <h1>{page.title}</h1>

          <MetadataSection>
            <MetadataItem>
              <MetadataLabel>Created:</MetadataLabel>
              {page.createdAt.toDate().toLocaleDateString()}
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Last Modified:</MetadataLabel>
              {page.updatedAt.toDate().toLocaleDateString()}
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Status:</MetadataLabel>
              {page.showInSidebar ? "In sidebar" : "Hidden"}
            </MetadataItem>
          </MetadataSection>

          <div>{page.body}</div>

          {hasEditAccess && (
            <ActionButtons>
              <Button onClick={() => setIsEditing(true)}>Edit Page</Button>
              <DeleteButton onClick={handleDelete}>Delete Page</DeleteButton>
            </ActionButtons>
          )}
        </ContentView>
      )}
    </PageContainer>
  );
};

export default WikiPageView;
