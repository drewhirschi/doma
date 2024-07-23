import { ContractReviewer } from './ContractReviewer';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

// export const revalidate = 0
// export const dynamic = 'force-dynamic'

export const maxDuration = 300

export default async function Page({ params }: { params: { projectId: string, contractId: string } }) {

    const supabase = serverClient()


    const tenantId = await getUserTenant(supabase)

    if (!tenantId) {
        throw new Error("No tenant id")
    }


    const [contractQ, parsletQ, formattersQ] = await Promise.all([
        supabase.from("contract").select("*, annotation(*), extract_jobs(*)").eq("id", params.contractId).single(),
        supabase.from("parslet").select("*").order("order", { ascending: true }),
        supabase.from("formatters")
            .select("*, formatted_info(*), project_formatters!inner(*)")
            .eq("project_formatters.project_id", params.projectId)
            .eq("formatted_info.contract_id", params.contractId)
            .order("priority", { ascending: true })
    ])

    if (!contractQ.data || !parsletQ.data) {
        console.error(contractQ.error, parsletQ.error)
        throw new Error("Failed to fetch data")
    }

    const fileRes = await supabase.storage.from("tenants").download(contractQ.data.name, {})
    if (!fileRes.data) {
        console.error(fileRes.error)
        throw new Error("Failed to download file")
    }
    const fileBase64 = Buffer.from(await fileRes.data.arrayBuffer()).toString('base64');



    const signedDownloadContractUrlQ = await supabase
        .storage
        .from('tenants')
        .createSignedUrl(contractQ.data.name, 60 * 60)

    const signedDownloadContractUrl = new URL(signedDownloadContractUrlQ.data?.signedUrl ?? "")
    signedDownloadContractUrl.searchParams.append('response-content-disposition', `attachment; filename="${contractQ.data.display_name ?? contractQ.data.id + '.pdf'}"`);




    return (


        <ContractReviewer
            pdfBase64={fileBase64}
            signedDownloadContractUrl={signedDownloadContractUrl.toString()}
            contract={contractQ.data}
            projectId={params.projectId}
            parslets={parsletQ.data ?? []}
            formatters={formattersQ.data ?? []}
            annotations={contractQ.data.annotation ?? []}
        />

    );
};
