import { NextResponse } from 'next/server'
import manifest from '../manifest'

export async function GET() {
    const data = manifest()
    return NextResponse.json(data)
}
