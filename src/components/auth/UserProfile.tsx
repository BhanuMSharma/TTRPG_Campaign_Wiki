import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import { useState } from "react";

// Main container for the profile section - uses flexbox for alignment
const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Circular profile picture styling with white border
const ProfilePicture = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
`;

// Container that manages the dropdown functionality
const DropdownMenu = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

// Dropdown panel that appears when clicked
// Uses a TypeScript prop to control visibility
const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  right: 0;
  background-color: #2c3e50;
  min-width: 160px;
  border-radius: 4px;
  padding: 0.5rem 0;
  z-index: 1000;
  margin-top: 0.5rem;
`;

// Individual items within the dropdown menu
const DropdownItem = styled.div`
  padding: 0.5rem 1rem;
  color: white;

  &:hover {
    background-color: #34495e;
  }
`;

// Special styling for the logout button within the dropdown
const LogoutButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #c0392b;
  }
`;

const UserProfile = () => {
  // Get user data and logout function from Auth0
  const { user, logout } = useAuth0();
  // State to track if dropdown is open or closed
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <ProfileContainer>
      {/* Dropdown menu container that toggles on click */}
      <DropdownMenu onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {/* User info display section */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Only show profile picture if one exists */}
          {user?.picture && (
            <ProfilePicture
              src={user.picture}
              alt={user.name || "User profile"}
            />
          )}
          {/* Display user's name or fall back to email */}
          <span>{user?.name || user?.email}</span>
        </div>

        {/* Dropdown content - visibility controlled by isOpen prop */}
        <DropdownContent isOpen={isDropdownOpen}>
          {/* Navigation options */}
          <DropdownItem>Profile Settings</DropdownItem>
          <DropdownItem>My Campaigns</DropdownItem>
          {/* Logout button with Auth0 logout functionality */}
          <LogoutButton
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin, // Returns user to homepage after logout
                },
              })
            }
          >
            Log Out
          </LogoutButton>
        </DropdownContent>
      </DropdownMenu>
    </ProfileContainer>
  );
};

export default UserProfile;
