'use client';

import { useEffect, useRef } from 'react';

export default function PixelArtCanvas({
  imageUrl,
  loading,
}: {
  imageUrl: string;
  loading: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [imageUrl, loading]);

  return (
    <div className="relative flex justify-center items-center bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="border-4 border-purple-500 rounded-lg shadow-2xl shadow-purple-500/50"
        width={512}
        height={512}
      />
    </div>
  );
}
