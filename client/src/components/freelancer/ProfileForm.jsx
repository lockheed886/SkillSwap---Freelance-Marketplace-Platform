// client/src/components/freelancer/ProfileForm.jsx
import React, { useState } from 'react';

export default function ProfileForm({ initial, onSave, saving }) {
  const [bio, setBio] = useState(initial.bio || '');
  const [skills, setSkills] = useState((initial.skills || []).join(', '));
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate || '');
  const [portfolio, setPortfolio] = useState(initial.portfolio || []);
  const [error, setError] = useState('');

  // Handler to add a blank portfolio entry
  const addEntry = () =>
    setPortfolio([...portfolio, { title: '', description: '', url: '', imageUrl: '', category: '' }]);

  const updateEntry = (idx, field, value) => {
    const copy = [...portfolio];
    copy[idx][field] = value;
    setPortfolio(copy);
  };

  const removeEntry = idx => {
    const copy = [...portfolio];
    copy.splice(idx, 1);
    setPortfolio(copy);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Basic validation
    if (!bio.trim()) return setError('Bio cannot be empty');
    onSave({
      bio,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate: parseFloat(hourlyRate),
      portfolio
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="w-full border rounded px-2 py-1"
          rows={4}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Skills (comma separated)</label>
        <input
          value={skills}
          onChange={e => setSkills(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Hourly Rate ($)</label>
        <input
          type="number"
          value={hourlyRate}
          onChange={e => setHourlyRate(e.target.value)}
          className="w-full border rounded px-2 py-1"
          min="0"
          step="0.01"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Portfolio</label>
        {portfolio.map((item, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              placeholder="Title"
              value={item.title}
              onChange={e => updateEntry(idx, 'title', e.target.value)}
              className="w-full border rounded px-2 py-1 mb-1"
            />
            <input
              placeholder="Category"
              value={item.category}
              onChange={e => updateEntry(idx, 'category', e.target.value)}
              className="w-full border rounded px-2 py-1 mb-1"
            />
            <textarea
              placeholder="Description"
              value={item.description}
              onChange={e => updateEntry(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1 mb-1"
              rows={2}
            />
            <input
              placeholder="URL"
              value={item.url}
              onChange={e => updateEntry(idx, 'url', e.target.value)}
              className="w-full border rounded px-2 py-1 mb-1"
            />
            <input
              placeholder="Image URL"
              value={item.imageUrl}
              onChange={e => updateEntry(idx, 'imageUrl', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="text-indigo-600 text-sm"
        >
          + Add Portfolio Item
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}
