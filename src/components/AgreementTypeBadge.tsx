import { Badge } from "@mantine/core";

export function AgreementTypeBadge({ type }: { type: string }) {
    
    switch (type) {
        case 'customer_agreement':
            return <Badge color='teal'>Customer</Badge>;
        case 'supply_agreement':
            return <Badge color='teal'>Supply</Badge>;
        case 'distribution_agreement':
            return <Badge color="blue">Distribution</Badge>;
        case 'non_disclosure_agreement':
            return <Badge color="violet">NDA</Badge>;
        case 'contractor_agreement':
            return <Badge color="green">Contractor</Badge>;
        case 'employee_agreement':
            return <Badge color="orange">Employee</Badge>;
        case 'intercompany_agreement':
            return <Badge color="cyan">Intercompany</Badge>;
        case 'joint_development_agreement':
            return <Badge color="pink">Joint development</Badge>;
        case 'collaboration_agreements':
            return <Badge color="purple">Collaboration</Badge>;
        case 'data_processing_agreement':
            return <Badge color="lime">Data Processing</Badge>;
        case 'settlement_agreement':
            return <Badge color="red">Settlement</Badge>;
        case 'standards_setting_bodies_agreements':
            return <Badge color="brown">Standards Body</Badge>;
        case 'advertising_agreement':
            return <Badge color="yellow">Advertising</Badge>;
        case 'publishing_agreement':
            return <Badge color="amber">Publishing</Badge>;
        case 'marketing_inbound_agreement':
            return <Badge color="deepOrange">Inbound Marketing</Badge>;
        case 'marketing_outbound_agreement':
            return <Badge color="deepPurple">Outbound Marketing</Badge>;
        case 'marketing_joint_agreement':
            return <Badge color="indigo">Joint Marketing</Badge>;
        case 'marketing_cross_agreement':
            return <Badge color="blueGrey">Cross Marketing</Badge>;
        case 'unknown':
        default:
            return <Badge color="gray">Unknown</Badge>;
    }
    
}