import { useEffect, useState } from 'react';

import Cookies from "js-cookie"
import { browserClient } from '@/supabase/BrowserClient';

export const usePageTracking = (reportId:number) => {

    const [view, setView] = useState<ReportView_SB | null>(null)

    const userId = Cookies.get('parsluid')

    
    const sb = browserClient()
    
    useEffect(() => {
        if (!userId) return
        const startTime = Date.now();

        // Track page view on component mount
        const trackPageView = async () => {

            
            if (view) return;
            try {
                
                const insert = await sb.from("report_views").insert({ parsluid: userId, report_id: reportId }).select().single()
                setView(insert.data)
            } catch (error) {
                
            }
        };

        // Track page exit on component unmount
        const trackDuration = async () => {
            if (!view) return;
            const duration = Date.now() - startTime;
            try {
                await sb.from("report_views").update({ duration:Math.floor(duration/1000) }).eq("id", view?.id)
            } catch (error) {
                
            }
        };

        trackPageView();
        const intervalId = setInterval(trackDuration, 10_000);


        return () => {
            clearInterval(intervalId);
            // trackPageExit();
        };
    }, [view]);
};

