import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/profiles');
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // OAuth will redirect
    } catch (err) {
      toast.error(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-ethos-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-ethos-bg via-ethos-surface to-ethos-teal-dim opacity-40"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h1 className="text-4xl font-space font-bold text-white mb-4">
            <span className="text-ethos-teal">►</span> ETHOS
          </h1>
          <p className="text-xl text-ethos-muted">Welcome back. Your next great story awaits.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-ethos-surface">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-space font-bold text-white mb-2">Sign In</h2>
          <p className="text-ethos-muted mb-8">
            Don't have an account? <Link to="/register" className="text-ethos-teal hover:underline">Register</Link>
          </p>

          <form onSubmit={handleSignIn} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <div className="border-t border-ethos-border flex-grow"></div>
            <span className="px-4 text-ethos-muted text-sm">Or continue with</span>
            <div className="border-t border-ethos-border flex-grow"></div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full mt-6 border border-ethos-border hover:bg-ethos-elevated"
            onClick={handleGoogleSignIn}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}
