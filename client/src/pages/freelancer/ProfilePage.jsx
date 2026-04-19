// client/src/pages/freelancer/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import profileService from '../../services/profileService';

const ProfilePage = () => {
  const [form, setForm] = useState({
    name: '', bio: '', skills: '', hourlyRate: '', portfolioItems: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await profileService.getMyProfile();
        setForm({
          name: p.name || '',
          bio: p.bio || '',
          skills: (p.skills || []).join(', '),
          hourlyRate: p.hourlyRate || '',
          portfolioItems: p.portfolio || []
        });
      } catch (e) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        skills: form.skills,
        hourlyRate: parseFloat(form.hourlyRate),
        portfolioItems: form.portfolioItems
      };
      await profileService.updateMyProfile(payload);
      alert('Profile saved');
    } catch {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block">Name</label>
          <input name="name" value={form.name} onChange={handleChange}
            className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange}
            className="w-full border px-2 py-1 rounded" rows={3} />
        </div>
        <div>
          <label className="block">Skills (comma-separated)</label>
          <input name="skills" value={form.skills} onChange={handleChange}
            className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block">Hourly Rate ($)</label>
          <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange}
            className="w-full border px-2 py-1 rounded" />
        </div>
        {/* Portfolio management could be more complex; omitted for brevity */}
        <button type="submit" disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
