import { NextResponse, NextRequest } from 'next/server'

export async function POST(req: Request) {
 const { title } = await req.json();

 return NextResponse.json( { title :{ title } }, { status: 201 });
 }