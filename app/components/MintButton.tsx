'use client';

interface Props {
  onClick: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

export default function MintButton({ onClick, loading, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg"
    >
      {loading ? '⏳ Minting...' : '🎪 Mint NFT'}
    </button>
  );
}
