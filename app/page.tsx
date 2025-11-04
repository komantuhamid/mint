'use client';

import { useState, useEffect } from 'react';
import PixelArtCanvas from './components/PixelArtCanvas';
import MintButton from './components/MintButton';

interface User {
  pfp_url: string;
  username: string;
  fid: number;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');

  // Get Farcaster user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json() as User;
        setUser(data);
      } catch (error: Error | unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching user:', errorMsg);
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
      const data = (await response.json()) as { success: boolean; imageUrl?: string };
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert('Error generating pixel art');
      }
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Generation error:', errorMsg);
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
      const data = (await response.json()) as { success: boolean; txHash?: string };
      if (data.success && data.txHash) {
        setTxHash(data.txHash);
        alert('🎉 NFT Minted Successfully!');
      } else {
        alert('Error minting NFT');
      }
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Minting error:', errorMsg);
      alert('Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center py-8 text-white">🎨 Pixel Art NFT Mint</h1>

      {/* User Profile */}
      {user && (
        <div className="text-center mb-8 text-white">
          <p className="text-xl font-semibold">{user.username}</p>
          <p className="text-gray-400">FID: {user.fid}</p>
        </div>
      )}

      {/* Canvas */}
      {/* ✅ FIXED: Changed 'image' to 'imageUrl' */}
      <PixelArtCanvas imageUrl={generatedImage} loading={isGenerating} />

      {/* Buttons */}
      <div className="flex justify-center gap-4 my-8">
        <button
          onClick={handleGenerate}
          disabled={!user || isGenerating}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold rounded-lg"
        >
          {isGenerating ? '⏳ Generating...' : '🎨 Generate Pixel Art'}
        </button>

        {generatedImage && (
          <MintButton onClick={handleMint} loading={isMinting} />
        )}
      </div>

      {/* Transaction Result */}
      {txHash && (
        <div className="text-center text-green-400 mt-8">
          ✅ Minted! Transaction:{' '}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}
    </div>
  );
}
