'use client';

interface Props {
  imageUrl: string;
  loading: boolean;
}

export default function PixelArtCanvas({ imageUrl, loading }: Props) {
  return (
    <div className="flex justify-center my-8">
      <div className="w-80 h-80 bg-gray-800 rounded-lg flex items-center justify-center border-4 border-purple-500">
        {loading ? (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mb-4 mx-auto" />
            <p>Generating...</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Pixel Art"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-gray-400">No image yet</p>
        )}
      </div>
    </div>
  );
}
