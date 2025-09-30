import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Validate that it's a Google profile image URL
    if (
      !imageUrl.startsWith('https://lh3.googleusercontent.com/') &&
      !imageUrl.startsWith('https://lh4.googleusercontent.com/') &&
      !imageUrl.startsWith('https://lh5.googleusercontent.com/') &&
      !imageUrl.startsWith('https://lh6.googleusercontent.com/')
    ) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    // Fetch the image from Google with proper headers
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HireMeMaybe/1.0)',
        Accept: 'image/*',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      // If Google returns 429, return a fallback response
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limited by Google' }, { status: 429 });
      }
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error proxying profile image:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }

    return NextResponse.json({ error: 'Failed to load profile image' }, { status: 500 });
  }
}
