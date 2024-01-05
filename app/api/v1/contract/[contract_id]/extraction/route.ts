import { NextRequest } from "next/server";
import { routeClient } from "@/supabase/ServerClients";

export async function GET(req: NextRequest,) {


    return Response.json({ message: "GET request processed" });
}


export async function POST(req: NextRequest) {
    console.log(req.url)

    const contract_id = req.url.split('/')[6]
    const supabase = routeClient()


    const { data, error } = await supabase.from('contract').select('*, contract_line(text)').eq('id', contract_id).single()


    data.contract_line.forEach((line:any,i:number) => {
        console.log(`<l id="${i}">${line.text}</l>`)
    })

    // call all extractors for the given contract id

    // const contract;

    // const extractors = []


    // const promises = extractors.map(extractor => execExtractor(extractor, contract))

    // const responses = await Promise.all(promises)

    // add responses to db

    return Response.json({ message: "POST request processed" });
}


// POST /api/contracts/{contract_id}/extraction