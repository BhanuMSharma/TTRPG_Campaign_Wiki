import { useAuth0 } from "@auth0/auth0-react";
import styled from "@emotion/styled";
import { getTheme } from "../../theme/index.ts";
import { useState, useEffect } from "react";
import headImage from "../../images/T_2_head_gladiator_.png";

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

// styled components for the tooltip
const Tooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  background-color: #87c7ff;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  z-index: 100;
  top: calc(100% + 5px);
  right: 0;
  white-space: nowrap;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;

  &:after {
    content: "";
    position: absolute;
    top: -5px;
    right: 15px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #87c7ff;
  }
`;

const UserProfile = () => {
  // Get user data and logout function from Auth0
  const { user, logout } = useAuth0();
  // State to track if dropdown is open or closed
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State to track if tooltip is visible
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("");

  const image = user?.picture != null ? user.picture : headImage;

  // Function to show tooltip with a message
  const displayTooltip = (message: string) => {
    setTooltipMessage(message);
    setShowTooltip(true);

    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Prevent dropdown toggle when clicking inside the dropdown
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <ProfileContainer>
      {/* Dropdown menu container that toggles on click */}
      <DropdownMenu
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        {/* User info display section */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Only show profile picture if one exists */}
          {user?.picture && (
            <ProfilePicture
              src={image}
              alt="" //{user.name || "User profile"}
            />
          )}
          {/* Display user's name or fall back to email */}
          <span>{user?.name || user?.email}</span>
        </div>

        {/* Tooltip component */}
        <Tooltip isVisible={showTooltip}>{tooltipMessage}</Tooltip>

        {/* Dropdown content - visibility controlled by isOpen prop */}
        <DropdownContent isOpen={isDropdownOpen} onClick={handleDropdownClick}>
          {/* Navigation options */}
          <DropdownItem
            onClick={() => {
              displayTooltip("Profile settings coming soon!");
              setIsDropdownOpen(false);
            }}
          >
            Profile Settings
          </DropdownItem>
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
