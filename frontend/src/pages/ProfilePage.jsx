import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profiles, setProfiles, activeProfile, setActiveProfile } = useAuthStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [editingProfile, setEditingProfile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsKids, setEditIsKids] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const openEdit = (profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditIsKids(profile.isKids);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userApi.updateProfile(editingProfile.id, {
        name: editName,
        isKids: editIsKids,
        avatarUrl: editingProfile.avatarUrl
      });
      
      const newProfiles = profiles.map(p => p.id === updated.id ? updated : p);
      setProfiles(newProfiles);
      
      if (activeProfile?.id === updated.id) {
        setActiveProfile(updated);
      }
      
      toast.success('Profile updated');
      setEditingProfile(null);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ethos-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="text-ethos-muted hover:text-white transition-colors">
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h1 className="text-4xl font-space font-bold text-white">Manage Profiles</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-ethos-muted hover:text-ethos-danger hover:bg-red-500/10">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out Account
          </Button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {profiles.map(profile => (
            <div key={profile.id} className="flex flex-col items-center bg-ethos-surface p-6 rounded-xl border border-ethos-border relative group">
              <div className="relative mb-4">
                <Avatar src={profile.avatarUrl} fallback={profile.name?.[0]} size="lg" className="w-24 h-24 text-3xl" />
                <button 
                  onClick={() => openEdit(profile)}
                  className="absolute bottom-0 right-0 p-2 bg-ethos-teal text-ethos-bg rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-medium text-white text-center">{profile.name}</h3>
              {profile.isKids && <span className="text-xs text-ethos-teal mt-1">Kids</span>}
              {activeProfile?.id === profile.id && (
                <span className="absolute top-4 right-4 w-3 h-3 bg-ethos-success rounded-full" title="Active Profile"></span>
              )}
            </div>
          ))}

          {profiles.length < 5 && (
            <div 
              onClick={() => navigate('/profiles')}
              className="flex flex-col items-center justify-center bg-ethos-elevated border-2 border-dashed border-ethos-border hover:border-ethos-white p-6 rounded-xl cursor-pointer group transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-ethos-surface flex items-center justify-center mb-4 group-hover:bg-ethos-border transition-colors">
                <Plus className="w-8 h-8 text-ethos-muted group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-medium text-ethos-muted group-hover:text-white transition-colors">Add Profile</h3>
            </div>
          )}
        </div>

      </div>

      <Modal isOpen={!!editingProfile} onClose={() => setEditingProfile(null)} title="Edit Profile">
        <form onSubmit={handleSaveEdit} className="space-y-6">
          <Input
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editIsKids}
              onChange={(e) => setEditIsKids(e.target.checked)}
              className="w-5 h-5 rounded border-ethos-border text-ethos-teal focus:ring-ethos-teal bg-ethos-bg"
            />
            <span className="text-ethos-white">Kids Profile</span>
          </label>
          <div className="flex justify-end space-x-4">
            <Button variant="ghost" type="button" onClick={() => setEditingProfile(null)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
