import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell'; // Make sure this path is correct

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="w-1/3">
          {/* Empty div for left side spacing */}
        </div>
        <div className="w-1/3 flex justify-center">
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors" style={{ color: 'white', textDecoration: 'none' }}>
            SkillSwap
          </Link>
        </div>
        <div className="w-1/3 flex justify-end items-center space-x-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'client' && <Link to="/client/dashboard" className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>}
              {user?.role === 'freelancer' && <Link to="/freelancer/dashboard" className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>}
              {user?.role === 'admin' && <Link to="/admin/dashboard" className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>}
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--error-color)', color: 'var(--text-light)' }}
              >
                Logout ({user?.name})
              </button>
            </>
          ) : (
            <>
              {/* Login and signup buttons removed */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-300 text-center p-6 mt-auto">
        © {new Date().getFullYear()} SkillSwap. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;