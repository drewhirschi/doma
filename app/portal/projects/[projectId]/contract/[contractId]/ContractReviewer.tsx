"use client"

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import * as actions from "./ContractReviewer.actions";

import { ActionIcon, Box, Button, Center, CopyButton, Divider, Drawer, Flex, Group, HoverCard, Menu, Paper, ScrollArea, SegmentedControl, Skeleton, Stack, Text, TextInput, Textarea, ThemeIcon, Title, Tooltip, UnstyledButton, rem } from "@mantine/core";
import { IconCheck, IconCloudCheck, IconCopy, IconDotsVertical, IconGripVertical, IconListSearch, IconMessageCircle, IconRefresh, IconRepeat, IconSettings, IconTrash, IconUser } from "@tabler/icons-react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useRef, useState } from "react";

import { BackButton } from "@/components/BackButton";
import { ContractDetailsDrawer } from './DetailsDrawer';
import { FormatterSwitch } from '@/components/FormattedInfoViews/FormattedInfoSwitch';
import { FormatterWithInfo } from '@/types/complex';
import { ScaledPosition } from '@/components/PdfViewer';
import { SubMenu } from './SubMenu';
import { browserClient } from "@/supabase/BrowserClient";
import dynamic from 'next/dynamic'
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useSearchParams } from "next/navigation";

const PDFView = dynamic(() => import('./PdfView'), { ssr: false, loading: () => <p>Loading...</p> })


export type ParsletWithNotes = Parslet_SB & { contract_note: { content: string }[] }
interface Props {
    pdfUrl: string
    pdfBase64: string
    projectId: string
    contract: Contract_SB & {
        extract_jobs: ExtractJob_SB[],
        // annotation: Annotation_SB[],
        // annotation: (Annotation_SB & { contract_line: ContractLine_SB[] })[]
    }
    parslets: Parslet_SB[]
    formatters: FormatterWithInfo[]
    annotations: Annotation_SB[]
}



