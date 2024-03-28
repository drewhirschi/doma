import { Anchor, Badge, Button, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from "@mantine/core"
import { UseFormReturnType, useForm } from '@mantine/form';
import { useEffect, useState } from "react";

import { AgreementInfoFormatResponse } from "@/types/formattersTypes"
import { AnnotationsList } from "./AnnotationsList";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useDebouncedCallback } from "use-debounce";

export interface ViewProps<T> {
    form: UseFormReturnType<T>
    onChange: () => void
}

export interface FormatterViewWrapperProps {
    info: FormattedInfo_SB<any>[]
    handleSave: (info: FormattedInfo_SB<any>[]) => Promise<void>
    annotations: Annotation_SB[]
    removeAnnotation: (id: string) => void
    ItemView: React.ComponentType<ViewProps<any>>
}

export function FormattedInfoView({ info, handleSave, annotations, removeAnnotation, ItemView }: FormatterViewWrapperProps) {
    const data = info[0]?.data
    const form = useForm({
        initialValues: data
      
    });
    useEffect(() => {
        form.setInitialValues(data)
    }, [data])
   


    const debouncedSave = useDebouncedCallback(async () => {

        console.log("saving", [{...info[0], data: form.values}])

        await handleSave([{...info[0], data: form.values}])
        

    }, 600)

    async function handleChildFormChange()  {
        try {
            console.log('got change')
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
        <>
            <AnnotationsList
                annotations={annotations}
                removeAnnotation={removeAnnotation}
            />
            <form onChange={handleChildFormChange}>
                {<ItemView form={form} onChange={handleChildFormChange} />}
            </form>
        </>

    )
}