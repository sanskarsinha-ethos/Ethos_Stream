import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Circle, Globe, Eye, EyeOff, Tv, Users } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  const handleSignUpSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: null, msg: '' });
    
    // Rigorous payload sanitization
    const sanitizedFirstName = firstName.trim();
    const sanitizedLastName = lastName.trim();
    const sanitizedEmail = email.trim();
    
    if (!/^\S+@\S+\.\S+$/.test(sanitizedEmail)) {
      setFeedback({ type: 'error', msg: 'Format Error: Invalid email pattern.' });
      return;
    }
    if (!password || password.length < 8) {
      setFeedback({ type: 'error', msg: 'Security Requirement: Password must be 8+ chars.' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: password,
        });
        
        if (error) {
          setFeedback({ type: 'error', msg: `Ingress Core Error: ${error.message} (${error.status || 400})` });
          setIsSubmitting(false);
          return;
        }
        
        setFeedback({ type: 'success', msg: 'Authentication successful! Initializing space...' });
        setTimeout(() => setIsAuthenticated(true), 1200);
      } else {
        const { error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: password,
          options: {
            data: {
              first_name: sanitizedFirstName,
              last_name: sanitizedLastName,
              display_name: `${sanitizedFirstName} ${sanitizedLastName}`.trim(),
            },
          },
        });
        
        if (error) {
          setFeedback({ type: 'error', msg: `Ingress Core Error: ${error.message} (${error.status || 400})` });
          setIsSubmitting(false);
          return;
        }
        
        setFeedback({ type: 'success', msg: 'Authentication successful! Initializing space...' });
        setTimeout(() => setIsAuthenticated(true), 1200);
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'System Error: Pipeline compilation error.' });
      setIsSubmitting(false);
    }
  };

  // If authenticated, render the dashboard / profile space
  if (isAuthenticated) {
    return <ProfileSelectionScreen />;
  }

  // Otherwise, render the ingress gateway
  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">

      {/* ── Left panel — cinematic brand ─────────────────────── */}
      <section className="relative hidden lg:flex w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        <motion.div
          className="z-10 w-full max-w-sm space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 },
            },
          }}
        >
          <motion.div
            className="flex items-center gap-2"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            <Circle className="w-6 h-6 fill-white text-white" />
            <span className="text-xl font-semibold tracking-tight">Ethos Stream</span>
          </motion.div>

          <motion.div
            className="space-y-2"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap">
              Join Ethos Stream
            </h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              Set up your profile in 3 simple phases to host real-time cinema rooms.
            </p>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            <StepItem active icon={<Tv className="w-4 h-4" />} number={1} text="Stream videos" />
            <StepItem icon={<Users className="w-4 h-4" />} number={2} text="Initialize 4-player party studio" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Right panel — registration form ──────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight">
              {isLoginMode ? 'Welcome Back' : 'Create Viewer Account'}
            </h2>
            <p className="text-white/40 text-sm">
              Input your credentials to sync high-bitrate video pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <SocialButton icon={<Globe className="w-4 h-4" />} label="Google" />
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 text-xs text-white/40 uppercase tracking-widest">Or Gateway</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <AnimatePresence mode="wait">
            {feedback.msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl text-sm ${
                  feedback.type === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}
              >
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignUpSubmission} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLoginMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                >
                  <InputGroup
                    label="First Name"
                    placeholder="Alex"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <InputGroup
                    label="Last Name"
                    placeholder="Vane"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputGroup
              label="Email Address"
              placeholder="viewer@ethosstream.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative space-y-1.5">
              <label className="text-sm font-medium text-white">Streaming Room Passkey</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border-none rounded-xl h-11 pl-4 pr-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer flex justify-center items-center"
            >
              {isSubmitting 
                ? (isLoginMode ? 'Authenticating...' : 'Provisioning Party Environment...') 
                : (isLoginMode ? 'Sign In' : 'Initialize Profile')}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            {isLoginMode ? 'New to the theater grid? ' : 'Already on the theater grid? '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setIsLoginMode(!isLoginMode);
                setFeedback({ type: null, msg: '' }); 
              }} 
              className="text-white hover:underline font-medium"
            >
              {isLoginMode ? 'Create an account' : 'Log in to Space'}
            </a>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

// ── Profile Selection Screen (Dashboard) ──────────────────────

function ProfileSelectionScreen() {
  const profiles = [
    { name: 'Host', icon: <Tv className="w-10 h-10" /> },
    { name: 'Player 2', icon: <Users className="w-10 h-10" /> },
    { name: 'Player 3', icon: <Users className="w-10 h-10" /> },
    { name: 'Player 4', icon: <Users className="w-10 h-10" /> },
  ];

  return (
    <main className="flex min-h-screen w-full bg-black text-white antialiased flex-col items-center justify-center relative p-6">
      <motion.div 
        className="flex flex-col items-center w-full max-w-4xl space-y-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-medium tracking-tight">Who is watching?</h1>
          <p className="text-white/40 text-sm">
            Select your streaming key space to access your 4-player party studio.
          </p>
        </div>

        {/* Interactive Profiles Grid */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 w-full">
          {profiles.map((profile, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-4 cursor-pointer group"
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#1A1A1A] border border-white/5 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-white/20 transition-all duration-300 group-hover:shadow-white/5 group-hover:shadow-xl">
                <div className="text-white/40 group-hover:text-white transition-colors duration-300">
                  {profile.icon}
                </div>
              </div>
              <span className="text-white/60 font-medium text-sm tracking-wide group-hover:text-white transition-colors duration-300">
                {profile.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Structural Management Action CTA */}
      <motion.div 
        className="absolute bottom-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button className="bg-black border border-white/10 text-white/60 text-sm py-2 px-6 rounded-xl hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          Manage Profiles
        </button>
      </motion.div>
    </main>
  );
}


// ── Sub-components ────────────────────────────────────────────

function StepItem({
  number,
  icon,
  text,
  active = false,
}: {
  number: number;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 w-full p-4 rounded-xl ${
        active ? 'bg-white text-black border border-white' : 'bg-[#1A1A1A] text-white border-none'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
          active ? 'bg-black text-white' : 'bg-white/10 text-white/40'
        }`}
      >
        {number}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium tracking-tight truncate">{text}</span>
      </div>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 w-full h-12 bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function InputGroup({
  label,
  placeholder,
  type,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label className="text-sm font-medium text-white">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 transition-all outline-none"
      />
    </div>
  );
}
