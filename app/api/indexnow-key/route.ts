import { NextResponse } from 'next/server'

export async function GET() {

      try {
        const key = process.env.INDEXNOW_KEY
      if (!key) {
        return new NextResponse('Not configured', 
          { status: 404 })
      }
      return new NextResponse(key, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      } catch (error) {
  const err = error as Error & { digest?: string };
            if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
              throw error;
            }

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}
