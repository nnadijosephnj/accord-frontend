import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import KineticLogo from './KineticLogo';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    // EARLY TRIGGER: Start the vanishing process at 2600ms
    // to ensure the background is GONE by the time the logo completes its cycle.
    const timer = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "linear" }} // SNAP EXIT: Faster, linear fade
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0B0B0B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        background: 'radial-gradient(circle at center, #853302 0%, #0B0B0B 70%)',
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Self-Assembling Kinetic Logo */}
        <KineticLogo />

        {/* Cinematic Pulse Ring */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ 
            duration: 2.2, 
            repeat: Infinity, 
            delay: 1.5,
            ease: "easeOut" 
          }}
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            border: '2px solid rgba(232, 93, 4, 0.4)',
          }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
