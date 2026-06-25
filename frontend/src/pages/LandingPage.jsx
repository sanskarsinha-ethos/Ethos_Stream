import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Users, Globe, Tv, Heart } from 'lucide-react';
import Button from '../components/ui/Button';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ethos-bg via-ethos-surface to-ethos-bg z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-space font-bold text-white mb-6"
            {...fadeIn}
          >
            Stream Together,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ethos-teal to-blue-500">
              Feel Together.
            </span>
          </motion.h1>
          <motion.p 
            className="mt-4 text-xl md:text-2xl text-ethos-muted max-w-3xl mx-auto mb-10"
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Experience movies and series like never before. Create an Ethos Room, invite your friends, and share reactions in real-time.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8">
                <Play className="w-5 h-5 mr-2" />
                Start Watching Free
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto px-8">
                See How It Works
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-10 border-y border-ethos-border bg-ethos-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center space-x-12 opacity-50 grayscale">
          <div className="text-xl font-bold font-space">STUDIO A</div>
          <div className="text-xl font-bold font-space">CINEMA X</div>
          <div className="text-xl font-bold font-space">FILM CO</div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-24 bg-ethos-bg" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mx-auto bg-ethos-teal-dim rounded-full flex items-center justify-center mb-6">
                <Tv className="w-8 h-8 text-ethos-teal" />
              </div>
              <h3 className="text-2xl font-space font-bold mb-4">Adaptive Streaming</h3>
              <p className="text-ethos-muted">Enjoy crystal clear 1080p quality that automatically adjusts to your connection speed.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto bg-ethos-amber-dim rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-ethos-amber" />
              </div>
              <h3 className="text-2xl font-space font-bold mb-4">Ethos Rooms</h3>
              <p className="text-ethos-muted">Watch in perfect sync with up to 4 friends. Pause for one, pause for all.</p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-16 h-16 mx-auto bg-ethos-teal-dim rounded-full flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-ethos-teal" />
              </div>
              <h3 className="text-2xl font-space font-bold mb-4">Watch Anywhere</h3>
              <p className="text-ethos-muted">Seamlessly switch between devices and pick up exactly where you left off.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ethos Room Highlight */}
      <section className="py-24 bg-gradient-to-r from-ethos-amber/20 to-ethos-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-space font-bold text-white mb-6">
              Never watch alone again.
            </h2>
            <p className="text-xl text-ethos-muted mb-8">
              Launch an <span className="text-ethos-amber font-bold">Ethos Room</span> with one click. Chat live, drop floating emoji reactions, and experience every plot twist together.
            </p>
            <Link to="/register">
              <Button variant="amber" size="lg">
                <Heart className="w-5 h-5 mr-2" />
                Try Ethos Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-ethos-border bg-ethos-bg text-center text-ethos-muted">
        <p>© {new Date().getFullYear()} Ethos Stream. All rights reserved.</p>
      </footer>
    </div>
  );
}
