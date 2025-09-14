'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  // Predefined positions and timings to avoid hydration mismatch
  const particles = [
    { left: '35%', top: '20%', duration: 6.5, delay: 1 },
    { left: '70%', top: '65%', duration: 7, delay: 2.5 },
    { left: '50%', top: '80%', duration: 6, delay: 0.5 },
  ];

  return (
    <section className="min-h-screen relative overflow-hidden bg-white flex items-center justify-center pt-20">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        {/* Minimal floating particles for elegance */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full opacity-5"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Central Hero Card */}
      <div className="relative z-10 w-full max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20"
        >
          {/* Hero Card with homeCard.jpg background */}
          <div className="relative overflow-hidden">
            {/* Background image with zoom effect */}
            <div className="absolute inset-0 bg-[url('/assets/homecard.jpg')] bg-cover bg-center scale-110 transition-transform duration-700"></div>
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center px-8 md:px-16 py-20 md:py-28">
              {/* Main Heading */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight"
              >
                <span className="gradient-text">AetherCare</span> — Decentralized{' '}
                <br className="hidden md:block" />
                <span className="text-white">AI-Powered Healthcare</span>
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg md:text-xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed font-light"
              >
                Patient-owned records, predictive AI insights, and secure blockchain verification — all in one modern platform.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex justify-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Button className="bg-white text-black hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-md transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;