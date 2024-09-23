"use client"

import { ActionIcon, Box, Button, Center, Container, Divider, Drawer, Grid, Group, Loader, Stack, Stepper, Text, TextInput, Textarea, Title, UnstyledButton, rem } from "@mantine/core";
import { IconExternalLink, IconPlus } from "@tabler/icons-react";
import { saveSections, searchAllSections, writeDraft } from "./actions";
import { useEffect, useState } from "react";

import { ISection } from "./types";
import Link from "next/link";
import { SectionDrawerContents } from "./SectionEditDrawer";
import { SectionView } from "./SectionView";
import { browserClient } from "@/shared/supabase-client/BrowserClient";

interface IReportEditorProps {
    report: Report_SB
    sections: (ReportSection_SB & { search_result: SearchResult_SB[] })[]
}

export function ReportEditor({ report, sections }: IReportEditorProps) {


    const [sectionsData, setSectionsData] = useState(sections)



    return (
        <Box>

            <Group justify="space-between" p={"xl"}>
                <Title>{report.display_name}</Title>
                <ActionIcon
                    size={42}
                    variant="default"
                    href={`/reports/${report.id}`}
                    target='_blank'
                    component={Link}
                >
                    <IconExternalLink style={{ width: rem(24), height: rem(24) }}
                    />
                </ActionIcon>
            </Group>



            <Container>

                {/* <Button disabled={searchState !== 'success'} loading={draftState === 'loading'}
                            onClick={async () => {
                                const sectionsWithMd = await writeDraft(topic, sectionsData)
                               
                            }}
                        >Write a draft</Button>
                      
                        */}
                {/* <Button onClick={() => {
                            const combinedMd = `# ${topic}\n\n` +sectionsData.reduce((acc: string, section: ISection) => {
                                return `${acc}## ${section.name}\n${section.md}\n\n`;
                            }, '');

                            const blob = new Blob([combinedMd], { type: "text/markdown" })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `${topic.replaceAll(" ", "_")}.md`
                            link.click()
                            URL.revokeObjectURL(url)
                        }}>Export</Button> */}


                <Stack gap={"xs"}>
                    {sectionsData.map((section, i: number) => (

                        <SectionView key={i} section={section} report={report} />

                    ))}

                </Stack>

                <Button
                mt={"md"}
                    variant="default"
                    fullWidth
                    onClick={async () => {
                        const sb = browserClient()
                        const insert = await sb.from('report_sections').insert({
                            report_id: Number(report.id),
                        }).select().single()

                        if (!insert.error) {
                            setSectionsData([...sectionsData, { ...insert.data, search_result: [] }])
                        }

                    }}
                    leftSection={<IconPlus style={{ width: rem(14), height: rem(14) }} />}
                >Add section</Button>
            </Container>


        </Box >

    );
}