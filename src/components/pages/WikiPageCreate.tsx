import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, collections } from "../../services/firebase";

const FormContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #2c3e50;
  border-radius: 8px;
  color: white;
`;

const Input = styled.input`
  width: ${(props) => (props.type === "checkbox" ? "auto" : "100%")};
  padding: 0.75rem;
  margin: 0.5rem 0 1rem;
  border-radius: 4px;
  border: 1px solid #34495e;
  background-color: #34495e;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0 1rem;
  border-radius: 4px;
  border: 1px solid #34495e;
  background-color: #34495e;
  color: white;
  font-size: 1rem;
  min-height: 300px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const SubmitButton = styled.button`
  background-color: #2ecc71;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #27ae60;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const WikiPageCreate = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    showInSidebar: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const generateUrlId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;

    setIsSubmitting(true);

    try {
      const urlId = generateUrlId(formData.title);

      // Check for existing page with same urlId
      const existingPageQuery = query(
        collection(db, collections.wikiPages),
        where("campaignId", "==", campaignId),
        where("urlId", "==", urlId)
      );

      const existingPage = await getDocs(existingPageQuery);
      if (!existingPage.empty) {
        alert("A page with this name already exists in this campaign!");
        setIsSubmitting(false);
        return;
      }

      const docRef = await addDoc(collection(db, collections.wikiPages), {
        ...formData,
        urlId,
        campaignId,
        creatorId: user?.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate(`/campaigns/${campaignId}/wiki/${urlId}`);
    } catch (error) {
      console.error("Error creating wiki page:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <h1>Create New Wiki Page</h1>
      <form onSubmit={handleSubmit}>
        <FormField>
          <label htmlFor="title">Page Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter page title"
          />
        </FormField>

        <FormField>
          <label htmlFor="body">Content</label>
          <Textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
            placeholder="Write your page content here"
          />
        </FormField>

        <CheckboxContainer>
          <Input
            type="checkbox"
            id="showInSidebar"
            name="showInSidebar"
            checked={formData.showInSidebar}
            onChange={handleChange}
          />
          <label htmlFor="showInSidebar">Show in Sidebar</label>
        </CheckboxContainer>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Page"}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default WikiPageCreate;
