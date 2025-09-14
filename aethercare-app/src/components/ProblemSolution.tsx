'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Shield, Brain, Users } from 'lucide-react';

const ProblemSolution = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="py-24 relative bg-[#0B0C10]">
      {/* Background grain */}
      <div className="absolute inset-0 bg-grain opacity-50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Problem Side */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-2xl shadow-2xl shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-500 group bg-[url('/assets/grainy.jpg')] bg-cover bg-center">
              {/* Text contrast overlay */}
              <div className="absolute inset-0 bg-black/50"></div>
              {/* Content container */}
              <div className="relative z-10 p-8">
              <div className="text-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center"
                >
                  <AlertTriangle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  The Healthcare Problem
                </h3>
              </div>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-red-500/20 border border-red-400/30"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Fragmented Data</h4>
                    <p className="text-gray-200 text-sm">Patient records scattered across multiple providers, creating incomplete health pictures.</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-red-500/20 border border-red-400/30"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Security Breaches</h4>
                    <p className="text-gray-200 text-sm">Centralized systems vulnerable to cyber attacks, compromising patient privacy.</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-red-500/20 border border-red-400/30"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Slow Innovation</h4>
                    <p className="text-gray-200 text-sm">Legacy systems prevent adoption of AI and advanced healthcare technologies.</p>
                  </div>
                </motion.div>
              </div>
              </div>
            </Card>
          </motion.div>

          {/* Solution Side */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden rounded-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-500 group bg-[url('/assets/grainy.jpg')] bg-cover bg-center">
              {/* Text contrast overlay */}
              <div className="absolute inset-0 bg-black/50"></div>
              {/* Content container */}
              <div className="relative z-10 p-8">
              <div className="text-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  The AetherCare Solution
                </h3>
              </div>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/30"
                >
                  <Brain className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">AI-Powered Insights</h4>
                    <p className="text-gray-200 text-sm">Advanced machine learning provides personalized health recommendations and early detection.</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-cyan-500/20 border border-cyan-400/30"
                >
                  <Shield className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Blockchain Security</h4>
                    <p className="text-gray-200 text-sm">Immutable, decentralized storage ensures data integrity and patient ownership.</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-purple-500/20 border border-purple-400/30"
                >
                  <Users className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Patient Ownership</h4>
                    <p className="text-gray-200 text-sm">Patients control their data, granting access to providers while maintaining privacy.</p>
                  </div>
                </motion.div>
              </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Connecting Animation */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full relative">
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;
