import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import { collection, addDoc } from "firebase/firestore";
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
  width: 100%;
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

const DateInput = styled(Input)`
  width: auto;
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

const AdventureLogCreate = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    sessionDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;

    setIsSubmitting(true);

    try {
      const urlId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const docRef = await addDoc(collection(db, collections.adventureLogs), {
        ...formData,
        urlId,
        campaignId,
        creatorId: user?.sub,
        sessionDate: new Date(formData.sessionDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate(`/campaigns/${campaignId}/logs/${urlId}`);
    } catch (error) {
      console.error("Error creating adventure log:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <h1>Create New Adventure Log</h1>
      <form onSubmit={handleSubmit}>
        <FormField>
          <label htmlFor="title">Session Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter session title"
          />
        </FormField>

        <FormField>
          <label htmlFor="sessionDate">Session Date</label>
          <DateInput
            type="date"
            id="sessionDate"
            name="sessionDate"
            value={formData.sessionDate}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField>
          <label htmlFor="body">Session Notes</label>
          <Textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
            placeholder="Write your session notes here"
          />
        </FormField>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Log"}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default AdventureLogCreate;
