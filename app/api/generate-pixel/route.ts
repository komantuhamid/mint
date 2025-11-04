
import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

export async function POST(request: Request) {
  try {
    const { profileImageUrl, username, fid } = await request.json();

    console.log(`🎨 Generating pixel art for ${username} (FID: ${fid})`);

    // Generate pixel art using Replicate
    const output = await replicate.run(
      'stability-ai/stable-diffusion',
      {
        input: {
          prompt: `pixelated 16-bit retro pixel art style, vibrant colors, collectible NFT character, ${username}, farcaster user ${fid}, blocky pixels, retro gaming aesthetic, no text`,
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Pixel generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Generation failed' },
      { status: 500 }
    );
  }
}
