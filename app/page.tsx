// app/mint/page.tsx
'use client';

import Link from 'next/link';

export default function MintPage() {
  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)' }}>
      {/* Header/Nav */}
      <div className="relative h-16 flex items-center justify-between px-6 border-b-4 border-white bg-gradient-to-b from-cyan-300 to-cyan-400 shadow-lg">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          .pixel-text {
            font-family: 'Press Start 2P', cursive;
            letter-spacing: 2px;
          }

          .pixel-button {
            font-family: 'Press Start 2P', cursive;
            font-size: 0.6rem;
            padding: 10px 20px;
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

          .pixel-button-green {
            background: linear-gradient(135deg, #00FF00 0%, #00CC00 100%);
            color: #003300;
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

          .pixel-title {
            font-family: 'Press Start 2P', cursive;
            color: #005599;
          }

          .nft-image-container {
            background: linear-gradient(135deg, #FF6600 0%, #FF3333 100%);
            border: 4px solid #005599;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 120px;
            min-height: 300px;
            box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);
          }
        `}</style>

        <div className="pixel-text" style={{ fontSize: '1rem', color: '#005599' }}>🔨 BUILDER</div>
        <Link href="/">
          <button className="pixel-button">← BACK</button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* NFT Image Section */}
          <div className="pixel-box p-6">
            {/* Title */}
            <div className="pixel-title text-center mb-4" style={{ fontSize: '1.2rem' }}>
              CEO
            </div>
            
            {/* NFT Image Display */}
            <div className="nft-image-container mb-6 relative">
              🐕
              <div className="absolute top-4 right-4" style={{ fontSize: '40px' }}>⭐</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="pixel-box p-3 text-center">
                <div className="pixel-title" style={{ fontSize: '0.5rem', marginBottom: '0.5rem' }}>RARITY</div>
                <div style={{ fontSize: '0.7rem', color: '#FF6600', fontWeight: 'bold' }}>RARE</div>
              </div>
              <div className="pixel-box p-3 text-center">
                <div className="pixel-title" style={{ fontSize: '0.5rem', marginBottom: '0.5rem' }}>EDITION</div>
                <div style={{ fontSize: '0.7rem', color: '#005599' }}>1/100</div>
              </div>
              <div className="pixel-box p-3 text-center">
                <div className="pixel-title" style={{ fontSize: '0.5rem', marginBottom: '0.5rem' }}>TRAITS</div>
                <div style={{ fontSize: '0.7rem', color: '#005599' }}>8</div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <h1 className="pixel-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                MINT ONBOARDING NFT
              </h1>
              <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem', color: '#333' }}>
                CEO Dog - Legendary Builder Edition
              </p>
            </div>

            {/* Description Box */}
            <div className="pixel-box p-4">
              <div className="pixel-title" style={{ fontSize: '0.6rem', marginBottom: '1rem', color: '#005599' }}>
                DESCRIPTION
              </div>
              <p style={{ fontSize: '0.7rem', lineHeight: '1.6', color: '#666' }}>
                Join the Dog Empire as a CEO. This legendary NFT grants access to exclusive traits, features, and rewards on Base blockchain.
              </p>
            </div>

            {/* Price Box */}
            <div className="pixel-box p-4 bg-gradient-to-r from-yellow-100 to-orange-100 text-center">
              <div className="pixel-title" style={{ fontSize: '0.5rem', color: '#005599', marginBottom: '0.5rem' }}>
                MINT PRICE
              </div>
              <div className="pixel-title" style={{ fontSize: '1.8rem', color: '#FF6600' }}>
                10 USDC
              </div>
            </div>

            {/* Traits */}
            <div className="pixel-box p-4">
              <div className="pixel-title" style={{ fontSize: '0.6rem', marginBottom: '1rem', color: '#005599' }}>
                TRAITS
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  👁️ VR Visor
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  🎧 Headphones
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  🔥 Fire Aura
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  ⚡ Lightning
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  💎 Gold Chain
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  🌟 Legend
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  🚀 Spaceship
                </div>
                <div style={{ fontSize: '0.5rem', background: '#f0f0f0', padding: '0.5rem', border: '2px solid #005599' }}>
                  🎨 Custom
                </div>
              </div>
            </div>

            {/* Mint Button */}
            <button className="pixel-button pixel-button-green" style={{ width: '100%', padding: '20px', fontSize: '0.8rem' }}>
              🎮 MINT NOW
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="pixel-button" style={{ width: '100%' }}>📦 ADD TO CART</button>
              <button className="pixel-button" style={{ width: '100%' }}>❤️ FAVORITE</button>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="pixel-box p-4">
            <div className="pixel-title" style={{ fontSize: '0.6rem', marginBottom: '1rem', color: '#005599' }}>
              ✅ VERIFIED
            </div>
            <p style={{ fontSize: '0.7rem', color: '#666' }}>
              Official Builder NFT on Base blockchain
            </p>
          </div>
          <div className="pixel-box p-4">
            <div className="pixel-title" style={{ fontSize: '0.6rem', marginBottom: '1rem', color: '#005599' }}>
              🔒 SECURE
            </div>
            <p style={{ fontSize: '0.7rem', color: '#666' }}>
              Smart contract audited & verified
            </p>
          </div>
          <div className="pixel-box p-4">
            <div className="pixel-title" style={{ fontSize: '0.6rem', marginBottom: '1rem', color: '#005599' }}>
              💰 ROYALTIES
            </div>
            <p style={{ fontSize: '0.7rem', color: '#666' }}>
              10% secondary sales revenue
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4 mt-12">
        <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.4rem', color: 'white', letterSpacing: '1px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          POWERED BY THIRDWEB × BASE
        </p>
      </div>
    </div>
  );
}
