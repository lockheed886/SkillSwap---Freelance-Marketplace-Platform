import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-white shadow-xl rounded-lg p-8 md:p-12 text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
        Welcome to <span className="text-indigo-600">SkillSwap</span>!
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
        The premier platform connecting clients with top-tier freelancers. Whether you're looking to hire for a project or find your next gig, SkillSwap is your gateway to success.
      </p>

      {isAuthenticated ? (
        <div className="mt-8">
          <p className="text-2xl mb-6 font-semibold text-gray-700">Hello, {user?.name}! Ready to dive in?</p>
          {user?.role === 'client' && (
            <Link
              to="/client/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
            >
              Go to Client Dashboard
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link
              to="/freelancer/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
            >
              Go to Freelancer Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
            >
              Go to Admin Dashboard
            </Link>
          )}
        </div>
      ) : (
        <div className="auth-buttons flex flex-col sm:flex-row justify-center items-center sm:space-x-8 space-y-4 sm:space-y-0">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' }}
          >
            Sign Up
          </Link>
        </div>
      )}

      <div className="mt-16 pt-10 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose SkillSwap?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-3">Discover Talent</h3>
            <p className="text-gray-600">Access a vast pool of verified freelancers skilled in diverse fields. Find the perfect match for your project requirements with ease.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold text-green-700 mb-3">Find Opportunities</h3>
            <p className="text-gray-600">Freelancers can explore a wide array of projects, bid on opportunities that match their skills, and grow their portfolio.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold text-purple-700 mb-3">Secure & Streamlined</h3>
            <p className="text-gray-600">Enjoy a secure platform with streamlined communication, project management, and payment processes for peace of mind.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;