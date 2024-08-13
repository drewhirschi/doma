"use client"

import Cookies from "js-cookie"
import { ReactPdfViewer } from "./ReactPdfViewer"
import { browserClient } from "@/supabase/BrowserClient"
import { serverClient } from "@/supabase/ServerClients"
import { usePageTracking } from "./PageTrackingHook"
import { useRouter } from "next/navigation"

interface IParams {
    reportSlug: string
}

export default function page({ params, searchParams }: { params: any, searchParams: any }) {

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