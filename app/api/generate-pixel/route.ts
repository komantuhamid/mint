import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { profileImageUrl, _username, _fid } = await request.json() as {
      profileImageUrl: string;
      username: string;
      fid: number;
    };

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'e6d66d95924f00f9d9f3db58fc66ecc97d3ba6c66e0b5b0b5b0b5b0b5b0b5b0',
        input: {
          image: profileImageUrl,
          scale: 4,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { output?: string[] };

    if (!data.output || !data.output[0]) {
      throw new Error('No output from Replicate');
    }

    return NextResponse.json({
      success: true,
      imageUrl: data.output[0],
    });
  } catch (error: Error | unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generation error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
