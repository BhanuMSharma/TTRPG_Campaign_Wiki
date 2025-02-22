import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import { collection, addDoc } from "firebase/firestore";
import { db, collections } from "../../services/firebase";

// Main form container with card-like appearance
const FormContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #2c3e50;
  border-radius: 8px;
  color: white;
`;

// Style for form inputs
// Update the Input styled component to handle checkbox width
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

// Style for the description textarea
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0 1rem;
  border-radius: 4px;
  border: 1px solid #34495e;
  background-color: #34495e;
  color: white;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

// Form field container for consistent spacing
const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

// Checkbox container for alignment
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

// Submit button styling
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

const CampaignCreate = () => {
  // Navigation hook for redirecting after creation
  const navigate = useNavigate();
  // Get user information from Auth0
  const { user } = useAuth0();

  // Form state management
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
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
    setIsSubmitting(true);

    try {
      // Create new campaign document in Firebase
      const docRef = await addDoc(collection(db, collections.campaigns), {
        ...formData,
        creatorId: user?.sub,
        createdAt: new Date(),
        authorizedUsers: [user?.sub], // Array of users who can access this campaign
        updatedAt: new Date(),
      });

      // Redirect to the new campaign page
      navigate(`/campaigns/${docRef.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <h1>Create New Campaign</h1>
      <form onSubmit={handleSubmit}>
        <FormField>
          <label htmlFor="title">Campaign Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter campaign title"
          />
        </FormField>

        <FormField>
          <label htmlFor="description">Description</label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe your campaign"
          />
        </FormField>

        <CheckboxContainer>
          <Input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
          />
          <label htmlFor="isPublic">Make this campaign public</label>
        </CheckboxContainer>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Campaign"}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default CampaignCreate;
