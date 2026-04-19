// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link // Keep Link for internal navigation within components like Dashboards
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Layout component
import Layout from './components/Layout/Layout'; // Adjust path if you created it elsewhere

// Pages (imports remain the same)
import HomePage from './pages/HomePage';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import FindFreelancerPage from './pages/freelancer/FindFreelancerPage';
import CreateProjectPage from './pages/client/CreateProjectPage';
import MyProjectsPage from './pages/client/MyProjectsPage';
import EditProjectPage from './pages/client/EditProjectPage';
import ReviewPage from './pages/client/ReviewPage';
import ProjectBidAnalytics from './pages/client/ProjectBidAnalytics';
import ChatListPage from './pages/freelancer/ChatList'; // Corrected path assumption
import ChatPage from './pages/ChatPage';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import EnhancedAnalyticsDashboard from './pages/admin/EnhancedAnalyticsDashboard';
import VerificationDashboard from './pages/admin/VerificationDashboard';
import VerificationDetails from './pages/admin/VerificationDetails';
import NotificationManagement from './pages/admin/NotificationManagement';
import NotificationsList from './pages/notifications/NotificationsList';
import NotificationPreferences from './pages/notifications/NotificationPreferences';
// NotificationBell is now used in Layout.jsx
import ProfilePage from './pages/freelancer/ProfilePage';
import BidAnalytics from './pages/freelancer/BidAnalytics';
import ProjectBiddingPage from './pages/freelancer/ProjectBiddingPage';
import AvailableProjectsPage from './pages/freelancer/AvailableProjectsPage';
import ClientBidsPage from './pages/client/ClientBidsPage';
import projectService from './services/projectService';
import FreelancerProjectsPage from './pages/freelancer/FreelancerProjectsPage';
import FreelancerTimelineOverviewPage from './pages/freelancer/FreelancerTimelineOverviewPage';
import FreelancerProjectViewPage from './pages/freelancer/FreelancerProjectViewPage';

// ProtectedRoute wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <span className="ml-3 text-xl text-gray-700">Loading…</span>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    // Redirect to their specific dashboard based on role
    if (user.role === 'client') return <Navigate to="/client/dashboard" replace />;
    if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />; // Fallback
  }
  return children;
};

