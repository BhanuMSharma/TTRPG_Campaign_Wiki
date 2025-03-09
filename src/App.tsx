import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./theme";
import Navbar from "./components/navigation/Navbar";
import Sidebar from "./components/navigation/Sidebar";
import CampaignCreate from "./components/campaign/CampaignCreate";
import CampaignList from "./components/campaign/CampaignList";
import CampaignHome from "./components/campaign/CampaignHome";
import WikiPageCreate from "./components/pages/WikiPageCreate";
import WikiPageView from "./components/pages/WikiPageView";
import WikiPageList from "./components/pages/WikiPageList";
import AdventureLogCreate from "./components/pages/AdventureLogCreate";
import AdventureLogView from "./components/pages/AdventureLogView";
import AdventureLogList from "./components/pages/AdventureLogList";

//toggle button for sidebar
const SidebarToggle = styled.button`
  position: fixed;
  top: 70px;
  left: 10px;
  z-index: 1000;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const MainContent = styled.div<{ hasSidebar: boolean }>`
  padding-top: 60px; // Space for fixed navbar
  margin-left: ${(props) => (props.hasSidebar ? "250px" : "0")};
  width: 100%;
`;

const Layout = styled.div`
  display: flex;
`;

// Main App component that sets up providers
function App() {
  return (
    <Router>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <ThemeProvider theme={theme}>
          <AppContent />
        </ThemeProvider>
      </Auth0Provider>
    </Router>
  );
}

// Content component that uses router hooks
function AppContent() {
  const location = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const showSidebar =
    location.pathname.includes("/campaigns/") &&
    !location.pathname.endsWith("/create");

  // Check for mobile device and set initial sidebar visibility
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <AppContainer>
      <Navbar />
      {showSidebar && isMobile && (
        <SidebarToggle onClick={toggleSidebar}>
          {isSidebarVisible ? "✕" : "☰"}
        </SidebarToggle>
      )}
      <Routes>
        <Route path="/" element={<CampaignList />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/create" element={<CampaignCreate />} />
        <Route
          path="/campaigns/:campaignId/*"
          element={
            <Layout>
              {showSidebar && <Sidebar isVisible={isSidebarVisible} />}
              <MainContent hasSidebar={showSidebar && !isMobile}>
                <Routes>
                  <Route path="/" element={<CampaignHome />} />
                  <Route path="wiki/create" element={<WikiPageCreate />} />
                  <Route path="wiki/:urlId" element={<WikiPageView />} />
                  <Route path="wiki" element={<WikiPageList />} />
                  <Route path="logs/create" element={<AdventureLogCreate />} />
                  <Route path="logs/:logId" element={<AdventureLogView />} />
                  <Route path="logs" element={<AdventureLogList />} />
                </Routes>
              </MainContent>
            </Layout>
          }
        />
      </Routes>
    </AppContainer>
  );
}

export default App;
