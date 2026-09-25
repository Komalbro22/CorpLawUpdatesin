import { NextResponse } from 'next/server';
import { getAICatalog } from '../ai-catalog.json/route';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  const catalog = getAICatalog();

  return NextResponse.json(catalog, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
