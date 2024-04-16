import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';

import { NextRequest } from "next/server";
import OpenAI from 'openai';
import { routeClient } from "@/supabase/ServerClients";
import { runContractExtraction } from '@/agents/extractionAgent';

export async function POST(req: NextRequest) {
    console.log(req.url)

    const contract_id = req.url.split('/')[6]
    const supabase = routeClient()


    await runContractExtraction(supabase, contract_id)
    

    return Response.json({ message: "POST request processed" });
}


