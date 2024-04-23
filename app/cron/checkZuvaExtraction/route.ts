import Zuva, { checkExtractionJobs } from '@/zuva';
import { fullAccessServiceClient, routeClient } from '@/supabase/ServerClients';

import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }


  const supabase = fullAccessServiceClient()

  try {
    
    checkExtractionJobs(supabase)
    return Response.json({}, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }


}