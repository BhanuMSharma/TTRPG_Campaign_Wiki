import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";

// Styled button component with consistent design
const AuthButton = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  // Hover effect for better interactivity
  &:hover {
    background-color: #27ae60;
  }
`;

const LoginButton = () => {
  // Get login function from Auth0
  const { loginWithRedirect } = useAuth0();

  return (
    <AuthButton
      // When clicked, triggers Auth0's login modal
      onClick={() => loginWithRedirect()}
    >
      Log In
    </AuthButton>
  );
};

export default LoginButton;