export function ContractReviewer(props: Props) {

    const { pdfUrl, contract, annotations, projectId, parslets } = props

    const searchParams = useSearchParams()
    const [formatters, setFormatters] = useState(props.formatters)


    // const [leftSegment, setLeftSegment] = useState('formatters');
    const [opened, { open: openDetailsDrawer, close }] = useDisclosure(false);


    const panelRef = useRef<ImperativePanelHandle>(null);


    // const extractionsHighlights = contract.extracted_information.map(buildAnnotationFromExtraction)

    const [highlights, setHighlights] = useState<Annotation_SB[]>(annotations)
    const [savingNotes, setSavingNotes] = useState(false)
    const [loadingFormatters, setLoadingFormatters] = useState<string[]>([])
    const supabase = browserClient()










    async function handleSaveFormattedItems(formatterKey: string, infoId: number, data: any) {

        const res = await supabase.from("formatted_info")
            .upsert({
                contract_id: contract.id,
                data,
                formatter_key: formatterKey,
                id: infoId
            })
        if (res.error) {
            notifications.show({
                title: "Error",
                message: "There was an error. Please try again later.",
                color: "red"
            })
        }
    }


    async function handleRemoveFormattedItem(formatterKey: string, id: number) {
        const annotationIds = highlights.filter(h => h.formatter_key == formatterKey && h.formatter_item_id == id).map(h => h.id)
        await Promise.all(annotationIds.map(async (id) => handleRemoveHighlight(id)))

        const res = await supabase.from("formatted_info")
            .delete()
            .eq("id", id)
            .eq("formatter_key", formatterKey)
            .eq("contract_id", contract.id)

        setFormatters(prevFormatters => {
            const formatter = prevFormatters.find(f => f.key === f.key)
            if (formatter) {
                formatter.formatted_info = formatter.formatted_info.filter(fi => fi.id !== id)
            }
            return prevFormatters

        })

        if (res.error) {
            notifications.show({
                title: "Error",
                message: "There was an error. Please try again later.",
                color: "red"
            })
        }
    }

    async function handleRemoveHighlight(id: string) {
        const res = await supabase.from("annotation")
            .delete()
            .eq("id", id)

        setHighlights(prevHighlights => prevHighlights.filter(h => h.id !== id))

        if (res.error) {
            notifications.show({
                title: "Error",
                message: "There was an error. Please try again later.",
                color: "red"
            })
        }
    }

    async function handleAddHighlight(highlight: { position: ScaledPosition, text: string, formatterKey: string, itemId: number }) {
        const { position, text, formatterKey, itemId: itemIndex } = highlight


        const id: string = window.crypto.randomUUID()


        const newAnnotation: Omit<Annotation_SB, 'tenant_id' | 'created_at'> = {
            id,
            formatter_key: formatterKey,
            formatter_item_id: itemIndex ?? null,
            contract_id: contract.id,
            text: text ?? "",
            position: position,
            parslet_id: null,
            zextractor_id: null,
            is_user: true,
        }

        setHighlights(prevState => [...prevState, newAnnotation as Annotation_SB])

        try {

            const formattedInfo = formatters.find(f => f.key == formatterKey)?.formatted_info.find(fi => fi.id == itemIndex)

            let inputData = ""
            if (!formattedInfo) {
                const placeholder = {
                    contract_id: contract.id,
                    data: {},
                    formatter_key: formatterKey,
                    id: itemIndex,
                    created_at: new Date().toISOString()
                }
                setFormatters((prevState) => {
                    return prevState.map(formatter => {
                        if (formatter.key === formatterKey && !formatter.formatted_info.includes(placeholder)) {
                            formatter.formatted_info.push(placeholder)
                        }
                        return formatter
                    })


                })
                const fiInsertRes = await supabase.from("formatted_info").insert(placeholder).throwOnError()
            } else {

                inputData += `<currentState>${JSON.stringify(formattedInfo.data)}</currentState>\n`
            }
            inputData += `<newData>${text}</newData>`

            // @ts-ignore
            const annotationInsertRes = await supabase.from("annotation").insert(newAnnotation).throwOnError()





            setLoadingFormatters((prevState) => prevState.concat([formatterKey]))
            const formattedInfoRes = await actions.format(formatterKey, contract.id, projectId, inputData)
            setLoadingFormatters((prevState) => prevState.filter(f => f !== formatterKey))
            if (formattedInfoRes.error) {
                // @ts-ignore
                throw new Error(formattedInfoRes.error.message)
            }


            if (formattedInfoRes.ok.length > 0) {
                setFormatters((prevState) => {
                    const updatedFormatters = prevState.map(formatter => {
                        if (formatter.key === formatterKey && formatter.formatted_info.find(fi => fi.id == itemIndex)) {
                            formatter.formatted_info.find(fi => fi.id == itemIndex)!.data = formattedInfoRes.ok[0]
                        }
                        return formatter
                    })
                    return updatedFormatters
                })
                const upsertRes = await supabase.from("formatted_info").update({ data: formattedInfoRes.ok[0] })
                    .eq("id", itemIndex)
                    .eq("formatter_key", formatterKey)
                    .eq("contract_id", contract.id)
                    .throwOnError()
            }





        } catch (error) {
            setLoadingFormatters((prevState) => prevState.filter(f => f !== formatterKey))
            console.error(error)
            notifications.show({
                title: "Error",
                message: "There was an error. Please try again later.",
                color: "red"
            })
        }








    }



    const backParams = new URLSearchParams()
    backParams.set('path', contract.path_tokens.slice(0, -1).join("/") ?? "")
    const backUrl = `/portal/projects/${projectId}/tabs/${searchParams.get("from") ?? "overview"}?${backParams.toString()}`

    return (
        <>

            <PanelGroup direction="horizontal">
                <Panel defaultSize={40} minSize={30} style={{ height: "100dvh" }}>
                    <Stack pb={"lg"} justify="space-between" align="stretch" gap="xs" pl={"md"} style={{ height: "100dvh" }}>
                        <Group mt={"md"}>
                            <BackButton href={backUrl} style={{ alignSelf: "flex-start" }} />
                            {savingNotes ? <IconRefresh color="gray" size={20} /> : <IconCloudCheck color="gray" size={20} />}

                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <ActionIcon variant="subtle" c={"gray"}>
                                        <IconDotsVertical />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item leftSection={<IconCheck style={{ width: rem(14), height: rem(14) }} />}
                                        onClick={async () => {
                                            await actions.completeContractAction(contract.id)
                                        }}
                                    >
                                        Mark completed
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconCheck style={{ width: rem(14), height: rem(14) }} />}
                                        onClick={async () => {
                                            try {

                                                await actions.describeAndTag(contract.id, projectId, contract.target)
                                            } catch (error) {
                                                console.error(error)
                                                notifications.show({
                                                    title: "Error",
                                                    message: "There was an error. Please try again later.",
                                                    color: "red"
                                                })
                                            }
                                        }}
                                    >
                                        Run description
                                    </Menu.Item>

                                    <Menu.Label>AI</Menu.Label>
                                    <Menu.Item disabled
                                        leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                        onClick={() => {
                                            actions.zuvaExtraction(contract.id)
                                        }}
                                    >
                                        Zuva extraciton
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                        onClick={() => {
                                            actions.reviewContractAction(contract.id)
                                        }}
                                    >
                                        Run extraciton
                                    </Menu.Item>
                                    {/* <SubMenu/> */}
                                    <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                        onClick={() => {
                                            actions.deleteContractExtractedInfo(contract.id, projectId)
                                        }}
                                    >
                                        Reset contract
                                    </Menu.Item>

                                    <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                        onClick={() => {
                                            try {

                                                actions.runFormatters(contract.id, projectId, contract.target)
                                            } catch (e) {
                                                notifications.show({
                                                    title: "Error",
                                                    message: "There was an error. Please try again later.",
                                                    color: "red"
                                                })
                                                console.error(e)
                                            }
                                        }}
                                    >
                                        Run formatters
                                    </Menu.Item>

                                    <Menu.Divider />
                                    <Menu.Label>Extract</Menu.Label>
                                    {formatters.map(f => (<Menu.Item key={f.key} onClick={() => actions.reExtractTopic(contract.id, f.key)}>{f.display_name}</Menu.Item>))}
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                        {/* <HoverCard openDelay={500}>
                            <HoverCard.Target> */}
                        <UnstyledButton
                            onClick={() => openDetailsDrawer()}
                        >
                            <Title order={3}>{contract.display_name}</Title>
                        </UnstyledButton>
                        {/* </HoverCard.Target>
                            <HoverCard.Dropdown>
                                <Group>
                                    <MetadataItem header="Contract ID" text={contract.id} />
                                    <CopyButton value={contract.id} timeout={2000}>
                                        {({ copied, copy }) => (
                                            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                                <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                                    {copied ? (
                                                        <IconCheck style={{ width: rem(16) }} />
                                                    ) : (
                                                        <IconCopy style={{ width: rem(16) }} />
                                                    )}
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </CopyButton>
                                </Group>
                            </HoverCard.Dropdown>
                        </HoverCard> */}
                        <Divider />
                        <ScrollArea
                            offsetScrollbars
                            h={"100%"}
                        // pl={"xs"}
                        >


                            <Stack gap={"lg"}>

                                {formatters
                                    // .filter(f => f.formatted_info.length > 0)
                                    .map(f => (
                                        <FormatterSwitch
                                            annotations={highlights.filter(h => h.formatter_key == f.key)}
                                            removeAnnotation={handleRemoveHighlight}
                                            removeItem={async (id) => handleRemoveFormattedItem(f.key, id)}
                                            handleSave={async (itemId:number, data:any) => handleSaveFormattedItems(f.key, itemId, data)}
                                            formatter={f}
                                            contractId={contract.id}
                                            isLoading={loadingFormatters.includes(f.key)}
                                            key={f.key}
                                            singleRun={() => {
                                                // actions.format(f.key, contract.id, projectId, contract.target)

                                            }}

                                        />
                                    ))
                                }
                                <Box h={"100%"} />

                            </Stack>
                        </ScrollArea>
                    </Stack>

                </Panel>
                <PanelResizeHandle style={{ width: "16px" }}>
                    <Center h={'100dvh'}>
                        <IconGripVertical />
                    </Center>
                </PanelResizeHandle>
                <Panel minSize={30} defaultSize={60} ref={panelRef} >
                    <PDFView
                        pdfUrl={pdfUrl}
                        pdfBase64={props.pdfBase64}
                        contract={contract}
                        formatters={formatters}
                        highlights={highlights}
                        handleAddHighlight={handleAddHighlight}
                        handleRemoveHighlight={handleRemoveHighlight}
                        parslets={parslets}
                        scrollFiIntoView={(formatterKey: string | null, itemId: number | null) => {
                            const searchId = `${formatterKey}${String(itemId)}`
                            const element = document.getElementById(searchId);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                                // const scrolledY = window.scrollY;
                                // if (scrolledY) {
                                //     window.scroll({
                                //         top: scrolledY - 20,
                                //         behavior: 'smooth'
                                //     });
                                // }
                            }
                        }
                        }
                    />



                </Panel>


            </PanelGroup >
            <Drawer position="right" offset={8} radius="md" opened={opened} onClose={close} size={"lg"} title="Contract details">
                <ContractDetailsDrawer contract={contract} />
            </Drawer>
        </>

    )


}