// Dashboard Components (Refactored for content and sub-navigation)
const ClientDashboard = () => {
  const { user } = useAuth(); // Logout is in global Navbar
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?._id) return; // Ensure user is available
      try {
        setLoading(true);
        setError('');
        const data = await projectService.getMyProjects();
        const filteredProjects = data.filter(project =>
          project.status !== 'in_progress' && project.status !== 'completed' && project.status !== 'work_submitted'
        );
        setProjects(filteredProjects || []);
      } catch (err) {
        setError(err.message || 'Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  if (!user) return <div className="text-center p-10">Loading user data...</div>;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Client Dashboard</h1>
        {/* NotificationBell is global now */}
      </div>
      <p className="mb-8 text-lg text-gray-600">Welcome back, {user?.name}!</p>

      <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link to="/client/my-projects" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>My Projects</Link>
        <Link to="/client/create-project" className="block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-light)' }}>+ Post New Project</Link>
        <Link to="/client/find-freelancers" className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>Find Freelancers</Link>
      </nav>

      {loading && <p className="text-blue-600">Loading projects...</p>}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

      {!loading && !error && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Projects Awaiting Bids:</h2>
          {projects.length > 0 ? (
            <ul className="space-y-3">
              {projects.map((project) => (
                <li key={project._id} className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Link
                    to={`/client/project/${project._id}/bids`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Bids for "{project.title}"
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">You have no projects currently awaiting bids.</p>
          )}
        </div>
      )}
    </div>
  );
};

const FreelancerDashboard = () => {
  const { user } = useAuth();
  if (!user) return <div className="text-center p-10">Loading user data...</div>;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Freelancer Dashboard</h1>
      </div>
      <p className="mb-8 text-lg text-gray-600">Welcome back, {user?.name}!</p>
      <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link to="/freelancer/profile" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>My Profile</Link>
        <Link to="/freelancer/my-projects" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>My Projects</Link>
        <Link to="/freelancer/project-timelines" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>Project Timelines</Link>
        <Link to="/freelancer/analytics" className="block text-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>Bid Analytics</Link>
        <Link to="/chat" className="block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-light)' }}>Messages</Link>
        <Link to="/freelancer/projects" className="block text-center bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>Browse Projects</Link>
      </nav>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  if (!user) return <div className="text-center p-10">Loading user data...</div>;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <p className="mb-8 text-lg text-gray-600">Welcome, {user?.name}!</p>
      <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link to="/admin/analytics" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>Basic Analytics</Link>
        <Link to="/admin/enhanced-analytics" className="block text-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}>Advanced Analytics</Link>
        <Link to="/admin/verification" className="block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-light)' }}>Freelancer Verification</Link>
        <Link to="/admin/notifications/manage" className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-light)' }}>Notification System</Link>
      </nav>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // If still loading auth status, show a global loader or null to prevent premature rendering of routes
  if (isLoading) {
     return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes: Redirect if logged in */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} replace /> : <SignupPage />} />
      <Route path="/" element={<HomePage />} />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={<ProtectedRoute roles={['client']}><ClientDashboard/></ProtectedRoute>}/>
      <Route path="/client/find-freelancers" element={<ProtectedRoute roles={['client','admin']}><FindFreelancerPage/></ProtectedRoute>}/>
      <Route path="/client/create-project" element={<ProtectedRoute roles={['client']}><CreateProjectPage/></ProtectedRoute>}/>
      <Route path="/client/my-projects" element={<ProtectedRoute roles={['client']}><MyProjectsPage/></ProtectedRoute>}/>
      <Route path="/client/edit-project/:id" element={<ProtectedRoute roles={['client']}><EditProjectPage/></ProtectedRoute>}/>
      <Route path="/client/project/:projectId/review" element={<ProtectedRoute roles={['client']}><ReviewPage/></ProtectedRoute>}/>
      <Route path="/client/project/:projectId/analytics" element={<ProtectedRoute roles={['client']}><ProjectBidAnalytics/></ProtectedRoute>}/>
      <Route path="/client/project/:projectId/bids" element={<ProtectedRoute roles={['client']}><ClientBidsPage/></ProtectedRoute>}/>

      {/* Freelancer Routes */}
      <Route path="/freelancer/dashboard" element={<ProtectedRoute roles={['freelancer']}><FreelancerDashboard/></ProtectedRoute>}/>
      <Route path="/freelancer/projects" element={<ProtectedRoute roles={['freelancer']}><AvailableProjectsPage /></ProtectedRoute>}/>
      <Route path="/freelancer/profile" element={<ProtectedRoute roles={['freelancer']}><ProfilePage/></ProtectedRoute>}/>
      <Route path="/freelancer/project/:projectId/bid" element={<ProtectedRoute roles={['freelancer']}><ProjectBiddingPage/></ProtectedRoute>}/>
      <Route path="/freelancer/project/:projectId/details" element={<ProtectedRoute roles={['freelancer']}><FreelancerProjectViewPage/></ProtectedRoute>}/>
      <Route path="/freelancer/project/:projectId/timeline" element={<ProtectedRoute roles={['freelancer']}><FreelancerProjectViewPage/></ProtectedRoute>}/>
      <Route path="/freelancer/analytics" element={<ProtectedRoute roles={['freelancer']}><BidAnalytics/></ProtectedRoute>}/>
      <Route path="/freelancer/my-projects" element={<ProtectedRoute roles={['freelancer']}><FreelancerProjectsPage/></ProtectedRoute>}/>
      <Route path="/freelancer/project-timelines" element={<ProtectedRoute roles={['freelancer']}><FreelancerTimelineOverviewPage/></ProtectedRoute>}/>

      {/* Chat Routes */}
      <Route path="/chat" element={<ProtectedRoute roles={['client','freelancer','admin']}><ChatListPage/></ProtectedRoute>}/>
      <Route path="/chat/:conversationId" element={<ProtectedRoute roles={['client','freelancer','admin']}><ChatPage/></ProtectedRoute>}/>

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard/></ProtectedRoute>}/>
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsDashboard/></ProtectedRoute>}/>
      <Route path="/admin/enhanced-analytics" element={<ProtectedRoute roles={['admin']}><EnhancedAnalyticsDashboard/></ProtectedRoute>}/>
      <Route path="/admin/verification" element={<ProtectedRoute roles={['admin']}><VerificationDashboard/></ProtectedRoute>}/>
      <Route path="/admin/verification/:freelancerId" element={<ProtectedRoute roles={['admin']}><VerificationDetails/></ProtectedRoute>}/>
      {/* Changed path to avoid conflict with user notifications */}
      <Route path="/admin/notifications/manage" element={<ProtectedRoute roles={['admin']}><NotificationManagement/></ProtectedRoute>}/>

      {/* User Notifications */}
      <Route path="/notifications" element={<ProtectedRoute roles={['client', 'freelancer', 'admin']}><NotificationsList/></ProtectedRoute>}/>
      <Route path="/notifications/preferences" element={<ProtectedRoute roles={['client', 'freelancer', 'admin']}><NotificationPreferences/></ProtectedRoute>}/>

      {/* Fallback Route for unmatched paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout> {/* Wrap AppRoutes with Layout */}
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}