import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileImageUrl, username, fid } = body;

    if (!profileImageUrl || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const output = await replicate.run('openai/whisper', {
      input: {
        image: profileImageUrl,
        prompt: `Convert for user ${username}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { pixelArt: output, username, fid },
    });
  } catch (error: Error | unknown) {  // ✅ FIX HERE
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
