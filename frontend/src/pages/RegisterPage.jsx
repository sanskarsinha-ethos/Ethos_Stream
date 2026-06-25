import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, name);
      toast.success('Registration successful!');
      navigate('/profiles');
    } catch (err) {
      toast.error(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-ethos-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-ethos-bg via-ethos-surface to-ethos-amber-dim opacity-40"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h1 className="text-4xl font-space font-bold text-white mb-4">
            <span className="text-ethos-teal">►</span> ETHOS
          </h1>
          <p className="text-xl text-ethos-muted">Join the next generation of streaming.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-ethos-surface py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-space font-bold text-white mb-2">Create Account</h2>
          <p className="text-ethos-muted mb-8">
            Already have an account? <Link to="/login" className="text-ethos-teal hover:underline">Sign In</Link>
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
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
              helperText="At least 6 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Register
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <div className="border-t border-ethos-border flex-grow"></div>
            <span className="px-4 text-ethos-muted text-sm">Or register with</span>
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
