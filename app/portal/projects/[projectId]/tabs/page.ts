import { redirect } from "next/navigation";

export default function Page({params}: {params: {projectId: string}}) {
    return redirect(`/portal/projects/${params.projectId}/tabs/overview`)
}