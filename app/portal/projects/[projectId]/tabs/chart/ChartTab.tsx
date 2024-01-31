"use client"

import { Table, TableScrollContainer, TableTbody, TableTh, TableThead, TableTr } from "@mantine/core";

import classes from "./Chart.module.css"
import { serverClient } from "@/supabase/ServerClients";

interface Props {
    parslets: any[]
    contracts: (Contract_SB & { contract_note: ContractNote_SB[] })[]
}

export default function Chart(props: Props) {

    const rows = props.contracts.map(contract => {

        return (
            <Table.Tr key={`row_${contract.id}`}>
                <Table.Td >{contract.display_name}</Table.Td>
                {props.parslets.map((parslet, i) => (
                    <Table.Td className={classes.tabledata} key={parslet.id + contract.id}>
                        {contract.contract_note.find(note => note.parslet_id === parslet.id)?.content}
                    </Table.Td>
                ))}
                {/* {contract.contract_note.map(note => <Table.Td style={{ maxWidth: 500}}>{note.content}</Table.Td>)} */}
            </Table.Tr>
        )
    })

    return (
        <TableScrollContainer minWidth={500} flex={1}   >
            <Table
            // unstyled
                horizontalSpacing={"md"}
                withColumnBorders   
                stickyHeader 
                // stickyHeaderOffset={60}
                >

                <TableThead>
                    <TableTr>
                        <TableTh miw={150} mx={"sm"} styles={{
                            th: {
                                whiteSpace: "nowrap"

                            }
                        }}>Contract name</TableTh>
                        {props.parslets.map(parslet => <TableTh key={`th_${parslet.id}`} miw={150} mx={"sm"} styles={{
                            th: {
                                whiteSpace: "nowrap"

                            }
                        }}>{parslet.display_name}</TableTh>)}

                    </TableTr>
                </TableThead>
                <TableTbody>{rows}</TableTbody>
            </Table>

        </TableScrollContainer>
    );
}