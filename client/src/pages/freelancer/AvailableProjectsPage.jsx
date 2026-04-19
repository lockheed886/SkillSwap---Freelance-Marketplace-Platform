// client/src/pages/freelancer/AvailableProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Import the named function instead of the default export
import { getOpenProjects } from '../../services/projectService';

const AvailableProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getOpenProjects()
      .then(data => {
        setProjects(data);
      })
      .catch(err => {
        console.error('Failed to load open projects:', err);
        setError(err.message || 'Failed to load projects');
      });
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Available Projects</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Available Projects</h1>
      {projects.length === 0 ? (
        <p className="text-gray-600">No open projects at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(proj => (
            <div key={proj._id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">{proj.title}</h2>
              <p className="text-gray-600 mb-4">{proj.description}</p>
              <Link
                to={`/freelancer/project/${proj._id}/bid`}
                className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Place a Bid
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableProjectsPage;
