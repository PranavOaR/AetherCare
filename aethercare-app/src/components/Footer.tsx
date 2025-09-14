'use client';

import { motion } from 'framer-motion';
import { Github, Mail, FileText, Heart } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { name: 'About', href: '#about', icon: FileText },
    { name: 'Documentation', href: '#docs', icon: FileText },
    { name: 'GitHub', href: '#github', icon: Github },
    { name: 'Contact', href: '#contact', icon: Mail },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <footer className="relative bg-[#0B0C10] border-t border-white/10">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grain opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="glass rounded-2xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Logo and description */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold gradient-text">AetherCare</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Decentralized AI-Powered Healthcare Data Platform. 
                Empowering patients with secure, intelligent, and accessible healthcare solutions.
              </p>
              
              {/* Social links */}
              <div className="flex space-x-4">
                {footerLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    whileHover={{ 
                      scale: 1.1,
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-400/50 transition-all duration-300 group"
                  >
                    <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Right side - Links and info */}
            <motion.div variants={itemVariants} className="text-center md:text-right">
              <div className="space-y-4 mb-6">
                <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                <div className="flex flex-wrap justify-center md:justify-end gap-6">
                  {footerLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      whileHover={{ 
                        scale: 1.05,
                        color: '#38BDF8'
                      }}
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 relative group"
                    >
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Newsletter signup */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <h5 className="text-white font-medium mb-2">Stay Updated</h5>
                <p className="text-sm text-gray-400 mb-3">
                  Get the latest updates on AetherCare development
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom section */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-8 border-t border-white/10 text-center"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2025 AetherCare. Built with{' '}
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    color: ['#EF4444', '#F59E0B', '#EF4444']
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="inline-block"
                >
                  ❤️
                </motion.span>{' '}
                at DevFest 2025.
              </p>
              
              <div className="flex space-x-6 text-sm text-gray-400">
                <motion.a
                  href="#privacy"
                  whileHover={{ color: '#38BDF8' }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </motion.a>
                <motion.a
                  href="#terms"
                  whileHover={{ color: '#38BDF8' }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </motion.a>
                <motion.a
                  href="#security"
                  whileHover={{ color: '#38BDF8' }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Security
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

