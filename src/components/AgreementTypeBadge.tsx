import { Badge } from "@mantine/core";

export function AgreementTypeBadge({ type }: { type: string }) {
    switch (type) {
        case 'customer_agreement':
            return <Badge color='teal'>Customer</Badge>;
        case 'joint_development_agreement':
            return <Badge color="pink">Joint development</Badge>;
        case 'employee_agreement':
            return <Badge color="orange">Employee</Badge>;
        // case 'license_agreement':
        //     return 'indigo';
        default:
            return <Badge color="gray">Unknown</Badge>;
    }
}