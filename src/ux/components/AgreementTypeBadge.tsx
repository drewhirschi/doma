import { Badge, Box, Button, Combobox, ScrollArea, Text, useCombobox } from '@mantine/core';

import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { useState } from 'react';

export function AgreementTypeBadge({ type, contractId }: { type: string, contractId: string }) {

    const sb = browserClient();



    const [selectedType, setSelectedType] = useState<string>(type);
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });




    const typeData: Record<string, { color: string, text: string }> = {
        'customer_agreement': {
            color: 'teal',
            text: "Customer"
        },
        'supply_agreement': {
            color: 'teal',
            text: "Supply"
        },
        'distribution_agreement': {
            color: "blue",
            text: "Distribution"
        },
        'non_disclosure_agreement': {
            color: "violet",
            text: "NDA"
        },
        'contractor_agreement': {
            color: "green",
            text: "Contractor"
        },
        'employee_agreement': {
            color: "orange",
            text: "Employee"
        },
        'intercompany_agreement': {
            color: "cyan",
            text: "Intercompany"
        },
        'joint_development_agreement': {
            color: "pink",
            text: "Joint Development"
        },
        'collaboration_agreements': {
            color: "purple",
            text: "Collaboration"
        },
        'data_processing_agreement': {
            color: "lime",
            text: "Data Processing"
        },
        'settlement_agreement': {
            color: "red",
            text: "Settlement"
        },
        'standards_setting_bodies_agreements': {
            color: "brown",
            text: "Standards Body"
        },
        'advertising_agreement': {
            color: "yellow",
            text: "Advertising"
        },
        'publishing_agreement': {
            color: "#795548",
            text: "Publishing"
        },
        'marketing_inbound_agreement': {
            color: "#2196f3",
            text: "Inbound Marketing"
        },
        'marketing_outbound_agreement': {
            color: "#3f51b5",
            text: "Outbound Marketing"
        },
        'marketing_joint_agreement': {
            color: "indigo",
            text: "Joint Marketing"
        },
        'marketing_cross_agreement': {
            color: "#ff5722",
            text: "Cross Marketing"
        },
        "unknown": {
            color: "gray",
            text: "Unknown"
        }
    }

    const options = Object.entries(typeData).map(([key, value]) => (
        <Combobox.Option value={key} key={key}>
            <Badge color={value.color}>{value.text}</Badge>
        </Combobox.Option>
    ));

    return (
        <>
            <Combobox
                store={combobox}
                width={250}
                position="bottom-start"
                withArrow
                withinPortal={false}
                onOptionSubmit={(val) => {
                    setSelectedType(val);
                    sb.from("contract").update({ tag: val }).eq("id", contractId).then(() => {})
                    combobox.closeDropdown();
                }}
            >
                <Combobox.Target>
                    <Button radius={'lg'} px={"sm"} size='compact-xs' color={typeData[selectedType]?.color ?? "gray"} onClick={() => combobox.toggleDropdown()}
                    >{typeData[selectedType]?.text.toUpperCase() ?? "NONE"}</Button>
                </Combobox.Target>

                <Combobox.Dropdown >
                    <Combobox.Options>
                        <ScrollArea.Autosize mah={200} type="scroll">
                            {options}
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>

        </>
    );

}