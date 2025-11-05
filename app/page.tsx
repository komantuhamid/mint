// app/mint/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MintPage() {
  const [showImage, setShowImage] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-button-mint {
          font-family: 'Press Start 2P', cursive;
          font-size: 1.5rem;
          padding: 30px 60px;
          border: 6px solid #005599;
          background: linear-gradient(135deg, #00FF00 0%, #00CC00 100%);
          color: #003300;
          cursor: pointer;
          transition: all 0.1s;
          box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.3);
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        .pixel-button-mint:hover {
          transform: translate(3px, 3px);
          box-shadow: 5px 5px 0px rgba(0, 0, 0, 0.3);
        }

        .pixel-button-mint:active {
          transform: translate(8px, 8px);
          box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.3);
        }

        .pixel-image-container {
          border: 6px solid #005599;
          background: white;
          box-shadow: 12px 12px 0px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
        }

        .pixel-image {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-4 border-white bg-gradient-to-b from-cyan-300 to-cyan-400 shadow-lg">
        <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1rem', color: '#005599', letterSpacing: '2px' }}>
          🔨 BUILDER
        </div>
        <Link href="/">
          <button style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.6rem',
            padding: '10px 20px',
            border: '4px solid #005599',
            background: '#FFD700',
            color: '#005599',
            cursor: 'pointer',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.3)'
          }}>
            ← BACK
          </button>
        </Link>
      </div>

      {/* Main Content - Centered */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-5xl">
          
          {/* Left - Image */}
          {showImage && (
            <div className="pixel-image-container animate-in fade-in" style={{ animationDuration: '0.3s' }}>
              <img
                src="https://up6.cc/2025/10/176230743032471.png"
                alt="NFT"
                className="pixel-image"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23FF6600" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle"%3ECEO DOG%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}

          {/* Right - Mint Button */}
          <div className="flex flex-col items-center gap-6">
            <div style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '1.2rem',
              color: 'white',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '2px'
            }}>
              🎮 MINT NFT
            </div>

            <button
              className="pixel-button-mint"
              onMouseEnter={() => setShowImage(true)}
              onMouseLeave={() => setShowImage(false)}
              onClick={() => {
                alert('Mint functionality coming soon!');
              }}
            >
              🎨 MINT NOW
            </button>

            <div style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.6rem',
              color: 'white',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              PRICE: 10 USDC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
