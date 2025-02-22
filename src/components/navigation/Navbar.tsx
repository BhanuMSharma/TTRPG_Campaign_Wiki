import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import LoginButton from "../auth/LoginButton";
import UserProfile from "../auth/UserProfile";

// Main navigation container - fixed at the top of the viewport
const NavContainer = styled.nav`
  position: fixed; // Keeps nav bar fixed at top while scrolling
  top: 0;
  left: 0;
  right: 0;
  background-color: #2c3e50;
  padding: 1rem;
  color: white;
  z-index: 1000; // Ensures navbar stays above other content
`;

// Centers content and sets maximum width for larger screens
const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; // Spreads items to opposite ends
  align-items: center; // Vertically centers items
`;

// Website title/logo styling
const NavBrand = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  &:hover {
    color: #ecf0f1; // Subtle hover effect
  }
`;

// Container for navigation links and auth buttons
const NavLinks = styled.div`
  display: flex;
  gap: 1rem; // Spaces out navigation items
  align-items: center;
`;

// Individual navigation link styling
const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  &:hover {
    color: #ecf0f1; // Subtle hover effect
  }
`;

const Navbar = () => {
  // Hook from Auth0 to check if user is logged in
  const { isAuthenticated } = useAuth0();

  return (
    <NavContainer>
      <NavContent>
        {/* Brand links to home page */}
        <NavBrand to="/">D&D Campaign Wiki</NavBrand>
        <NavLinks>
          {/* Navigation link to campaigns list */}
          <NavLink to="/campaigns">Campaigns</NavLink>
          {/* Conditional rendering based on auth status */}
          {isAuthenticated ? <UserProfile /> : <LoginButton />}
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
