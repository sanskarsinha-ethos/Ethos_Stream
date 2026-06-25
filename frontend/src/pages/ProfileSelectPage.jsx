import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function ProfileSelectPage() {
  const { profiles, setProfiles, setActiveProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await userApi.getProfiles();
        setProfiles(data);
      } catch (err) {
        toast.error('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfiles();
  }, [setProfiles]);

  const handleSelect = (profile) => {
    setActiveProfile(profile);
    navigate('/browse');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newProfile = await userApi.createProfile({
        name: newProfileName,
        isKids,
        avatarUrl: null
      });
      setProfiles([...profiles, newProfile]);
      setIsModalOpen(false);
      setNewProfileName('');
      setIsKids(false);
      toast.success('Profile created');
    } catch (err) {
      toast.error('Failed to create profile');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ethos-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-space font-bold text-white mb-10">Who's watching?</h1>
        
        {isLoading ? (
          <div className="flex justify-center space-x-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-ethos-elevated mb-4"></div>
                <div className="w-20 h-4 bg-ethos-elevated rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {profiles.map((profile) => (
              <motion.button
                key={profile.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(profile)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div className="w-32 h-32 mb-4 rounded-full border-4 border-transparent group-hover:border-ethos-teal transition-colors">
                  <Avatar src={profile.avatarUrl} fallback={profile.name?.[0]} size="lg" className="w-full h-full text-4xl" />
                </div>
                <span className="text-ethos-muted group-hover:text-white text-lg font-medium transition-colors">
                  {profile.name}
                </span>
                {profile.isKids && <span className="text-xs text-ethos-teal mt-1">Kids</span>}
              </motion.button>
            ))}

            {profiles.length < 5 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div className="w-32 h-32 mb-4 rounded-full border-2 border-dashed border-ethos-border group-hover:border-ethos-white flex items-center justify-center transition-colors">
                  <Plus className="w-12 h-12 text-ethos-muted group-hover:text-white transition-colors" />
                </div>
                <span className="text-ethos-muted group-hover:text-white text-lg font-medium transition-colors">
                  Add Profile
                </span>
              </motion.button>
            )}
          </div>
        )}

        <Link to="/profile" className="inline-block px-6 py-2 border border-ethos-border text-ethos-muted hover:text-white hover:border-white transition-colors uppercase tracking-widest text-sm">
          Manage Profiles
        </Link>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Profile">
        <form onSubmit={handleCreate} className="space-y-6">
          <Input
            label="Name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            required
            placeholder="Name"
          />
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isKids}
              onChange={(e) => setIsKids(e.target.checked)}
              className="w-5 h-5 rounded border-ethos-border text-ethos-teal focus:ring-ethos-teal bg-ethos-bg"
            />
            <span className="text-ethos-white">Kids Profile</span>
          </label>
          <div className="flex justify-end space-x-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
