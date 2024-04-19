import Zuva, { checkExtractionJobs } from '@/zuva';
import { fullAccessServiceClient, routeClient } from '@/supabase/ServerClients';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
 


  const supabase = fullAccessServiceClient()
  const formatters = await supabase.from('formatters')
  .select('*, parslet(*, annotation(*))')
  .eq('parslet.annotation.contract_id', "691e1102-1548-46b5-b066-3ed766638682")


//   try {
    
//     checkExtractionJobs(supabase)
    return Response.json({}, { status: 200 });
//   } catch (error) {
//     return Response.json({ error }, { status: 500 });
//   }


}