import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import styled from "@emotion/styled";
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
        <AppContent />
      </Auth0Provider>
    </Router>
  );
}

// Content component that uses router hooks
function AppContent() {
  const location = useLocation();
  const showSidebar =
    location.pathname.includes("/campaigns/") &&
    !location.pathname.endsWith("/create");

  return (
    <AppContainer>
      <Navbar />
      <Routes>
        <Route path="/" element={<CampaignList />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/create" element={<CampaignCreate />} />
        <Route
          path="/campaigns/:campaignId/*"
          element={
            <Layout>
              {showSidebar && <Sidebar />}
              <MainContent hasSidebar={showSidebar}>
                <Routes>
                  <Route path="/" element={<CampaignHome />} />
                  <Route path="wiki/create" element={<WikiPageCreate />} />
                  <Route path="wiki/:pageId" element={<WikiPageView />} />
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
