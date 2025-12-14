import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DevicesPage from "./pages/DevicesPage";
import GroupsPage from "./pages/GroupsPage";
import SettingsPage from "./pages/SettingsPage";

// Redirect component that preserves query parameters
function RedirectWithParams({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={to + location.search} replace />;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RedirectWithParams to="/groups" />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
