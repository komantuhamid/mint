// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)' }}>
      {/* Pixel Art Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="20" height="20" fill="none" stroke="black" stroke-width="0.5"/%3E%3C/svg%3E")'
      }} />

      {/* Game Title Area */}
      <div className="relative h-24 flex items-center justify-center border-b-4 border-white bg-gradient-to-b from-cyan-300 to-cyan-400 shadow-lg">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          .pixel-title {
            font-family: 'Press Start 2P', cursive;
            font-size: 3rem;
            text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.3), 
                         -1px -1px 0px rgba(255, 255, 255, 0.5);
            animation: pixelBounce 2s infinite;
            color: #005599;
            letter-spacing: 4px;
          }

          @keyframes pixelBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .pixel-button {
            font-family: 'Press Start 2P', cursive;
            font-size: 0.75rem;
            padding: 12px 24px;
            border: 4px solid #005599;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #005599;
            cursor: pointer;
            transition: all 0.1s;
            box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .pixel-button:hover {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
          }

          .pixel-button:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.3);
          }

          .pixel-box {
            border: 4px solid #005599;
            background: white;
            box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);
            position: relative;
          }

          .pixel-box::after {
            content: '';
            position: absolute;
            inset: 0;
            border: 2px solid rgba(0, 0, 0, 0.1);
            pointer-events: none;
          }
        `}</style>
        <div className="pixel-title">🔨 BUILDER</div>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen pt-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Hero Section */}
          <div className="pixel-box p-8 mb-8 bg-gradient-to-b from-white to-gray-100">
            <div className="text-center mb-6">
              <h1 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1.5rem', color: '#005599', marginBottom: '1rem' }}>
                MINT ONBOARDING NFT
              </h1>
              <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.6rem', color: '#333', letterSpacing: '1px', lineHeight: '1.8' }}>
                Build your legacy on Base.<br />
                Rebuild the Dog Empire.<br />
                One NFT at a time.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              {/* Card 1 */}
              <div className="pixel-box p-4 hover:shadow-2xl transition-shadow">
                <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem', color: '#005599', marginBottom: '0.5rem' }}>
                  ⚙️ CUSTOMIZE
                </div>
                <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: '1.6' }}>
                  Design your unique pixel art NFT with custom traits and colors.
                </p>
              </div>

              {/* Card 2 */}
              <div className="pixel-box p-4 hover:shadow-2xl transition-shadow">
                <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem', color: '#005599', marginBottom: '0.5rem' }}>
                  🏆 COLLECT
                </div>
                <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: '1.6' }}>
                  Own exclusive Builder NFTs on the Base blockchain.
                </p>
              </div>

              {/* Card 3 */}
              <div className="pixel-box p-4 hover:shadow-2xl transition-shadow">
                <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem', color: '#005599', marginBottom: '0.5rem' }}>
                  🌟 TRADE
                </div>
                <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: '1.6' }}>
                  Trade and sell your NFTs in the marketplace.
                </p>
              </div>

              {/* Card 4 */}
              <div className="pixel-box p-4 hover:shadow-2xl transition-shadow">
                <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem', color: '#005599', marginBottom: '0.5rem' }}>
                  💎 RARE
                </div>
                <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: '1.6' }}>
                  Limited edition NFTs with legendary rarity traits.
                </p>
              </div>
            </div>

            {/* Price Section */}
            <div className="pixel-box p-4 bg-gradient-to-r from-yellow-100 to-orange-100 my-6 text-center">
              <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem', color: '#005599', marginBottom: '0.5rem' }}>
                MINT PRICE
              </p>
              <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1.5rem', color: '#FF6600' }}>
                1.0 USDC
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/mint">
                <button
                  className="pixel-button"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  🎮 MINT NOW
                </button>
              </Link>
              
              <Link href="/inventory">
                <button className="pixel-button" style={{ background: 'linear-gradient(135deg, #00FF00 0%, #00CC00 100%)', color: '#003300' }}>
                  📦 INVENTORY
                </button>
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center px-4">
            <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.4rem', color: 'white', letterSpacing: '1px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              POWERED BY THIRDWEB × BASE
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="fixed bottom-10 right-10 text-6xl opacity-30 pointer-events-none"
      >
        🔨
      </motion.div>
    </div>
  );
}
