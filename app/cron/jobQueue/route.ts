import Zuva, { checkExtractionJobs } from '@/zuva';
import { fullAccessServiceClient, routeClient } from '@/supabase/ServerClients';

import { ExtractJobStatus } from '@/types/enums';
import type { NextRequest } from 'next/server';
import { runContractExtraction } from '@/actions/extraction';

export const maxDuration = 300

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized, token was ' + authHeader, {
            status: 401,
            statusText: "Unauthorized"
        });
    }


    try {
        const supabase = fullAccessServiceClient()

        const { data: jobs, error } = await supabase.from("contract_job_queue").select().in("status", [ExtractJobStatus.PENDING, ExtractJobStatus.FAILED]).limit(5)

        if (error) throw error

        let completed = 0
        let failed = 0
        for (const job of jobs) {


            try {

                const res = await runContractExtraction(supabase, job.contract_id)
                await supabase.from("contract_job_queue").update({ status: ExtractJobStatus.COMPLETE }).eq("id", job.id).throwOnError()
                completed++

            } catch (error) {
                console.error(`failed to run extraction for job [${job.id}]`, error)
                await supabase.from("contract_job_queue").update({ status: ExtractJobStatus.FAILED, run_data: error as any }).eq("id", job.id).throwOnError()
                failed++

            }



        }


        return Response.json({ completed, failed }, { status: 200, statusText: "success" });
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }


}