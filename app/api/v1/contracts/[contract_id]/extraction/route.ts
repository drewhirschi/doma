import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';

import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';
import { routeClient } from "@/supabase/ServerClients";
import { runContractExtraction } from '@/agents/extractionAgent';
import { startZuvaExtraction } from '@/zuva';

export async function POST(req: NextRequest) {
    console.log(req.url)

    const contract_id = req.url.split('/')[6]
    const supabase = routeClient()


    // await runContractExtraction(supabase, contract_id)
    await startZuvaExtraction(supabase, contract_id)
    

    return Response.json({}, {status: 200})
}


