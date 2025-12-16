import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Leads from './pages/Leads';
import Amc from './pages/Amc';
import Complaints from './pages/Complaints';
import Referrals from './pages/Referrals';
import Posts from './pages/Posts';
import Data from './pages/Data';
import Pulse from './pages/Pulse';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="data" element={<Data />} />
          <Route path="staff" element={<Staff />} />
          <Route path="leads" element={<Leads />} />
          <Route path="amc" element={<Amc />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="posts" element={<Posts />} />
          <Route path="pulse" element={<Pulse />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
