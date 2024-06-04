import { NextRequest, NextResponse } from "next/server";

import { routeClient } from "@/supabase/ServerClients";

//this goal of this route is to process the uploads that come in. Whether they need to be unzipped or converted or whatever

export async function POST(req: NextRequest, ) {
    console.log({
        req
    })

    const supabase = routeClient()

    // convertProjectWordFiles(supabase, req.params)


    

    return Response.json({}, {status: 200})
}


