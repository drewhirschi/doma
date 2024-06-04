"use client"

import { ActionIcon, Anchor, Group, Table, TableScrollContainer, TableTbody, TableTh, TableThead, TableTr, Tooltip } from "@mantine/core";
import { IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes";
import { writeFile, utils as xlsxUtils } from "xlsx";

import { ContractReviewerLink } from "@/components/PdfViewer/components/ContractReveiwerLink";
import { ErrorBoundary } from "react-error-boundary";
import { FormattedInfoView } from "./FormattedInfoView";
import { IconFileDownload } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./Chart.module.css"
import { formattedInfoStr } from "./utils";
import { serverClient } from "@/supabase/ServerClients";

interface Props {
    projectId: string
    contracts: (Contract_SB)[]
    formatters: (Formatter_SB & { formatted_info: (FormattedInfo_SB & { annotation: Annotation_SB[] })[] })[]
}

export default function Chart(props: Props) {


    const exportToExcel = (data: string[][], fileName: string) => {
        const ws = xlsxUtils.aoa_to_sheet(data);
        ws['!cols'] = data[0].map(d => ({wpx:300}))
        ws['!rows'] = [{hpx:15}, ...data.slice(1).map(d => ({hpx:45}))]
        const wb = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(wb, ws, 'Sheet1');
        writeFile(wb, `${fileName}.xlsx`);
    };

    const formatterRows = props.contracts.map(contract => {

        return (
            <Table.Tr key={`row_${contract.id}`}>
                <Table.Td >
                    <ContractReviewerLink
                        contractId={contract.id}
                        projectId={props.projectId}
                        from={'chart'}
                    >{contract.display_name ?? ""}</ContractReviewerLink>
                </Table.Td>
                {props.formatters.map((formatter, i) => (
                    <Table.Td className={classes.tabledata} key={formatter.key + contract.id}>

                        {/* {(formatter.formatted_info.find((fi) => fi.contract_id == contract.id)?.data as unknown as IFormatResponse)?.summary ?? ""} */}
                        <ErrorBoundary
                            fallback={<div>There was an error</div>}
                        >

                            <FormattedInfoView
                                projectId={props.projectId}
                                infoArray={formatter.formatted_info.filter(fi => fi.contract_id == contract.id)}
                            />
                        </ErrorBoundary>

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
        // <TableScrollContainer minWidth={500} flex={1}   >
        <>
            <Group p={"sm"}>
                <Tooltip label="Download as xlsx">
                    <ActionIcon variant="light" aria-label="Download as xlsx" onClick={() => {

                        const headerRow = ['name', ...props.formatters.map(f => f.key)]
                        const excelData:string[][] = [headerRow]
                        for (const contract of props.contracts) {
                            // const row = new Map()
                            const row:string[] = []
                            row.push(contract.display_name ?? contract.id)
                            props.formatters.forEach((formatter) => {
                                const formattedInfo = formattedInfoStr({
                                    infoArray: formatter.formatted_info.filter((fi: FormattedInfo_SB) => fi.contract_id == contract.id),
                                    projectId: props.projectId
                                })
                                row.push(formattedInfo)
                            })
                            excelData.push(row)
                        }




                        exportToExcel(excelData, "Project_Chart")
                    }}>
                        <IconFileDownload style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
                </Tooltip>

            </Group>
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
                                whiteSpace: "nowrap",
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

        </>
        //  </TableScrollContainer>
    );
}