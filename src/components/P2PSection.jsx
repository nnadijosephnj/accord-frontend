import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Typewriter = ({ phrases }) => {
  const { isDark } = useTheme();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(150);

  useEffect(() => {
    const handleType = () => {
      const fullPhrase = phrases[currentPhraseIndex];
      
      if (!isDeleting) {
        setCurrentText(fullPhrase.substring(0, currentText.length + 1));
        setSpeed(100);
        
        if (currentText === fullPhrase) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setCurrentText(fullPhrase.substring(0, currentText.length - 1));
        setSpeed(50);
        
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    };

    const timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, speed]);

  return (
    <span style={{ color: isDark ? '#0f172a' : '#E85D04', fontWeight: 700 }}>
      {currentText}
      <span className="blinking-cursor" style={{ 
        borderRight: `2px solid ${isDark ? '#0f172a' : '#E85D04'}`,
        marginLeft: '2px',
        animation: 'blink 1s step-end infinite'
      }}></span>
    </span>
  );
};

const P2PSection = () => {
  const { isDark } = useTheme();
  
  const phrases = [
    "For freelancers.",
    "For crypto traders.",
    "For NFT buyers & sellers.",
    "For everyone in between."
  ];

  const sectionStyle = {
    backgroundColor: isDark ? '#000000' : 'transparent',
    padding: '0 0 40px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: "'ABC Whyte', sans-serif",
    transition: 'background-color 0.4s ease'
  };

  const containerStyle = {
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    padding: 'clamp(40px, 10vw, 88px) clamp(16px, 5vw, 32px) clamp(40px, 10vw, 100px) clamp(16px, 5vw, 32px)',
    backgroundColor: isDark ? '#E85D04' : '#ffffff',
    borderRadius: '0 0 64px 64px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: isDark ? 'none' : '0 10px 40px rgba(0,0,0,0.04)',
    border: isDark ? 'none' : '1px solid #eee',
    transition: 'all 0.4s ease'
  };

  const contentWrapperStyle = {
    maxWidth: '680px',
    width: '100%',
    fontFamily: "'ABC Whyte', sans-serif"
  };

  const badgeStyle = {
    display: 'inline-block',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E85D0412',
    color: isDark ? '#ffffff' : '#E85D04',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '6px 16px',
    borderRadius: '100px',
    marginBottom: '24px'
  };

  const headlineStyle = {
    fontSize: 'clamp(32px, 5vw, 52px)',
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    marginBottom: '24px',
    color: isDark ? '#ffffff' : '#0f1117',
    textWrap: 'balance'
  };

  const typewriterContainerStyle = {
    fontSize: 'clamp(24px, 4vw, 36px)',
    minHeight: '1.2em',
    marginBottom: '40px',
    textWrap: 'balance'
  };

  const bodyStyle = {
    fontSize: 'clamp(15px, 2vw, 17px)',
    lineHeight: 1.7,
    letterSpacing: '-0.01em',
    color: isDark ? '#ffffff' : '#374151',
    opacity: isDark ? 0.96 : 0.9,
    marginBottom: '24px',
    textAlign: 'center',
    textWrap: 'balance',
    margin: '0 auto 32px auto',
    maxWidth: '640px'
  };

  const boldTextStyle = {
    fontWeight: 700,
    color: isDark ? '#ffffff' : '#0f1117',
    display: 'block',
    marginTop: '24px'
  };

  const learnMoreStyle = {
    fontSize: '14px',
    color: isDark ? '#0f172a' : '#6b7280',
    opacity: isDark ? 0.9 : 1,
    lineHeight: 1.9,
    marginTop: '32px'
  };

  const orangeLinkStyle = {
    color: isDark ? '#0f172a' : '#E85D04',
    background: 'transparent',
    padding: '0',
    borderRadius: '0',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'inline',
    marginTop: '0'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '40px'
  };

  const primaryButtonStyle = {
    backgroundColor: isDark ? '#0f172a' : '#E85D04',
    color: '#ffffff',
    fontWeight: 700,
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const secondaryButtonStyle = {
    backgroundColor: 'transparent',
    color: isDark ? '#ffffff' : '#E85D04',
    fontWeight: 700,
    padding: '14px 32px',
    borderRadius: '8px',
    border: isDark ? '2px solid #ffffff' : '2px solid #E85D04',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <section style={sectionStyle}>
      <Motion.div 
        style={containerStyle}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div style={contentWrapperStyle}>
          <span style={badgeStyle}>Decentralized Escrow</span>
          
          <h2 style={headlineStyle}>
            The Safest Way to Secure Peer-to-Peer Transactions.
          </h2>
          
          <div style={typewriterContainerStyle}>
            <Typewriter phrases={phrases} />
          </div>

          <p style={bodyStyle}>
            Accord is a decentralized escrow platform built on the Injective blockchain. 
            It is designed to protect payments between freelancers and clients, 
            P2P crypto traders, NFT buyers and sellers, and any two parties who 
            don't know each other giving both sides confidence that the deal will 
            be honored. No company holds your money not even us. Funds are managed 
            entirely by a smart contract published publicly on the blockchain 
            meaning anyone can verify exactly how it works, no hidden terms, no 
            fine print. The code itself enforces the agreement. Accord simply 
            provides the space for the transaction to happen. Whether you're a 
            freelancer getting paid for a project, settling a P2P crypto trade, 
            buying or selling an NFT, tokenizing real estate, or closing any deal 
            where trust is the missing piece the smart contract holds, protects, 
            and releases funds automatically when both sides are satisfied.
            
            <span style={boldTextStyle}>Audited. Fully Transparent. Zero Middlemen.</span>
          </p>

          <div style={learnMoreStyle}>
            <div>Want to know how Accord works, what escrow is, or what DeFi escrow means?</div>
            <div>
              New to blockchain and smart contracts? Don't worry, it's simpler than you think.{" "}
              <a 
                href="#how-it-works" 
                style={orangeLinkStyle}
                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                → Learn How It Works
              </a>
            </div>
          </div>

          <div style={buttonContainerStyle}>
            <button 
              style={primaryButtonStyle}
              onMouseOver={(e) => {
                if (isDark) {
                  e.target.style.backgroundColor = '#1e293b';
                } else {
                  e.target.style.backgroundColor = '#c94d00';
                }
              }}
              onMouseOut={(e) => {
                if (isDark) {
                  e.target.style.backgroundColor = '#0f172a';
                } else {
                  e.target.style.backgroundColor = '#E85D04';
                }
              }}
            >
              Get Started
            </button>
            <button 
              style={secondaryButtonStyle}
              onMouseOver={(e) => {
                if (isDark) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                } else {
                  e.target.style.backgroundColor = '#E85D0412';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </Motion.div>

      <style>
        {`
          @keyframes blink {
            from, to { border-color: transparent }
            50% { border-color: #E85D04 }
          }
        `}
      </style>
    </section>
  );
};

export default P2PSection;
