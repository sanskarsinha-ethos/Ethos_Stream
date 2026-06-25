import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { session, activeProfile, profiles, setActiveProfile } = useAuthStore();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-ethos-bg/80 backdrop-blur-md border-b border-ethos-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-space font-bold text-ethos-white flex items-center">
              <span className="text-ethos-teal mr-1">►</span> ETHOS
            </Link>

            {session && activeProfile && (
              <div className="hidden md:flex space-x-6">
                {[
                  { name: 'Browse', path: '/browse' },
                  { name: 'My List', path: '/my-list' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-ethos-teal flex items-center h-16 ${
                      isActive(item.path) ? 'text-ethos-white border-b-2 border-ethos-teal' : 'text-ethos-muted border-b-2 border-transparent'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!session ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                {activeProfile && (
                  <>
                    <button onClick={() => navigate('/search')} className="text-ethos-muted hover:text-ethos-white transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                    
                    <Button variant="amber" size="sm" onClick={() => navigate('/browse')} className="hidden md:flex">
                      <Users className="w-4 h-4 mr-2" />
                      Start a Room
                    </Button>

                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <Avatar src={activeProfile.avatarUrl} fallback={activeProfile.name?.[0]} size="sm" />
                        <ChevronDown className="w-4 h-4 text-ethos-muted" />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-ethos-surface border border-ethos-border rounded-md shadow-lg py-1">
                          <div className="px-4 py-2 border-b border-ethos-border">
                            <p className="text-sm font-medium text-white">{activeProfile.name}</p>
                            {activeProfile.isKids && <span className="text-xs text-ethos-teal">Kids Profile</span>}
                          </div>
                          
                          <div className="py-1">
                            {profiles.filter(p => p.id !== activeProfile.id).map(profile => (
                              <button
                                key={profile.id}
                                onClick={() => {
                                  setActiveProfile(profile);
                                  setIsDropdownOpen(false);
                                  navigate('/browse');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-ethos-muted hover:text-ethos-white hover:bg-ethos-elevated flex items-center space-x-2"
                              >
                                <Avatar src={profile.avatarUrl} fallback={profile.name?.[0]} size="sm" className="w-6 h-6 text-xs" />
                                <span>{profile.name}</span>
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-ethos-border py-1">
                            <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-ethos-muted hover:text-ethos-white hover:bg-ethos-elevated flex items-center">
                              Manage Profiles
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-4 py-2 text-sm text-ethos-danger hover:bg-ethos-elevated flex items-center"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
