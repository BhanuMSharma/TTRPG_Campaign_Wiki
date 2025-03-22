import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import LoginButton from "../auth/LoginButton";
import UserProfile from "../auth/UserProfile";
import logo from "../../images/logo.png";

// Main navigation container - fixed at the top of the viewport
const NavContainer = styled.nav`
  position: fixed; // Keeps nav bar fixed at top while scrolling
  top: 0;
  left: 0;
  right: 0;
  background-color: #2c3e50;
  padding: 0.25rem;
  color: white;
  z-index: 1000; // Ensures navbar stays above other content
`;

// Centers content and sets maximum width for larger screens
const NavContent = styled.div`
  max-height: 90%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; // Spreads items to opposite ends
  align-items: center; // Vertically centers items
`;

// container for website title/logo
const NavBrandContainer = styled.div`
  display: flex;
  gap: 1rem; // Space between logo and title
  align-items: center; // Vertically centers items
`;

// Website title styling
const NavBrand = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  &:hover {
    color: #ecf0f1; // Subtle hover effect
  }
`;

// logo image styling
const LogoPicture = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid white;
`;

// Container for navigation links and auth buttons
const NavLinks = styled.div`
  display: flex;
  gap: 1rem; // Spaces out navigation items
  align-items: center;
`;

/*// Individual navigation link styling
const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  &:hover {
    color: #ecf0f1; // Subtle hover effect
  }
`; */

const Navbar = () => {
  // Hook from Auth0 to check if user is logged in
  const { isAuthenticated } = useAuth0();

  return (
    <NavContainer>
      <NavContent>
        <NavBrandContainer>
          <NavBrand to="/">
            <LogoPicture src={logo} alt="Logo" />
          </NavBrand>
          {/* Brand links to home page */}
          <NavBrand to="/">TTRPG Campaign Wiki</NavBrand>
        </NavBrandContainer>
        <NavLinks>
          {/* Conditional rendering based on auth status */}
          {isAuthenticated ? <UserProfile /> : <LoginButton />}
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
