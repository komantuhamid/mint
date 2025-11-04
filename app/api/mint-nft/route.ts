import { NextResponse } from 'next/server';

// ✅ Force dynamic rendering - don't run at build time!
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { imageUrl, username, fid } = await request.json() as {
      imageUrl: string;
      username: string;
      fid: number;
    };

    // ✅ Use ThirdWeb SDK with CLIENT ID (not private key!)
    const { ThirdwebSDK } = await import('@thirdweb-dev/sdk');
    
    if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_THIRDWEB_CLIENT_ID not configured');
    }

    // ✅ Use readOnly SDK - minting will be done via your smart contract
    const sdk = new ThirdwebSDK('base', {
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    });

    console.log(`🌟 Minting NFT for ${username} (FID: ${fid})`);

    const contract = await sdk.getContract(
      process.env.NEXT_PUBLIC_NFT_CONTRACT!
    );

    // ✅ Mint using your contract's public mint function
    const tx = await contract.erc721.mintTo(
      process.env.NEXT_PUBLIC_WALLET_ADDRESS || '0xB5736dfae27B972Fc5d4cB40d4827AfAdA2cc2D9',
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
