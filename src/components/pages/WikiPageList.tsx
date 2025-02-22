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
import { WikiPage, Campaign } from "../../types";

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

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

const WikiCardContainer = styled.div`
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

const WikiCardContent = styled(Link)`
  color: white;
  text-decoration: none;
  display: block;
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

const LastUpdated = styled.span`
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

const WikiPageList = () => {
  const navigate = useNavigate();

  const { campaignId } = useParams();
  const { user } = useAuth0();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [hasEditAccess, setHasEditAccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) return;
      console.log("campaignId:", campaignId);

      try {
        const campaignDoc = await getDoc(
          doc(db, collections.campaigns, campaignId)
        );
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

        const pagesQuery = query(
          collection(db, collections.wikiPages),
          where("campaignId", "==", campaignId),
          orderBy("updatedAt", "desc")
        );
        console.log("Pages Query:", pagesQuery);

        const pagesSnapshot = await getDocs(pagesQuery);
        console.log("Raw Pages Snapshot:", pagesSnapshot.docs);
        const pagesData = pagesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            urlId: data.urlId, // explicitly include urlId
            title: data.title,
            body: data.body,
            campaignId: data.campaignId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            showInSidebar: data.showInSidebar,
          } as WikiPage;
        });

        setPages(pagesData);
        console.log("Mapped Pages Data:", pagesData);
      } catch (error) {
        console.error("Error fetching wiki pages:", error);
      }
    };

    fetchData();
  }, [campaignId, user]);

  // Add delete handler
  const handleDelete = async (pageId: string) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    try {
      await deleteDoc(doc(db, collections.wikiPages, pageId));
      setPages(pages.filter((page) => page.id !== pageId));
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  return (
    <PageContainer>
      <BreadcrumbNav>
        <BreadcrumbLink to={`/campaigns/${campaignId}`}>
          {campaign?.title || "Campaign"}
        </BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <span>Wiki Pages</span>
      </BreadcrumbNav>
      <HeaderSection>
        <h1>Wiki Pages</h1>
        {hasEditAccess && (
          <CreateButton to={`/campaigns/${campaignId}/wiki/create`}>
            Create New Page
          </CreateButton>
        )}
      </HeaderSection>

      {pages.map((page) => {
        console.log("Rendering page:", {
          title: page.title,
          urlId: page.urlId,
        });
        return (
          <WikiCardContainer key={page.id}>
            <WikiCardContent to={`/campaigns/${campaignId}/wiki/${page.urlId}`}>
              <h2>{page.title}</h2>
              <LastUpdated>
                Last Updated: {page.updatedAt.toDate().toLocaleDateString()}
              </LastUpdated>
              <p>{page.body.substring(0, 150)}...</p>
            </WikiCardContent>

            {hasEditAccess && (
              <ActionButtons>
                <Button
                  onClick={() =>
                    navigate(`/campaigns/${campaignId}/wiki/${page.urlId}`)
                  }
                >
                  Edit
                </Button>
                <DeleteButton onClick={() => handleDelete(page.id)}>
                  Delete
                </DeleteButton>
              </ActionButtons>
            )}
          </WikiCardContainer>
        );
      })}

      {pages.length === 0 && (
        <p>No wiki pages yet. {hasEditAccess && "Create your first page!"}</p>
      )}
    </PageContainer>
  );
};

export default WikiPageList;
