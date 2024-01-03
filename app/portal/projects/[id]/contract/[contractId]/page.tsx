import { PDFHighlighter } from './PDFHighlighter';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string, contractId: string } }) {

    const supabase = serverClient()


    const tenantId = await getUserTenant(supabase)
    const { data, error } = await supabase.from("contract").select("*, annotation(*)").eq("id", params.contractId).single()
    const { data: signedUrl, error: signedUrlError } = await supabase.storage.from(tenantId!).createSignedUrl(data.name, 60, {})

    const parsletQ = await supabase.from("parslet").select("*").eq("tenant_id", tenantId!)


    

    console.log("num annotations", data.annotation.length)




    return (


        <PDFHighlighter
            pdfUrl={signedUrl?.signedUrl!}
            contractId={params.contractId}
            projectId={params.id}
            parslets={parsletQ.data ?? []}
            annotations={data.annotation ?? []}
        // saveHighlight={}
        />

    );
};
