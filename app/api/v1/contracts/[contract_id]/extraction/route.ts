import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';

import { NextRequest } from "next/server";
import OpenAI from 'openai';
import { reviewContract } from '../../../../../../src/processContract';
import { routeClient } from "@/supabase/ServerClients";

export async function POST(req: NextRequest) {
    console.log(req.url)

    const contract_id = req.url.split('/')[6]
    const supabase = routeClient()


    await reviewContract(supabase, contract_id)
    

    return Response.json({ message: "POST request processed" });
}


