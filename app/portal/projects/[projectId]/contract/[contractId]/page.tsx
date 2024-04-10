import { ContractReviewer } from './ContractReviewer';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

// export const revalidate = 0
// export const dynamic = 'force-dynamic'


export default async function Page({ params }: { params: { projectId: string, contractId: string } }) {

    const supabase = serverClient()


    const tenantId = await getUserTenant(supabase)

    if (!tenantId) {
        throw new Error("No tenant id")
    }


    const [contractQ, parsletQ, formattersQ] = await Promise.all([
        supabase.from("contract").select("*, annotation(*), extract_jobs(*)").eq("id", params.contractId).single(),
        supabase.from("parslet").select("*").order("order", { ascending: true }),
        supabase.from("formatters").select("*, formatted_info(*)").eq("formatted_info.contract_id", params.contractId)
        .order("priority", { ascending: true })
    ])

    if (!contractQ.data || !parsletQ.data) {
        console.error(contractQ.error, parsletQ.error)
        throw new Error("Failed to fetch data")
    }

    const fileRes = await supabase.storage.from(tenantId!).download(contractQ.data.name, {})
    if (!fileRes.data) {
        console.error(fileRes.error)
        throw new Error("Failed to download file")
    }
    const fileBase64 = Buffer.from(await fileRes.data.arrayBuffer()).toString('base64');
    

   


    const signedUrlQ = await supabase.storage.from(tenantId!).createSignedUrl(contractQ.data.name, 60, {})

    if (!signedUrlQ.data) {
        console.error(signedUrlQ.error)
        throw new Error("Failed to fetch contract url")
    }


    return (


        <ContractReviewer
            pdfUrl={signedUrlQ.data.signedUrl}
            pdfBase64={fileBase64}
            contract={contractQ.data}
            projectId={params.projectId}
            parslets={parsletQ.data ?? []}
            formatters={formattersQ.data ?? []}
            annotations={contractQ.data.annotation ?? []}
        />

    );
};
