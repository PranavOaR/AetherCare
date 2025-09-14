'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Brain, 
  Shield, 
  Users
} from 'lucide-react';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms analyze your health data to provide personalized recommendations and early detection of potential health issues.',
      gradient: 'from-purple-500 to-indigo-600',
      shadowColor: 'shadow-purple-500/20',
      hoverShadow: 'hover:shadow-purple-500/30',
      iconBg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      borderColor: 'border-purple-400/30',
      bgAccent: 'bg-purple-500/20'
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Your health data is secured using cutting-edge blockchain technology, ensuring immutable records and complete data integrity.',
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
      hoverShadow: 'hover:shadow-emerald-500/30',
      iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-400/30',
      bgAccent: 'bg-emerald-500/20'
    },
    {
      icon: Users,
      title: 'Patient Ownership',
      description: 'You own and control your health data. Grant or revoke access to healthcare providers while maintaining complete privacy control.',
      gradient: 'from-cyan-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/20',
      hoverShadow: 'hover:shadow-cyan-500/30',
      iconBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-400/30',
      bgAccent: 'bg-cyan-500/20'
    }
  ];

  return (
    <section className="py-24 relative bg-[#0B0C10]">
      {/* Clean dark background - no overlays needed */}
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Powerful <span className="gradient-text">Features</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Experience the future of healthcare with cutting-edge technology designed to put patients first
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`relative overflow-hidden rounded-2xl shadow-2xl ${feature.shadowColor} ${feature.hoverShadow} transition-all duration-500 group bg-gray-800/50 border border-gray-700/50 h-full hover:bg-gray-800/70 hover:border-gray-600/50`}>
                {/* Clean card background */}
                
                {/* Content container */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-14 h-14 mb-4 rounded-xl ${feature.iconBg} flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-100 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed flex-grow group-hover:text-gray-200 transition-colors">
                    {feature.description}
                  </p>

                  {/* Hover accent line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`mt-4 h-1 ${feature.iconBg} rounded-full origin-left`}
                  />
                </div>

                {/* Subtle accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${feature.iconBg} opacity-30 group-hover:opacity-60 transition-opacity duration-500`}></div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="bg-gray-800/50 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl shadow-black/50 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience the Future?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of patients already empowered by AetherCare&apos;s revolutionary healthcare platform.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 rounded-md transition-all duration-300 hover:shadow-lg flex items-center justify-center">
                Get Early Access
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
