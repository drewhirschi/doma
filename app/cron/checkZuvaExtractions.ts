import type { NextRequest } from 'next/server';
import Zuva from '@/zuva';

export function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const zuvaApi = Zuva.getInstance();
  
 
  return Response.json({ success: true });
}