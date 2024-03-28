import { ActionIcon, Anchor, Badge, Box, Button, Group, Select, Stack, Text, Textarea, Title } from "@mantine/core"
import { UseFormReturnType, useForm } from "@mantine/form";
import { useEffect, useState } from "react";

import { AnnotationsList } from "./AnnotationsList";
import { IconTrash } from "@tabler/icons-react";
import MetadataItem from "../MetadataItem"
import { notifications } from "@mantine/notifications";
import { useDebouncedCallback } from 'use-debounce';
import { z } from 'zod'

interface ItemShapeWrapper<T> {
    infos: {
        data: T
    }[]
    
}
export interface ItemViewProps<T> {
    index: number,
    form: UseFormReturnType<ItemShapeWrapper<T>>
    onChange: () => void
}

export interface ListFormatterViewProps {
    info: FormattedInfo_SB<any>[]
    handleSave: (info: any[]) => Promise<void>
    annotations: Annotation_SB[]
    removeAnnotation: (id: string) => Promise<void>
    removeItem: (id: number) => Promise<void>
    formatterKey: string
    contractId: string
    ItemView: React.ComponentType<ItemViewProps<any>>
}


export function FormattedItemList({ info, handleSave, annotations, removeAnnotation, formatterKey, contractId, removeItem, ItemView }: ListFormatterViewProps) {
    const form = useForm({
        initialValues: {
            infos: info
        },
    });
    useEffect(() => {
        form.setValues({
            infos: info
        })

    }, [info])

  
    const debouncedSave = useDebouncedCallback(async () => {

        // console.log("saving")
        await handleSave(form.values.infos)
        

    }, 600)

    async function handleChildFormChange()  {
        try {
            // console.log('got change')
            debouncedSave()
        } catch (e) {
            console.error(e)
            notifications.show({
                title: "Failed to save",
                message: "An error occurred while saving the data",
                color: "red"
            })
        }
    }



    return (
        <form onChange={handleChildFormChange }>

            <Stack gap={"lg"}>
                {form.values?.infos.map((info, i) => (
                    <Box key={"termination" + i.toString()} p="sm"
                    >
                        <Group justify="space-between">
                            <Title order={4}>Item {i + 1}</Title>
                            <ActionIcon variant="subtle" color="gray" onClick={async () => {

                                
                                form.removeListItem("infos", i)
                                removeItem(info.id)

                            }}>

                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                            </ActionIcon>
                        </Group>
                        <AnnotationsList
                            annotations={annotations.filter(a => a.formatter_item_id === info.id)}
                            removeAnnotation={removeAnnotation}
                        />
                        {<ItemView index={i} form={form} onChange={handleChildFormChange} />}
                    </Box>

                )) ?? []}
                <Group justify="flex-end">

                    <Button size="xs" variant="default" onClick={() => {

                        const newItem: FormattedInfo_SB = {
                            contract_id: contractId,
                            formatter_key: formatterKey,
                            created_at: new Date().toISOString(),
                            id: info.length == 0 ? 0 : Math.max(...info.map(fi => fi.id)) + 1,
                            data: {
                                summary: "",
                                tag: null
                            }

                        }
                        form.insertListItem('infos', newItem);

                    }}>Add</Button>
                </Group>

            </Stack>
        </form >
    )
}