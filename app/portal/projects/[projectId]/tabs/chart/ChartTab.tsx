"use client"

import { Anchor, Table, TableScrollContainer, TableTbody, TableTh, TableThead, TableTr } from "@mantine/core";
import { IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes";

import { FormattedInfoView } from "./FormattedInfoView";
import Link from "next/link";
import classes from "./Chart.module.css"
import { serverClient } from "@/supabase/ServerClients";

interface Props {
    projectId: string
    contracts: (Contract_SB)[]
    formatters: (Formatter_SB & { formatted_info: (FormattedInfo_SB & { annotation: Annotation_SB[] })[] })[]
}

export default function Chart(props: Props) {

    const formatterRows = props.contracts.map(contract => {

        return (
            <Table.Tr key={`row_${contract.id}`}>
                <Table.Td >
                    <Anchor href={`/portal/projects/${props.projectId}/contract/${contract.id}`} component={Link}>{contract.display_name}</Anchor>

                </Table.Td>
                {props.formatters.map((formatter, i) => (
                    <Table.Td className={classes.tabledata} key={formatter.key + contract.id}>
                        {/* {(formatter.formatted_info.find((fi) => fi.contract_id == contract.id)?.data as unknown as IFormatResponse)?.summary ?? ""} */}
                        <FormattedInfoView
                            projectId={props.projectId}
                            infoArray={formatter.formatted_info.filter(fi => fi.contract_id == contract.id)}
                        />
                    </Table.Td>
                ))}
            </Table.Tr>
        )
    })
    // const parsletRows = props.contracts.map(contract => {

    //     return (
    //         <Table.Tr key={`row_${contract.id}`}>
    //             <Table.Td >
    //                 <Anchor href={`/portal/projects/${props.projectId}/contract/${contract.id}`} component={Link}>{contract.display_name}</Anchor>

    //             </Table.Td>
    //             {props.parslets.map((parslet, i) => (
    //                 <Table.Td className={classes.tabledata} key={parslet.id + contract.id}>
    //                     {contract.contract_note.find(note => note.parslet_id === parslet.id)?.content}
    //                 </Table.Td>
    //             ))}
    //             {/* {contract.contract_note.map(note => <Table.Td style={{ maxWidth: 500}}>{note.content}</Table.Td>)} */}
    //         </Table.Tr>
    //     )
    // })

    return (
        <TableScrollContainer minWidth={500} flex={1}   >
            <Table
                horizontalSpacing={"md"}
                withColumnBorders
                stickyHeader
                // stickyHeaderOffset={60}
                classNames={{
                    table: classes.table,
                    th: classes.th,
                    td: classes.td
                    // thead: classes.thead,
                    // tbody: classes.tbody,
                    // tr: classes.tr,

                }}
            >

                <TableThead>
                    <TableTr>
                        <TableTh miw={150} mx={"sm"} styles={{
                            th: {
                                whiteSpace: "nowrap"

                            }
                        }}>Contract name</TableTh>
                        {/* {props.parslets.map(parslet => <TableTh key={`th_${parslet.id}`} miw={150} mx={"sm"} styles={{
                            th: {
                                whiteSpace: "nowrap"

                            }
                        }}>{parslet.display_name}</TableTh>)} */}
                        {props.formatters.map(formatter => <TableTh key={`th_${formatter.key}`} miw={150} mx={"sm"} styles={{
                            th: {
                                whiteSpace: "nowrap"

                            }
                        }}>{formatter.display_name}</TableTh>)}

                    </TableTr>
                </TableThead>
                {/* <TableTbody>{parsletRows}</TableTbody> */}
                <TableTbody>{formatterRows}</TableTbody>
            </Table>

        </TableScrollContainer>
    );
}