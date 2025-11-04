'use client';

import { useState, useEffect } from 'react';
import PixelArtCanvas from './components/PixelArtCanvas';
import MintButton from './components/MintButton';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState('');

  // Get Farcaster user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Fetch from Farcaster context
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUserData();
  }, []);

  const handleGenerate = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileImageUrl: user.pfp_url,
          username: user.username,
          fid: user.fid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert('Error generating pixel art');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate pixel art');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (!generatedImage || !user) return;

    setIsMinting(true);
    try {
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage,
          username: user.username,
          fid: user.fid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTxHash(data.txHash);
        alert('🎉 NFT Minted Successfully!');
      } else {
        alert('Error minting NFT');
      }
    } catch (error) {
      console.error('Minting error:', error);
      alert('Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-8">
          🎨 Pixel Art NFT Mint
        </h1>

        {/* User Profile */}
        {user && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <img
                src={user.pfp_url}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-purple-500"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{user.username}</h2>
                <p className="text-gray-400">FID: {user.fid}</p>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <PixelArtCanvas imageUrl={generatedImage} loading={isGenerating} />

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !user}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/50"
          >
            {isGenerating ? '⏳ Generating...' : '🎨 Generate Pixel Art'}
          </button>

          {generatedImage && (
            <MintButton
              onClick={handleMint}
              disabled={isMinting}
              loading={isMinting}
            />
          )}
        </div>

        {/* Transaction Result */}
        {txHash && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-200 text-sm">
              ✅ Minted! Transaction:{' '}
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-100"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
