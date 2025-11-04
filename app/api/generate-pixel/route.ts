import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileImageUrl, username, fid } = body;

    // Validate input
    if (!profileImageUrl || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: profileImageUrl, username' },
        { status: 400 }
      );
    }

    // Call Replicate API to generate pixel art
    const output = await replicate.run('openai/whisper', {
      input: {
        image: profileImageUrl,
        prompt: `Convert this image to pixel art style NFT for user ${username}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        pixelArt: output,
        username,
        fid,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Replicate API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate pixel art',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
