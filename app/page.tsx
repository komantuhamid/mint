// app/mint/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MintPage() {
  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * {
          font-family: 'Press Start 2P', cursive;
        }

        .pixel-header {
          background: linear-gradient(to right, #00d4ff, #0099cc);
          border-bottom: 6px solid #005599;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pixel-btn {
          background: #FFD700;
          color: #005599;
          border: 4px solid #005599;
          padding: 8px 16px;
          font-size: 0.6rem;
          cursor: pointer;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
          transition: all 0.05s;
          letter-spacing: 2px;
          font-weight: bold;
        }

        .pixel-btn:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.3);
        }

        .pixel-btn:active {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px rgba(0,0,0,0.3);
        }

        .logo-text {
          font-size: 0.9rem;
          color: #005599;
          letter-spacing: 3px;
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 60px);
          padding: 24px;
          gap: 16px;
        }

        .content-box {
          border: 6px solid #005599;
          background: white;
          box-shadow: 12px 12px 0px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 500px;
          overflow: hidden;
        }

        .image-section {
          background: linear-gradient(135deg, #FF6600 0%, #FF3333 100%);
          border-bottom: 6px solid #005599;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          position: relative;
        }

        .image-section img {
          width: 100%;
          height: auto;
          image-rendering: pixelated;
          filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.2));
        }

        .info-section {
          background: white;
          padding: 16px;
        }

        .title {
          font-size: 0.7rem;
          color: #005599;
          text-align: center;
          margin-bottom: 12px;
          letter-spacing: 2px;
        }

        .price-box {
          background: linear-gradient(135deg, #0099cc 0%, #00ccff 100%);
          border: 4px solid #005599;
          padding: 12px;
          margin-bottom: 16px;
          text-align: center;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        }

        .price-text {
          font-size: 0.5rem;
          color: white;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }

        .mint-btn {
          background: linear-gradient(135deg, #00FF00 0%, #00CC00 100%);
          color: #003300;
          border: 6px solid #005599;
          padding: 20px;
          width: 100%;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 8px 8px 0px rgba(0,0,0,0.3);
          transition: all 0.05s;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .mint-btn:hover {
          transform: translate(3px, 3px);
          box-shadow: 5px 5px 0px rgba(0,0,0,0.3);
        }

        .mint-btn:active {
          transform: translate(8px, 8px);
          box-shadow: 0px 0px 0px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* Header */}
      <div className="pixel-header">
        <div className="logo-text">🔨 BUILDER</div>
        <Link href="/">
          <button className="pixel-btn">← BACK</button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="content-box">
          {/* Image Section */}
          <div className="image-section">
            <img
              src="https://up6.cc/2025/10/176230743032471.png"
              alt="CEO NFT"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23FF6600" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="50" fill="white" text-anchor="middle" dominant-baseline="middle"%3ECEO%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="title">🎮 MINT NFT</div>
            <div className="price-box">
              <div className="price-text">PRICE</div>
              <div style={{ fontSize: '1rem', color: '#FFD700', letterSpacing: '2px', fontWeight: 'bold' }}>
                10 USDC
              </div>
            </div>
            <button 
              className="mint-btn"
              onClick={() => alert('Mint functionality coming soon!')}
            >
              🎨 MINT NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
