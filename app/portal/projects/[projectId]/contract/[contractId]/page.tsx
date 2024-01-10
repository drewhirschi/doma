import { ContractReviewer } from './ContractReviewer';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string, contractId: string } }) {

    const supabase = serverClient()


    const tenantId = await getUserTenant(supabase)

    if (!tenantId) {
        throw new Error("No tenant id")
    }


    const [contractQ, parsletQ] = await Promise.all([
        supabase.from("contract").select("*, annotation(*)").eq("id", params.contractId).single(),
        supabase.from("parslet").select("*").eq("tenant_id", tenantId!)
    ])

    if (!contractQ.data || !parsletQ.data) {
        console.error(contractQ.error, parsletQ.error)
        throw new Error("Failed to fetch data")
    }

    const signedUrlQ = await supabase.storage.from(tenantId!).createSignedUrl(contractQ.data.name, 60, {})

    if (!signedUrlQ.data) {
        console.error(signedUrlQ.error)
        throw new Error("Failed to fetch contract url")
    }



    return (


        <ContractReviewer
            pdfUrl={signedUrlQ.data.signedUrl}
            contractId={params.contractId}
            projectId={params.id}
            parslets={parsletQ.data ?? []}
            annotations={contractQ.data.annotation ?? []}
        />

    );
};
