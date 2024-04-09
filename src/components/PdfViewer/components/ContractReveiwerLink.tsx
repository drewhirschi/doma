import { Anchor } from "@mantine/core";
import Link from "next/link";

interface Props {
    contractId: string
    projectId: string
    from: string
    children: React.ReactNode
    annotationId?: string
}

export function ContractReviewerLink(props: Props) {
    const { contractId, projectId, children } = props

    let href = `/portal/projects/${projectId}/contract/${contractId}`
    const params = new URLSearchParams();
    params.set('from', props.from)
    href += "?" + params.toString()
    
    if (props.annotationId) {
        href += `#${props.annotationId}`
    }

    return (
        <Anchor href={href} component={Link}>
            {children}
        </Anchor>
    )
}