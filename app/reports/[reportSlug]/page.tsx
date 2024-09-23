"use client"

import Cookies from "js-cookie"
import { ReactPdfViewer } from "./ReactPdfViewer"
import { browserClient } from "@/shared/supabase-client/BrowserClient"
import { serverClient } from "@/shared/supabase-client/ServerClients"
import { usePageTracking } from "./PageTrackingHook"
import { useRouter } from "next/navigation"

interface IParams {
    reportSlug: string
}

export default function Page({ params, searchParams }: { params: any, searchParams: any }) {

    if (searchParams.parsluid) {
        Cookies.set('parsluid', searchParams.parsluid)
    }
    usePageTracking(Number(params.reportSlug))


    

        return (
            <div>
                <ReactPdfViewer
                    // file={blob}
                    reportId={Number(params.reportSlug)}
                />
            </div>
        );
   
}