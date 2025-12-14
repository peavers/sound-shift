import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DevicesPage from "./pages/DevicesPage";
import GroupsPage from "./pages/GroupsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/groups" replace />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
