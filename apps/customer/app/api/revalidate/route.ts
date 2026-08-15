import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');

    if (!secret) {
      return NextResponse.json({ message: 'Missing secret token.' }, { status: 401 });
    }

    if (!process.env.REVALIDATION_SECRET) {
      console.error('[Revalidate] REVALIDATION_SECRET is not configured on this server.');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret token.' }, { status: 403 });
    }

    revalidatePath('/');
    revalidatePath('/categories');

    return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Revalidate] Failed to revalidate:', error);
    return NextResponse.json({ message: 'Failed to revalidate.' }, { status: 500 });
  }
}
