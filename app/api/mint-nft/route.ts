import { NextResponse } from 'next/server';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

const sdk = ThirdwebSDK.fromPrivateKey(
  process.env.THIRDWEB_SECRET_KEY!,
  'base',
  {
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  }
);

export async function POST(request: Request) {
  try {
    const { imageUrl, username, fid } = await request.json() as {
      imageUrl: string;
      username: string;
      fid: number;
    };

    console.log(`🌟 Minting NFT for ${username} (FID: ${fid})`);

    const contract = await sdk.getContract(
      process.env.NEXT_PUBLIC_NFT_CONTRACT!
    );

    const tx = await contract.erc721.mintTo(
      process.env.NEXT_PUBLIC_NFT_CONTRACT!,
      {
        name: `Pixel Art #${fid}`,
        description: `Unique pixel art NFT generated for @${username}`,
        image: imageUrl,
        attributes: [
          { trait_type: 'Username', value: username },
          { trait_type: 'FID', value: fid.toString() },
          { trait_type: 'Style', value: 'Pixel Art' },
        ],
      }
    );

    console.log('✅ Minted! TX:', tx.receipt.transactionHash);
    return NextResponse.json({
      success: true,
      txHash: tx.receipt.transactionHash,
    });
  } catch (error: Error | unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Minting error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
