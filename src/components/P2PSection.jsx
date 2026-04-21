import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
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
    textDecoration: isDark ? 'underline' : 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'inline',
    marginTop: '0'
  };

  const blueLinkStyle = {
    ...orangeLinkStyle,
    color: isDark ? '#0f172a' : '#2563eb',
    textDecoration: isDark ? 'underline' : 'none',
    textUnderlineOffset: '4px'
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

  const [isExpanded, setIsExpanded] = useState(false);

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

          <div style={{ ...bodyStyle, textAlign: 'justify', textJustify: 'inter-word' }}>
            <p className="mb-6">
              Accord is a decentralized escrow platform built on the{" "}
              <a 
                href="https://injective.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={blueLinkStyle}
              >
                Injective blockchain
              </a>{" "}
              to secure P2P digital transactions, 
              covering both off-chain deliverables and on-chain assets. 
              It secures P2P digital Transactions for crypto payments (P2P trading), 
              NFTs and tokenized assets, freelance works (design, video, writing, etc.), digital files 
              (audio, video, documents, software, etc.), and access to APIs or digital services such as{" "}
              {!isExpanded ? (
                <button 
                  onClick={() => setIsExpanded(true)}
                  style={{ color: isDark ? '#0f172a' : '#E85D04', fontWeight: 400, border: 'none', background: 'none', padding: 0, cursor: 'pointer', textDecoration: 'none' }}
                >
                  read more
                </button>
              ) : (
                <Motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  subscriptions, SaaS rentals, developer APIs, and 
                  restricted software tools, between 
                  freelancers, crypto traders, buyers, sellers, 
                  and other digital counterparties who do not know each other.
                </Motion.span>
              )}
            </p>

            <AnimatePresence>
              {isExpanded && (
                <Motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="mb-6">
                    No company or intermediary holds user funds, not even Accord. Funds are locked and managed by a transparent smart contract 
                    deployed on the Injective blockchain network where anyone can verify the contract logic and rules in real time. 
                    Every transaction is executed transparently, with rules enforced by audited code rather than a centralized platform.
                  </p>

                  <p className="mb-6">
                    The smart contract locks both payment and the transaction agreement, ensuring neither party can complete the 
                    exchange alone. This reduces fraud by keeping funds and deliverables secured under predefined conditions until 
                    the transaction is resolved. In a freelance transaction, for example, the client’s payment is locked in escrow 
                    while the freelancer’s deliverable is committed under the contract. Neither side can access the final settlement 
                    until conditions are met, such as mutual approval or predefined settlement rules.
                  </p>

                  <p className="mb-6">
                    If both parties are satisfied, the smart contract automatically releases the funds and finalizes the exchange. 
                    If not, either party can trigger a dispute or withdrawal according to the contract rules before completion.
                  </p>

                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ ...boldTextStyle, color: isDark ? '#0f172a' : '#E85D04', display: 'inline-block' }}>
                      Accord provides a trust layer for digital transactions where outcomes are enforced by verifiable rules on-chain.
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button 
                      onClick={() => setIsExpanded(false)}
                      style={{ 
                        color: isDark ? '#0f172a' : '#6b7280', 
                        fontSize: '13px', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer', 
                        textDecoration: isDark ? 'underline' : 'none' 
                      }}
                    >
                      Show less
                    </button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={learnMoreStyle}>
            <div>Want to understand how Accord works, what escrow means, or what DeFi escrow is all about?</div>
            <div>
              If you’re new to blockchain and smart contracts, don’t worry it’s easier to grasp than it sounds.{" "}
              <a 
                href="#how-it-works" 
                style={orangeLinkStyle}
                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Learn the basics
              </a>{" "}
              and see how it all comes together.
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
              Learn More
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
